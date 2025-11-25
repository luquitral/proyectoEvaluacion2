// src/api/xano.js - Módulo para interactuar con la API de Xano
// Este archivo contiene todas las funciones necesarias para comunicarse con el backend de Xano

import axios from "axios";

const STORE_BASE = import.meta.env.VITE_XANO_STORE_BASE;
const AUTH_BASE = import.meta.env.VITE_XANO_AUTH_BASE;
const ACCOUNT_BASE = import.meta.env.VITE_XANO_ACCOUNT_BASE || import.meta.env.VITE_XANO_MEMBERS_BASE || '';

export const makeAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

export async function createProduct(token, payload) {
  const config = token ? { headers: { ...makeAuthHeader(token), "Content-Type": "application/json" } } : { headers: { "Content-Type": "application/json" } }
  const { data } = await axios.post(`${STORE_BASE}/product`, payload, config)
  return data;
}

export async function uploadImages(token, files) {
  const fd = new FormData();
  for (const f of files) fd.append("content[]", f);
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  const { data } = await axios.post(`${STORE_BASE}/upload/image`, fd, config)
  const arr = Array.isArray(data) ? data : (data.files || [])
  return arr
}

export async function attachImagesToProduct(token, productId, imagesFullArray) {
  const config = token ? { headers: { ...makeAuthHeader(token), "Content-Type": "application/json" } } : { headers: { "Content-Type": "application/json" } }
  const { data } = await axios.patch(`${STORE_BASE}/product/${productId}`, { images: imagesFullArray }, config)
  return data
}

export async function listProducts({ token, limit = 12, offset = 0, q = "" } = {}) {
  const params = {};
  if (limit != null) params.limit = limit;
  if (offset != null) params.offset = offset;
  if (q) params.q = q;

  const config = token ? { headers: { ...makeAuthHeader(token) }, params } : { params }
  const { data } = await axios.get(`${STORE_BASE}/product`, config)

  return Array.isArray(data) ? data : (data?.items ?? []);
}

export async function deleteProduct(token, productId) {
  const res = await axios.delete(`${STORE_BASE}/product/${productId}`, { headers: { ...makeAuthHeader(token) } })
  return res.data
}

export async function updateProduct(token, productId, payload) {
  const { data } = await axios.patch(`${STORE_BASE}/product/${productId}`, payload, { headers: { ...makeAuthHeader(token) } })
  return data
}

export async function getProduct(productId, token) {
  const config = token ? { headers: { ...makeAuthHeader(token) } } : {}
  const { data } = await axios.get(`${STORE_BASE}/product/${productId}`, config)
  return data
}

// Orders API
export async function listOrders({ token, user_id, status, limit, offset } = {}) {
  const params = {}
  if (user_id != null) params.user_id = user_id
  if (status) params.status = status
  if (limit != null) params.limit = limit
  if (offset != null) params.offset = offset
  const config = token ? { headers: { ...makeAuthHeader(token) }, params } : { params }
  const { data } = await axios.get(`${STORE_BASE}/order`, config)
  return Array.isArray(data) ? data : (data?.items ?? [])
}

export async function createOrder(token, payload) {
  const config = token ? { headers: { ...makeAuthHeader(token), 'Content-Type': 'application/json' } } : { headers: { 'Content-Type': 'application/json' } }
  const { data } = await axios.post(`${STORE_BASE}/order`, payload, config)
  return data
}

export async function getOrder(orderId, token) {
  const config = token ? { headers: { ...makeAuthHeader(token) } } : {}
  const { data } = await axios.get(`${STORE_BASE}/order/${orderId}`, config)
  return data
}

export async function updateOrder(token, orderId, payload) {
  const config = token ? { headers: { ...makeAuthHeader(token), 'Content-Type': 'application/json' } } : { headers: { 'Content-Type': 'application/json' } }
  const { data } = await axios.patch(`${STORE_BASE}/order/${orderId}`, payload, config)
  return data
}

export async function deleteOrder(token, orderId) {
  const config = token ? { headers: { ...makeAuthHeader(token) } } : {}
  const res = await axios.delete(`${STORE_BASE}/order/${orderId}`, config)
  return res.data
}

// Order products
export async function createOrderProduct(token, payload) {
  const config = token ? { headers: { ...makeAuthHeader(token), 'Content-Type': 'application/json' } } : { headers: { 'Content-Type': 'application/json' } }
  const { data } = await axios.post(`${STORE_BASE}/order_product`, payload, config)
  return data
}

export async function listOrderProducts(token, orderId) {
  const params = orderId ? { order_id: orderId } : {}
  const config = token ? { headers: { ...makeAuthHeader(token) }, params } : { params }
  const { data } = await axios.get(`${STORE_BASE}/order_product`, config)
  return Array.isArray(data) ? data : (data?.items ?? [])
}

// Shipping (if available)
export async function createShipping(token, payload) {
  const config = token ? { headers: { ...makeAuthHeader(token), 'Content-Type': 'application/json' } } : { headers: { 'Content-Type': 'application/json' } }
  const { data } = await axios.post(`${STORE_BASE}/shipping`, payload, config)
  return data
}

// -----------------
// Cart related APIs
// -----------------
// Obtiene (o crea si no existe) el carrito del usuario (se asume que backend permite filter by user_id)
export async function getOrCreateCart(token) {
  // Intentamos obtener carrito del usuario autenticado
  try {
    const config = token ? { headers: { ...makeAuthHeader(token) } } : {}
    const res = await axios.get(`${STORE_BASE}/cart`, config)
    const carts = Array.isArray(res.data) ? res.data : (res.data?.items ?? [])
    if (carts.length > 0) return carts[0]
    // Si no hay, creamos uno
    const createConfig = token ? { headers: { ...makeAuthHeader(token) } } : {}
    const { data } = await axios.post(`${STORE_BASE}/cart`, {}, createConfig)
    return data
  } catch (e) {
    throw e
  }
}

export async function addCartProduct(token, cartId, productId, quantity = 1) {
  const config = token ? { headers: { ...makeAuthHeader(token) } } : {}
  const { data } = await axios.post(`${STORE_BASE}/cart_product`, { cart_id: cartId, product_id: productId, quantity }, config)
  return data
}

export async function updateCartProduct(token, cartProductId, quantity) {
  const config = token ? { headers: { ...makeAuthHeader(token) } } : {}
  const { data } = await axios.patch(`${STORE_BASE}/cart_product/${cartProductId}`, { quantity }, config)
  return data
}

export async function removeCartProduct(token, cartProductId) {
  const config = token ? { headers: { ...makeAuthHeader(token) } } : {}
  const res = await axios.delete(`${STORE_BASE}/cart_product/${cartProductId}`, config)
  return res.data
}

export async function listCartProducts(token, cartId) {
  const config = token ? { headers: { ...makeAuthHeader(token) }, params: { cart_id: cartId } } : { params: { cart_id: cartId } }
  const { data } = await axios.get(`${STORE_BASE}/cart_product`, config)
  return Array.isArray(data) ? data : (data?.items ?? [])
}

// -----------------
// Users (Admin/Account) helpers
// -----------------

// Lista miembros del equipo (mismo account) desde Members & Accounts
export async function listTeamMembers(token) {
  if (!ACCOUNT_BASE) throw new Error('ACCOUNT_BASE no configurado (.env: VITE_XANO_ACCOUNT_BASE)')
  // Usamos el endpoint /user que es más genérico para listar todos los usuarios.
  // El endpoint /account/my_team_members requiere que el admin pertenezca a una "cuenta".
  const { data } = await axios.get(`${ACCOUNT_BASE}/user`, { headers: { ...makeAuthHeader(token) } })
  // Estructura esperada: array de usuarios o {items:[...]}
  return Array.isArray(data) ? data : (data?.items ?? [])
}

// Cambia el rol de un usuario (admin only)
export async function adminUpdateUserRole(token, userId, role) {
  if (!ACCOUNT_BASE) throw new Error('ACCOUNT_BASE no configurado (.env: VITE_XANO_ACCOUNT_BASE)')
  const { data } = await axios.post(`${ACCOUNT_BASE}/admin/user_role`, { user_id: userId, role }, { headers: { ...makeAuthHeader(token) } })
  return data
}

// Crea un usuario usando el signup del grupo de autenticación y asigna rol opcional
export async function adminCreateUser(adminToken, { name, email, password, role }) {
  if (!AUTH_BASE) throw new Error('AUTH_BASE no configurado (.env: VITE_XANO_AUTH_BASE)')
  // 1) Crear usuario vía signup (no tocar token del admin)
  const signupRes = await axios.post(`${AUTH_BASE}/auth/signup`, { name, email, password })
  const newUserToken = signupRes.data?.authToken || signupRes.data?.token || signupRes.data?.jwt || signupRes.data?.access_token
  let createdUser = null
  // 2) Obtener user recién creado usando su token en /auth/me (según spec devuelve { user: {...} })
  try {
    const meRes = await axios.get(`${AUTH_BASE}/auth/me`, { headers: { Authorization: `Bearer ${newUserToken}` } })
    createdUser = meRes.data?.user || meRes.data || null
  } catch {}
  // 3) Si hay rol y ACCOUNT_BASE, actualizamos rol usando token del admin
  if (role && createdUser?.id && ACCOUNT_BASE) {
    try { await axios.post(`${ACCOUNT_BASE}/admin/user_role`, { user_id: createdUser.id, role }, { headers: { ...makeAuthHeader(adminToken) } }) } catch {}
    // Refrescamos el user con el nuevo rol (best-effort)
    if (createdUser) createdUser.role = role
  }
  return { user: createdUser, raw: signupRes.data }
}

// Eliminar usuario: requiere que crees un endpoint admin en Xano; aquí dejamos placeholder
export async function adminDeleteUser(adminToken, userId) {
  if (!ACCOUNT_BASE) throw new Error('ACCOUNT_BASE no configurado (.env: VITE_XANO_ACCOUNT_BASE)')
  if (!adminToken) throw new Error('adminToken es requerido')
  const res = await axios.delete(`${ACCOUNT_BASE}/user/${userId}`, { headers: { ...makeAuthHeader(adminToken) } })
  return res.data
}

// -----------------
// Account / User helpers (Members & Accounts group)
// -----------------
export async function createAccount(token, payload) {
  if (!ACCOUNT_BASE) throw new Error('ACCOUNT_BASE no configurado (.env: VITE_XANO_ACCOUNT_BASE)')
  const config = token ? { headers: { ...makeAuthHeader(token), 'Content-Type': 'application/json' } } : { headers: { 'Content-Type': 'application/json' } }
  const { data } = await axios.post(`${ACCOUNT_BASE}/account`, payload, config)
  return data
}

export async function getAccountDetails(token) {
  if (!ACCOUNT_BASE) throw new Error('ACCOUNT_BASE no configurado (.env: VITE_XANO_ACCOUNT_BASE)')
  const { data } = await axios.get(`${ACCOUNT_BASE}/account/details`, { headers: { ...makeAuthHeader(token) } })
  return data
}

export async function getMyTeamMembers(token) {
  if (!ACCOUNT_BASE) throw new Error('ACCOUNT_BASE no configurado (.env: VITE_XANO_ACCOUNT_BASE)')
  const { data } = await axios.get(`${ACCOUNT_BASE}/account/my_team_members`, { headers: { ...makeAuthHeader(token) } })
  return Array.isArray(data) ? data : (data?.items ?? [])
}

export async function listUsers(token, params = {}) {
  if (!ACCOUNT_BASE) throw new Error('ACCOUNT_BASE no configurado (.env: VITE_XANO_ACCOUNT_BASE)')
  const config = token ? { headers: { ...makeAuthHeader(token) }, params } : { params }
  const { data } = await axios.get(`${ACCOUNT_BASE}/user`, config)
  return Array.isArray(data) ? data : (data?.items ?? [])
}

export async function createUser(token, payload) {
  if (!ACCOUNT_BASE) throw new Error('ACCOUNT_BASE no configurado (.env: VITE_XANO_ACCOUNT_BASE)')
  const config = token ? { headers: { ...makeAuthHeader(token), 'Content-Type': 'application/json' } } : { headers: { 'Content-Type': 'application/json' } }
  const { data } = await axios.post(`${ACCOUNT_BASE}/user`, payload, config)
  return data
}

export async function getUser(token, userId) {
  if (!ACCOUNT_BASE) throw new Error('ACCOUNT_BASE no configurado (.env: VITE_XANO_ACCOUNT_BASE)')
  const { data } = await axios.get(`${ACCOUNT_BASE}/user/${userId}`, { headers: { ...makeAuthHeader(token) } })
  return data
}

export async function deleteUser(token, userId) {
  if (!ACCOUNT_BASE) throw new Error('ACCOUNT_BASE no configurado (.env: VITE_XANO_ACCOUNT_BASE)')
  const res = await axios.delete(`${ACCOUNT_BASE}/user/${userId}`, { headers: { ...makeAuthHeader(token) } })
  return res.data
}

export async function updateUser(token, userId, payload) {
  if (!ACCOUNT_BASE) throw new Error('ACCOUNT_BASE no configurado (.env: VITE_XANO_ACCOUNT_BASE)')
  const { data } = await axios.put(`${ACCOUNT_BASE}/user/${userId}`, payload, { headers: { ...makeAuthHeader(token), 'Content-Type': 'application/json' } })
  return data
}

export async function editProfile(token, payload) {
  if (!ACCOUNT_BASE) throw new Error('ACCOUNT_BASE no configurado (.env: VITE_XANO_ACCOUNT_BASE)')
  const { data } = await axios.patch(`${ACCOUNT_BASE}/user/edit_profile`, payload, { headers: { ...makeAuthHeader(token), 'Content-Type': 'application/json' } })
  return data
}
