import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { getOrCreateCart, addCartProduct, listCartProducts, updateCartProduct, removeCartProduct, getProduct } from '../api/xano'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { token, user } = useAuth()
  const [cart, setCart] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Helpers para carrito invitado y autenticado en localStorage
  const GUEST_KEY = 'guest_cart_items'
  const readGuest = () => {
    try { return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]') } catch { return [] }
  }
  const writeGuest = (arr) => {
    localStorage.setItem(GUEST_KEY, JSON.stringify(arr || []))
  }
  const authKey = user ? `auth_cart_${user.id}` : null
  const readAuth = () => {
    if (!authKey) return []
    try { return JSON.parse(localStorage.getItem(authKey) || '[]') } catch { return [] }
  }
  const writeAuth = (arr) => {
    if (!authKey) return
    localStorage.setItem(authKey, JSON.stringify(arr || []))
  }

  // Ref para evitar múltiples sincronizaciones simultáneas
  const syncingRef = useRef(false)

  // Cargar carrito cuando cambia token / usuario
  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        if (!token) {
          setCart(null)
          setItems(readGuest())
          return
        }

        // Mostrar inmediatamente copia local autenticada si existe
        const localAuthItems = readAuth()
        if (localAuthItems.length > 0) {
          setItems(localAuthItems)
        }

        // Crear / obtener carrito backend
        const c = await getOrCreateCart(token)
        if (!mounted) return
        setCart(c)

        // Migrar carrito invitado si hay items
        const guestItems = readGuest()
        if (guestItems.length > 0) {
          for (const gi of guestItems) {
            const pid = gi.productId || gi.product_id || gi.product?.id
            const qty = gi.quantity || 1
            if (!pid) continue
            try { await addCartProduct(token, c.id, pid, qty) } catch (e) { console.warn('Guest migrate fail', e?.message) }
          }
          writeGuest([])
        }

        // Sincronizar backend real
        let backendItems = await listCartProducts(token, c?.id)
        if (!mounted) return
        const needFetch = backendItems.filter(it => !it.product && it.product_id)
        if (needFetch.length > 0) {
          const uniqIds = [...new Set(needFetch.map(i => i.product_id))]
          const fetched = await Promise.all(uniqIds.map(id => getProduct(id, token).catch(() => null)))
          const map = new Map()
          uniqIds.forEach((id, idx) => { if (fetched[idx]) map.set(id, fetched[idx]) })
          backendItems = backendItems.map(it => it.product || !it.product_id ? it : { ...it, product: map.get(it.product_id) || it.product })
        }
        setItems(backendItems || [])
        writeAuth(backendItems || [])
      } catch (e) {
        console.error('Cart load error', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [token, user?.id])

  // Función de sincronización diferida (consolidar estado local -> backend)
  async function syncBackend() {
    if (!token || !cart?.id) return
    if (syncingRef.current) return
    syncingRef.current = true
    try {
      // Obtener estado backend actual
      let backendItems = await listCartProducts(token, cart.id)
      const backendByProduct = new Map()
      backendItems.forEach(it => backendByProduct.set(it.product_id, it))
      // Preparar operaciones
      for (const local of items) {
        const pid = local.product_id || local.productId || local.product?.id
        if (!pid) continue
        const backendMatch = backendByProduct.get(pid)
        if (!backendMatch) {
          // Añadir nuevo
          try { await addCartProduct(token, cart.id, pid, local.quantity || 1) } catch (e) { console.warn('sync add fail', e?.message) }
        } else {
          // Actualizar cantidad si difiere
            const bQty = backendMatch.quantity || 1
            const lQty = local.quantity || 1
            if (bQty !== lQty) {
              try { await updateCartProduct(token, backendMatch.id, lQty) } catch (e) { console.warn('sync update fail', e?.message) }
            }
        }
      }
      // Eliminar en backend los que faltan local (solo si explícitamente removidos)
      const localProductIds = new Set(items.map(it => it.product_id || it.productId || it.product?.id))
      for (const b of backendItems) {
        if (!localProductIds.has(b.product_id)) {
          try { await removeCartProduct(token, b.id) } catch (e) { console.warn('sync remove fail', e?.message) }
        }
      }
      // Refrescar final
      backendItems = await listCartProducts(token, cart.id)
      const needFetch2 = backendItems.filter(it => !it.product && it.product_id)
      if (needFetch2.length > 0) {
        const uniqIds = [...new Set(needFetch2.map(i => i.product_id))]
        const fetched = await Promise.all(uniqIds.map(id => getProduct(id, token).catch(() => null)))
        const map = new Map()
        uniqIds.forEach((id, idx) => { if (fetched[idx]) map.set(id, fetched[idx]) })
        backendItems = backendItems.map(it => it.product || !it.product_id ? it : { ...it, product: map.get(it.product_id) || it.product })
      }
      setItems(backendItems || [])
      writeAuth(backendItems || [])
    } catch (e) {
      console.error('syncBackend error', e)
    } finally {
      syncingRef.current = false
    }
  }

  async function add(productOrId, quantity = 1) {
    const productId = typeof productOrId === 'object' ? productOrId.id : productOrId
    const productObj = typeof productOrId === 'object' ? productOrId : undefined
    if (!token) {
      const current = readGuest()
      const idx = current.findIndex(it => it.productId === productId)
      if (idx >= 0) current[idx].quantity = (current[idx].quantity || 0) + quantity
      else current.push({ id: `guest-${productId}`, productId, quantity, product: productObj })
      writeGuest(current)
      setItems(current)
      return { id: `guest-${productId}`, productId, quantity }
    }
    // Optimista autenticado
    setItems(prev => {
      const existing = prev.find(it => (it.product_id || it.productId || it.product?.id) === productId)
      if (existing) {
        return prev.map(it => (it === existing ? { ...it, quantity: (it.quantity || 0) + quantity } : it))
      }
      return [...prev, { id: `local-${productId}`, product_id: productId, quantity, product: productObj }]
    })
    writeAuth(items)
    // Persistencia asincrónica
    ;(async () => {
      try {
        let currentCart = cart
        if (!currentCart) {
          currentCart = await getOrCreateCart(token)
          setCart(currentCart)
        }
        const added = await addCartProduct(token, currentCart.id, productId, quantity)
        // Reemplazar id local por id backend
        setItems(prev => prev.map(it => it.id === `local-${productId}` ? { ...added, product: productObj } : it))
        writeAuth(items)
        // Sincronizar en lote diferido
        syncBackend()
      } catch (e) {
        console.warn('Add backend fail', e?.message)
      }
    })()
  }

  async function setQuantity(itemId, quantity) {
    const newQuantity = Math.max(1, Number(quantity) || 1)
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, quantity: newQuantity } : it))
    if (!token) {
      const current = readGuest().map(it => it.id === itemId ? { ...it, quantity: newQuantity } : it)
      writeGuest(current)
      return
    }
    writeAuth(items)
    ;(async () => {
      try { await updateCartProduct(token, itemId, newQuantity); syncBackend() } catch (e) { console.warn('Qty backend fail', e?.message) }
    })()
  }

  async function remove(itemId) {
    if (!token) {
      const current = readGuest().filter(it => it.id !== itemId)
      writeGuest(current)
      setItems(current)
      return
    }
    // Optimista
    setItems(prev => prev.filter(it => it.id !== itemId))
    writeAuth(items)
    ;(async () => {
      try { await removeCartProduct(token, itemId); syncBackend() } catch (e) { console.warn('Remove backend fail', e?.message) }
    })()
  }

  const total = items.reduce((s, it) => s + ((it.price ?? it.product?.price ?? 0) * (it.quantity || 1)), 0)

  return (
    <CartContext.Provider value={{ cart, items, loading, add, setQuantity, remove, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
