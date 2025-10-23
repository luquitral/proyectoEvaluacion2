import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listProducts, deleteProduct, updateProduct, createProduct, listTeamMembers, adminUpdateUserRole, adminCreateUser } from '../api/xano'

export default function AdminPanel() {
  const { token, user } = useAuth()
  const [active, setActive] = useState('products') // 'products' | 'users'

  // Productos
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [newProd, setNewProd] = useState({ name: '', brand: '', price: '' })

  // Usuarios
  const [team, setTeam] = useState([])
  const [uLoading, setULoading] = useState(false)
  const [uErr, setUErr] = useState('')
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' })

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) return
      if (active === 'products') {
        setLoading(true)
        try {
          const data = await listProducts({ token, limit: 100 })
          if (!mounted) return
          setItems(data)
        } catch (e) {
          setErr(e.message || 'Error')
        } finally { if (mounted) setLoading(false) }
      } else if (active === 'users') {
        setULoading(true)
        try {
          const members = await listTeamMembers(token)
          if (!mounted) return
          setTeam(members)
        } catch (e) {
          setUErr(e.message || 'Error al cargar usuarios')
        } finally { if (mounted) setULoading(false) }
      }
    }
    void load()
    return () => { mounted = false }
  }, [token, active])

  if (!user || !(user.role === 'admin' || user.is_admin === true)) return <div className="container py-4">Acceso denegado. Necesitas ser administrador.</div>

  async function handleDelete(id) {
    if (!confirm('Eliminar producto?')) return
    try { await deleteProduct(token, id); setItems(items.filter(i => i.id !== id)) } catch (e) { alert('Error al eliminar') }
  }

  async function handleEdit(item) {
    const name = prompt('Nombre', item.name)
    if (name == null) return
    try { const updated = await updateProduct(token, item.id, { name }); setItems(items.map(i => i.id === item.id ? updated : i)) } catch (e) { alert('Error al actualizar') }
  }

  async function handleCreateProduct(e) {
    e.preventDefault()
    try {
      const price = Number(newProd.price) || 0
      const created = await createProduct(token, { name: newProd.name, brand: newProd.brand, price })
      setItems([created, ...items])
      setNewProd({ name: '', brand: '', price: '' })
    } catch (e) {
      alert('Error al crear producto')
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault()
    try {
      const { user: created } = await adminCreateUser(token, newUser)
      if (created) setTeam([created, ...team])
      setNewUser({ name: '', email: '', password: '', role: 'user' })
    } catch (e) {
      alert(e.message || 'Error al crear usuario (verifica endpoints en Xano)')
    }
  }

  async function handleChangeRole(u, role) {
    try {
      await adminUpdateUserRole(token, u.id, role)
      setTeam(team.map(x => x.id === u.id ? { ...x, role } : x))
    } catch (e) {
      alert('No se pudo actualizar el rol (revisa permisos y endpoint admin/user_role)')
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <aside className="col-12 col-md-3 col-lg-2 mb-3">
          <div className="list-group">
            <button className={`list-group-item list-group-item-action ${active === 'products' ? 'active' : ''}`} onClick={() => setActive('products')}>Productos</button>
            <button className={`list-group-item list-group-item-action ${active === 'users' ? 'active' : ''}`} onClick={() => setActive('users')}>Usuarios</button>
          </div>
        </aside>
        <main className="col-12 col-md-9 col-lg-10">
          <h1>Panel de administración</h1>

          {active === 'products' && (
            <div>
              <h4 className="mt-3">Crear producto</h4>
              <form className="row g-2 mb-4" onSubmit={handleCreateProduct}>
                <div className="col-sm-4">
                  <input className="form-control" placeholder="Nombre" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} required />
                </div>
                <div className="col-sm-4">
                  <input className="form-control" placeholder="Marca" value={newProd.brand} onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })} />
                </div>
                <div className="col-sm-2">
                  <input type="number" min="0" step="0.01" className="form-control" placeholder="Precio" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} />
                </div>
                <div className="col-sm-2 d-grid">
                  <button className="btn btn-success" type="submit">Crear</button>
                </div>
              </form>

              {err && <div className="alert alert-danger">{err}</div>}
              {loading && <div>Cargando productos...</div>}
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
          )}

          {active === 'users' && (
            <div>
              <h4 className="mt-3">Crear usuario</h4>
              <form className="row g-2 mb-4" onSubmit={handleCreateUser}>
                <div className="col-sm-3">
                  <input className="form-control" placeholder="Nombre" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
                </div>
                <div className="col-sm-3">
                  <input type="email" className="form-control" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
                </div>
                <div className="col-sm-3">
                  <input type="password" className="form-control" placeholder="Contraseña" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
                </div>
                <div className="col-sm-2">
                  <select className="form-select" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="user">Usuario</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-sm-1 d-grid">
                  <button className="btn btn-success" type="submit">Crear</button>
                </div>
              </form>

              {uErr && <div className="alert alert-danger">{uErr}</div>}
              {uLoading && <div>Cargando usuarios...</div>}
              <div className="list-group">
                {team.map(u => (
                  <div key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{u.name || u.username || u.email}</div>
                      <div className="small text-muted">{u.email} • id: {u.id}</div>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <select className="form-select form-select-sm" style={{ width: 140 }} value={u.role || 'user'} onChange={(e) => handleChangeRole(u, e.target.value)}>
                        <option value="user">Usuario</option>
                        <option value="admin">Admin</option>
                      </select>
                      {/* Botón eliminar deshabilitado hasta que exista endpoint */}
                      <button className="btn btn-sm btn-outline-danger" disabled title="Configura un endpoint admin para eliminar usuarios en Xano">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
