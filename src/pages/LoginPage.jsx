import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate() // Para redireccionar después del login
  const { loginAxios, createAccount } = useAuth()
  const [isRegister, setIsRegister] = useState(false)

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Register state
  const [name, setName] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setError(null); setSuccess(null); setLoading(true)
    try {
      const { token, user } = await loginAxios({ email, password })
      setSuccess(`Bienvenido ${user?.name || user?.email || 'usuario'}`)
      console.log('Login successful', { token, user })
      // Redirigir al home después de login exitoso
      navigate('/')
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || err.message || 'Error al iniciar sesión')
    } finally { setLoading(false) }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError(null); setSuccess(null); setLoading(true)
    try {
      const { token, user } = await createAccount({ name, email, password })
      setSuccess(`Cuenta creada. Bienvenido ${user?.name || user?.email || 'usuario'}`)
      console.log('Register successful', { token, user })
      // Redirigir al home después de registro exitoso
      navigate('/')
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || err.message || 'Error al crear cuenta')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 540, margin: '2rem auto', padding: '1rem' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <button onClick={() => setIsRegister(false)} className={`btn ${!isRegister ? 'btn-primary' : 'btn-outline-primary'}`}>
          Iniciar sesión
        </button>
        <button onClick={() => setIsRegister(true)} className={`btn ${isRegister ? 'btn-primary' : 'btn-outline-primary'}`}>
          Crear cuenta
        </button>
      </div>

      {!isRegister ? (
        <form onSubmit={handleLogin}>
          <h3>Iniciar sesión</h3>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 8 }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: 8 }} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <h3>Crear cuenta</h3>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: 8 }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: 8 }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: 8 }} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-success">{loading ? 'Creando...' : 'Crear cuenta'}</button>
        </form>
      )}

      {error && <div className="mt-3 text-danger">{error}</div>}
      {success && <div className="mt-3 text-success">{success}</div>}
    </div>
  )
}
