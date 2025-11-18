// Importamos createContext y useState/useEffect para gestionar el estado global de autenticación
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
// Importamos axios para una de las formas de llamar al API
import axios from 'axios'

// URLs base para los endpoints de Xano — leídas desde variables de entorno de Vite con fallback
const AUTH_BASE = import.meta.env.VITE_XANO_AUTH_BASE || 'https://x8ki-letl-twmt.n7.xano.io/api:PDQSRKQT'
const STORE_BASE = import.meta.env.VITE_XANO_STORE_BASE || 'https://x8ki-letl-twmt.n7.xano.io/api:3Xncgo9I'
const MEMBERS_BASE = import.meta.env.VITE_XANO_MEMBERS_BASE || import.meta.env.VITE_XANO_ACCOUNT_BASE || ''
// TTL de respaldo para tokens JWE sin 'exp' legible (por defecto 86400s)
const TOKEN_TTL_SEC = 86400 // 24 horas en segundos
// Lista opcional de emails admin (fallback mientras /auth/me se corrige)
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

// Creamos el contexto de autenticación
const AuthContext = createContext(null) // Contexto que compartirá usuario, token y acciones

// Función auxiliar para decodificar un JWT y obtener su payload (incluye 'exp' si existe)
function decodeJwt(token) {
  // Si no hay token, devolvemos null
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    // Normalizamos Base64URL y agregamos padding
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = payload.length % 4
    if (pad) payload += '='.repeat(4 - pad)
    const json = atob(payload)
    return JSON.parse(json)
  } catch {
    // Si falla la decodificación, devolvemos null
    return null
  }
}

// Proveedor del contexto que envuelve la aplicación
export function AuthProvider({ children }) {
  // Estado para el token JWT
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '') // Inicializamos desde localStorage
  // Estado para el usuario (nombre u otros datos)
  const [user, setUser] = useState(() => {
    // Intentamos leer el usuario del almacenamiento
    const raw = localStorage.getItem('auth_user') // Obtenemos cadena guardada
    return raw ? JSON.parse(raw) : null // Parseamos o null si no existe
  })
  // Estado para el instante de expiración del token en milisegundos
  const [expiresAt, setExpiresAt] = useState(() => {
    // Leemos expiración guardada si existe
    const raw = localStorage.getItem('auth_exp') // Obtenemos cadena de tiempo
    return raw ? Number(raw) : null // Convertimos a número o null
  })

  // Efecto: cada vez que cambie el token, actualizamos expiración leyendo el JWT o usando TTL
  useEffect(() => {
    // Si no hay token, limpiamos todo y salimos
    if (!token) {
      localStorage.removeItem('auth_token')
      setExpiresAt(null)
      localStorage.removeItem('auth_exp')
      return
    }

    // Persistimos el token
    localStorage.setItem('auth_token', token)

    // Intentamos decodificar (JWT). Si no hay exp, usamos TTL de respaldo
    const payload = decodeJwt(token)
    let expMs = payload?.exp ? payload.exp * 1000 : null
    if (!expMs) expMs = Date.now() + (TOKEN_TTL_SEC * 1000)

    // Guardamos expiración en estado y almacenamiento
    setExpiresAt(expMs)
    localStorage.setItem('auth_exp', String(expMs))
  }, [token])

  // Efecto: persistimos el usuario cada vez que cambie
  useEffect(() => {
    // Si hay usuario, lo guardamos; si no, removemos
    if (user) localStorage.setItem('auth_user', JSON.stringify(user)) // Guardamos usuario
    else localStorage.removeItem('auth_user') // Eliminamos usuario
  }, [user])

  // Función auxiliar: cabeceras de autorización
  const makeAuthHeader = (t) => ({ Authorization: `Bearer ${t}` }) // Construimos header Bearer

  // (Opcional) Si en algún momento necesitas buscar por email, agrega un endpoint dedicado en Xano.

  // Normaliza y enriquece el usuario con banderas de admin si aplica
  function normalizeUser(u) {
    if (!u) return u
    const email = (u.email || '').toLowerCase()
    const isAdminByRole = u.role === 'admin' || u.is_admin === true
    const isAdminByEnv = email && ADMIN_EMAILS.includes(email)
    return { ...u, is_admin: isAdminByRole || isAdminByEnv, role: (isAdminByRole || isAdminByEnv) ? (u.role || 'admin') : u.role }
  }

  // Extrae el objeto usuario desde diferentes formas de respuesta
  function extractUserPayload(meData) {
    if (!meData) return null
    // Backend actualizado: { user: { ... } }
    if (meData.user && typeof meData.user === 'object') return meData.user
    // Fall-back: si ya es el user directo
    return meData
  }

  // Intenta obtener el perfil del usuario autenticado probando múltiples endpoints
  async function getMeWithFallback(tkn) {
    const bases = [AUTH_BASE, MEMBERS_BASE].filter(Boolean)
    const paths = ['auth/me', 'me', 'account/me']
    const tried = new Set()
    for (const base of bases) {
      for (const path of paths) {
        const url = `${base}/${path}`
        if (tried.has(url)) continue
        tried.add(url)
        try {
          const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${tkn}` } })
          const userObj = extractUserPayload(data)
          if (userObj) return userObj
        } catch (e) {
          const status = e?.response?.status
          // Si el token es inválido/expirado, cerrar sesión y redirigir a login
          if (status === 401) {
            try { await logoutAxios() } catch {}
            // Redirigir inmediatamente a la página de inicio de sesión
            try { window.location.assign('/login') } catch {}
            // Re-lanzamos para cortar el flujo de login
            throw e
          }
          // Continuamos intentando si es 404/401/500; si es otra cosa, también seguimos
          continue
        }
      }
    }
    return null
  }

  // Login usando Axios
  async function loginAxios({ email, password }) {
    try {
      // 1) Login: obtener token
      const { data } = await axios.post(`${AUTH_BASE}/auth/login`, { email, password })
      const newToken = data?.authToken || data?.token || data?.jwt || data?.access_token || ''
      if (!newToken) throw new Error('No token returned from login')

      // Persistir token primero (esto disparará el efecto de expiración también)
      setToken(newToken)

      // 2) Obtener datos del usuario autenticado con fallback de endpoints
      let me = await getMeWithFallback(newToken)
      if (!me) {
        // Si falla todo, usamos un user mínimo
        me = data?.user || data?.profile || { email }
      }
  
  // 3) Verificar si el usuario está bloqueado
  if (me?.status === 'blocked') {
    // Limpiar el token y datos antes de lanzar el error
    setToken('')
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_exp')
    const blockedError = new Error('Su cuenta ha sido bloqueada. Comuníquese con soporte soporete@404store.com')
    blockedError.isBlocked = true
    throw blockedError
  }
  
  const normalized = normalizeUser(me)
  setUser(normalized)
  return { token: newToken, user: normalized }
    } catch (error) {
      console.error('Error de login:', error?.response?.data || error.message)
      throw error
    }
  }

  // Logout usando Axios
  async function logoutAxios() {
    // Limpiamos estados y almacenamiento (evitamos 404 si no hay endpoint logout)
    setToken('') // Quitamos token
    setUser(null) // Quitamos usuario
    setExpiresAt(null) // Quitamos expiración
    localStorage.removeItem('auth_token') // Borramos token
    localStorage.removeItem('auth_user') // Borramos usuario
    localStorage.removeItem('auth_exp') // Borramos expiración
  }

  // Crear cuenta / registro (Xano - endpoint puede variar)
  async function createAccount({ name, email, password }) {
    try {
      // En el template de Xano, el endpoint es /auth/signup
      const { data } = await axios.post(`${AUTH_BASE}/auth/signup`, { name, email, password })
      const newToken = data?.authToken || data?.token || data?.jwt || data?.access_token || ''
      if (newToken) setToken(newToken)
      // Intentar obtener perfil tras el signup
      let me = await getMeWithFallback(newToken)
      if (!me) me = data?.user || { name, email }
  
  // Verificar si el usuario está bloqueado
  if (me?.status === 'blocked') {
    // Limpiar el token y datos antes de lanzar el error
    setToken('')
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_exp')
    const blockedError = new Error('Su cuenta ha sido bloqueada. Comuníquese con soporte soporete@404store.com')
    blockedError.isBlocked = true
    throw blockedError
  }
  
  const normalized = normalizeUser(me)
  setUser(normalized)
  return { token: newToken, user: normalized, raw: data }
    } catch (err) {
      // Re-lanzamos para que la UI gestione el error
      throw err
    }
  }


  // Renovación del token usando Axios (endpoint puede variar en Xano)
  async function refreshAxios() {
    // Intentamos pedir un nuevo token al backend
    const { data } = await axios.post(`${AUTH_BASE}/auth/refresh_token`, {}, { headers: makeAuthHeader(token) }) // Petición
    // Extraemos el token renovado
    const newToken = data?.authToken || data?.token || data?.jwt || '' // Nuevo token
    // Actualizamos token en estado
    setToken(newToken) // Guardamos nuevo token
    // Retornamos el token por si se necesita
    return newToken // Devolvemos el nuevo token
  }

  // (Removed) Fetch-based refresh function. Usamos solo Axios para renovar token.

  // Efecto: programamos un aviso antes de la expiración del token
  useEffect(() => {
    // Si no hay expiración, no programamos nada
    if (!expiresAt) return // Salimos
    // Calculamos margen de aviso (2 minutos antes de expirar)
    const MARGIN_MS = 2 * 60 * 1000 // Dos minutos
    // Calculamos tiempo restante
    const remaining = expiresAt - Date.now() // Tiempo hasta expirar
    // Si ya está por expirar o vencido, disparamos inmediatamente
    const delay = Math.max(remaining - MARGIN_MS, 0) // Tiempo para el aviso
    // Creamos un temporizador
    const id = setTimeout(async () => {
      // Mostramos confirmación al usuario
      const ok = window.confirm('Tu sesión está por expirar. ¿Deseas continuar y renovar el token?') // Diálogo
      // Si acepta, intentamos renovar
      if (ok) {
        try {
          // Renovamos token usando Axios. Si falla, cerramos sesión.
          await refreshAxios()
        } catch (e) {
          // Si falla, notificamos y cerramos sesión
          alert('No fue posible renovar el token. Se cerrará la sesión.')
          await logoutAxios()
        }
      }
    }, delay) // Programamos el aviso
    // Limpiamos el temporizador al cambiar dependencias
    return () => clearTimeout(id) // Cleanup
  }, [expiresAt])

  // Construimos el valor del contexto con memo para evitar renders innecesarios
  const value = useMemo(() => ({
    token, // Token actual
    user, // Usuario actual
    expiresAt, // Momento de expiración
    setToken, // Setter de token (por si se necesita)
    setUser, // Setter de usuario
    loginAxios, // Función de login con Axios
    logoutAxios, // Función de logout con Axios,
    createAccount, // Función para crear cuenta
  }), [token, user, expiresAt]);

  // Renderizamos el proveedor con el valor calculado
  return (
    // Proveedor del contexto
    <AuthContext.Provider value={value}>
      {/* Contenido de la aplicación envuelta */}
      {children}
    </AuthContext.Provider>
  )
}

// Hook para consumir el contexto de autenticación desde cualquier componente
export function useAuth() {
  // Obtenemos el contexto
  const ctx = useContext(AuthContext) // Leemos el valor de contexto
  // Si no existe, lanzamos un error para ayudar en desarrollo
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>') // Validación
  // Devolvemos el contexto
  return ctx // Valor con token, usuario y acciones
}