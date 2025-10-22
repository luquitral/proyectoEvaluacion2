import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listProducts, deleteProduct, updateProduct } from '../api/xano'
import { Link } from 'react-router-dom'

export default function AdminPanel() {
  const { token, user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) return
      setLoading(true)
      try {
        const data = await listProducts({ token, limit: 100 })
        if (!mounted) return
        setItems(data)
      } catch (e) {
        setErr(e.message || 'Error')
      } finally { if (mounted) setLoading(false) }
    }
    void load()
    return () => { mounted = false }
  }, [token])

  if (!user || user.role !== 'admin') return <div className="container py-4">Acceso denegado. Necesitas ser administrador.</div>

  async function handleDelete(id) {
    if (!confirm('Eliminar producto?')) return
    try { await deleteProduct(token, id); setItems(items.filter(i => i.id !== id)) } catch (e) { alert('Error al eliminar') }
  }

  async function handleEdit(item) {
    const name = prompt('Nombre', item.name)
    if (name == null) return
    try { const updated = await updateProduct(token, item.id, { name }); setItems(items.map(i => i.id === item.id ? updated : i)) } catch (e) { alert('Error al actualizar') }
  }

  return (
    <div className="container py-4">
      <h1>Panel de administración</h1>
      <div className="mb-3">
        <Link to="/crear-productos" className="btn btn-success">Crear producto</Link>
      </div>
      {err && <div className="alert alert-danger">{err}</div>}
      {loading && <div>Cargando...</div>}
      <div className="list-group">
        {items.map(p => (
          <div key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold">{p.name}</div>
              <div className="small text-muted">{p.brand} • ${p.price}</div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(p)}>Editar</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
