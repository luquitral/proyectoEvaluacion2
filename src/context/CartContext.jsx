import { createContext, useContext, useEffect, useState } from 'react'
import { getOrCreateCart, addCartProduct, listCartProducts, updateCartProduct, removeCartProduct } from '../api/xano'
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
        const cps = await listCartProducts(token, c?.id)
        if (!mounted) return
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
    let currentCart = cart
    if (!currentCart) {
      currentCart = await getOrCreateCart(token)
      setCart(currentCart)
    }
    const added = await addCartProduct(token, currentCart.id, productId, quantity)
    try {
      const cps = await listCartProducts(token, currentCart.id)
      setItems(cps || [])
    } catch (e) {
      console.info('Could not refresh cart items after add', e?.message || e)
    }
    return added
  }

  async function setQuantity(itemId, quantity) {
    if (!token) {
      const current = readGuest()
      const idx = current.findIndex(it => it.id === itemId)
      if (idx >= 0) {
        current[idx].quantity = Math.max(1, Number(quantity) || 1)
        writeGuest(current)
        setItems(current)
      }
      return
    }
    const updated = await updateCartProduct(token, itemId, quantity)
    try {
      const cps = await listCartProducts(token, cart?.id)
      setItems(cps || [])
    } catch (e) {
      console.info('Could not refresh cart items after update', e?.message || e)
    }
    return updated
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
      const cps = await listCartProducts(token, cart?.id)
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
