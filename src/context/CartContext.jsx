import { createContext, useContext, useEffect, useState } from 'react'
import { getOrCreateCart, addCartProduct, listCartProducts, updateCartProduct, removeCartProduct, getProduct } from '../api/xano'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { token, user } = useAuth()
  const [cart, setCart] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Helpers para carrito invitado en localStorage
  const GUEST_KEY = 'guest_cart_items'
  const readGuest = () => {
    try { return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]') } catch { return [] }
  }
  const writeGuest = (arr) => {
    localStorage.setItem(GUEST_KEY, JSON.stringify(arr || []))
  }

  // Cargar carrito cuando cambia el token (login)
  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        if (!token) {
          // Modo invitado: cargar desde localStorage
          setCart(null)
          setItems(readGuest())
          return
        }
        // Modo autenticado: cargar desde backend
        const c = await getOrCreateCart(token)
        if (!mounted) return
        setCart(c)
        let cps = await listCartProducts(token, c?.id)
        if (!mounted) return
        // Enriquecer items con producto si no viene anidado
        const needFetch = cps.filter(it => !it.product && it.product_id)
        if (needFetch.length > 0) {
          const uniqIds = [...new Set(needFetch.map(i => i.product_id))]
          const fetched = await Promise.all(uniqIds.map(id => getProduct(id, token).catch(() => null)))
          const map = new Map()
          uniqIds.forEach((id, idx) => { if (fetched[idx]) map.set(id, fetched[idx]) })
          cps = cps.map(it => it.product || !it.product_id ? it : { ...it, product: map.get(it.product_id) || it.product })
        }
        setItems(cps || [])
      } catch (e) {
        console.error('Cart load error', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [token])

  async function add(productOrId, quantity = 1) {
    const productId = typeof productOrId === 'object' ? productOrId.id : productOrId
    if (!token) {
      // Modo invitado: guardamos en localStorage
      const current = readGuest()
      const idx = current.findIndex(it => it.productId === productId)
      if (idx >= 0) current[idx].quantity = (current[idx].quantity || 0) + quantity
      else current.push({ id: `guest-${productId}`, productId, quantity, product: typeof productOrId === 'object' ? productOrId : undefined })
      writeGuest(current)
      setItems(current)
      return { id: `guest-${productId}`, productId, quantity }
    }

    // Autenticado: backend
    const existingItem = items.find(it => it.product_id === productId);
    if (existingItem) {
      return setQuantity(existingItem.id, existingItem.quantity + quantity);
    }

    let currentCart = cart
    if (!currentCart) {
      currentCart = await getOrCreateCart(token)
      setCart(currentCart)
    }
    const added = await addCartProduct(token, currentCart.id, productId, quantity)
    try {
      let cps = await listCartProducts(token, currentCart.id)
      // Enriquecer si falta producto
      const needFetch = cps.filter(it => !it.product && it.product_id)
      if (needFetch.length > 0) {
        const uniqIds = [...new Set(needFetch.map(i => i.product_id))]
        const fetched = await Promise.all(uniqIds.map(id => getProduct(id, token).catch(() => null)))
        const map = new Map()
        uniqIds.forEach((id, idx) => { if (fetched[idx]) map.set(id, fetched[idx]) })
        cps = cps.map(it => it.product || !it.product_id ? it : { ...it, product: map.get(it.product_id) || it.product })
      }
      setItems(cps || [])
    } catch (e) {
      console.info('Could not refresh cart items after add', e?.message || e)
    }
    return added
  }

  async function setQuantity(itemId, quantity) {
    const newQuantity = Math.max(1, Number(quantity) || 1);

    // Optimistic UI update
    setItems(prevItems =>
      prevItems.map(it => (it.id === itemId ? { ...it, quantity: newQuantity } : it))
    );

    if (!token) {
      const current = readGuest();
      const idx = current.findIndex(it => it.id === itemId);
      if (idx >= 0) {
        current[idx].quantity = newQuantity;
        writeGuest(current);
      }
      return;
    }

    try {
      await updateCartProduct(token, itemId, newQuantity);
    } catch (e) {
      console.error('Failed to update quantity on backend', e);
      // Optional: Revert state or show error to user
    }
  }

  async function remove(itemId) {
    if (!token) {
      const current = readGuest().filter(it => it.id !== itemId)
      writeGuest(current)
      setItems(current)
      return
    }
    await removeCartProduct(token, itemId)
    try {
      let cps = await listCartProducts(token, cart?.id)
      const needFetch = cps.filter(it => !it.product && it.product_id)
      if (needFetch.length > 0) {
        const uniqIds = [...new Set(needFetch.map(i => i.product_id))]
        const fetched = await Promise.all(uniqIds.map(id => getProduct(id).catch(() => null)))
        const map = new Map()
        uniqIds.forEach((id, idx) => { if (fetched[idx]) map.set(id, fetched[idx]) })
        cps = cps.map(it => it.product || !it.product_id ? it : { ...it, product: map.get(it.product_id) || it.product })
      }
      setItems(cps || [])
    } catch (e) {
      console.info('Could not refresh cart items after remove', e?.message || e)
    }
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
