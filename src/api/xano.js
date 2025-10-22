// src/api/xano.js - Módulo para interactuar con la API de Xano
// Este archivo contiene todas las funciones necesarias para comunicarse con el backend de Xano

import axios from "axios";

const STORE_BASE = import.meta.env.VITE_XANO_STORE_BASE;

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
