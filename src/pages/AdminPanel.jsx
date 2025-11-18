import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  listProducts, deleteProduct, updateProduct, createProduct, 
  listTeamMembers, adminUpdateUserRole, adminCreateUser, 
  uploadImages, attachImagesToProduct, adminDeleteUser,
  listOrders, updateOrder, listOrderProducts, updateUserStatus
} from '../api/xano'
import { formatCLPCurrency } from '../components/priceFormat.jsx'

export default function AdminPanel() {
  const { token, user } = useAuth()
  const [active, setActive] = useState('products') // 'products' | 'users' | 'orders'

  // Productos
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [newProd, setNewProd] = useState({ name: '', brand: '', price: '', description: '', stock: '', category: '' })
  const [newFiles, setNewFiles] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editDrafts, setEditDrafts] = useState({})

  // Usuarios
  const [team, setTeam] = useState([])
  const [uLoading, setULoading] = useState(false)
  const [uErr, setUErr] = useState('')
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' })
  const [userRetryKey, setUserRetryKey] = useState(0)

  // Órdenes
  const [orders, setOrders] = useState([])
  const [oLoading, setOLoading] = useState(false)
  const [oErr, setOErr] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)

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
          const status = e?.response?.status
          if (status === 429) setUErr('Demasiadas solicitudes (429). Espera un momento o pulsa reintentar.')
          else setUErr(e.message || 'Error al cargar usuarios')
        } finally { if (mounted) setULoading(false) }
      } else if (active === 'orders') {
        setOLoading(true)
        setOErr(null)
        try {
          const data = await listOrders({ token, limit: 100 })
          if (!mounted) return
          setOrders(data)
        } catch (e) { 
          if (mounted) setOErr(e?.message || 'Error') 
        } finally { 
          if (mounted) setOLoading(false) 
        }
      }
    }
    void load()
    return () => { mounted = false }
  }, [token, active, userRetryKey])

  if (!user || !(user.role === 'admin' || user.is_admin === true)) return <div className="container py-4">Acceso denegado. Necesitas ser administrador.</div>

  // ---- Productos: acciones ----
  async function handleDelete(id) {
    if (!confirm('Eliminar producto?')) return
    try {
      await deleteProduct(token, id)
      setItems(items.filter(i => i.id !== id))
    } catch (e) {
      alert('Error al eliminar')
    }
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditDrafts(prev => ({ ...prev, [item.id]: { ...item } }))
  }

  function cancelEdit(id) {
    setEditingId(null)
    setEditDrafts(prev => { const copy = { ...prev }; delete copy[id]; return copy })
  }

  async function saveEdit(id) {
    const draft = editDrafts[id]
    if (!draft) return
    try {
      const payload = {
        name: draft.name,
        brand: draft.brand,
        price: Number(draft.price) || 0,
        description: draft.description,
        stock: Number(draft.stock) || 0,
        category: draft.category,
      }
      const updated = await updateProduct(token, id, payload)
      if (draft._newFiles && draft._newFiles.length > 0) {
        const uploaded = await uploadImages(token, draft._newFiles)
        await attachImagesToProduct(token, id, uploaded)
        const refreshed = await listProducts({ token, limit: 100 })
        setItems(refreshed)
      } else {
        setItems(items.map(i => i.id === id ? updated : i))
      }
      cancelEdit(id)
    } catch (e) {
      alert('Error al actualizar')
    }
  }

  async function handleCreateProduct(e) {
    e.preventDefault()
    try {
      const payload = {
        name: newProd.name,
        brand: newProd.brand,
        price: Number(newProd.price) || 0,
        description: newProd.description || '',
        stock: Number(newProd.stock) || 0,
        category: newProd.category || '',
        images: []
      }
      const created = await createProduct(token, payload)
      if (newFiles && newFiles.length > 0) {
        const uploaded = await uploadImages(token, newFiles)
        await attachImagesToProduct(token, created.id, uploaded)
        const refreshed = await listProducts({ token, limit: 100 })
        setItems(refreshed)
      } else {
        setItems([created, ...items])
      }
      setNewProd({ name: '', brand: '', price: '', description: '', stock: '', category: '' })
      setNewFiles([])
    } catch (e) {
      alert('Error al crear producto')
    }
  }

  // ---- Usuarios: acciones ----
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

  async function handleChangeStatus(u, status) {
    try {
      await updateUserStatus(token, u.id, status)
      setTeam(team.map(x => x.id === u.id ? { ...x, status } : x))
    } catch (e) {
      alert('No se pudo actualizar el estado (revisa permisos y endpoint user)')
    }
  }

  // ---- Órdenes: acciones ----
  async function changeOrderStatus(o, status) {
    if (!token) return
    try {
      const updated = await updateOrder(token, o.id, { status })
      setOrders(orders.map(x => x.id === o.id ? updated : x))
    } catch (e) {
      alert('No fue posible actualizar el estado')
    }
  }

  async function toggleOrderDetails(o) {
    if (expandedOrder === o.id) return setExpandedOrder(null)
    try {
      if (!o._products) {
        const prods = await listOrderProducts(token, o.id)
        setOrders(orders.map(x => x.id === o.id ? { ...x, _products: prods } : x))
      }
      setExpandedOrder(o.id)
    } catch (e) {
      alert('No fue posible cargar productos del pedido')
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <aside className="col-12 col-md-3 col-lg-2 mb-3">
          <div className="list-group">
            <button className={`list-group-item list-group-item-action ${active === 'products' ? 'active' : ''}`} onClick={() => setActive('products')}>Productos</button>
            <button className={`list-group-item list-group-item-action ${active === 'users' ? 'active' : ''}`} onClick={() => setActive('users')}>Usuarios</button>
            <button className={`list-group-item list-group-item-action ${active === 'orders' ? 'active' : ''}`} onClick={() => setActive('orders')}>Órdenes</button>
          </div>
        </aside>
        <main className="col-12 col-md-9 col-lg-10">
          <h1>Panel de administración</h1>

          {active === 'products' && (
            <div>
              <h4 className="mt-3">Crear producto</h4>
              <form className="row g-2 mb-4" onSubmit={handleCreateProduct}>
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="Nombre" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} required />
                </div>
                <div className="col-6 col-md-3">
                  <input className="form-control" placeholder="Marca" value={newProd.brand} onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })} />
                </div>
                <div className="col-6 col-md-3">
                  <input type="number" min="0" step="0.01" className="form-control" placeholder="Precio" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} />
                </div>
                <div className="col-12">
                  <textarea className="form-control" placeholder="Descripción" value={newProd.description} onChange={(e) => setNewProd({ ...newProd, description: e.target.value })} />
                </div>
                <div className="col-6 col-md-3">
                  <input type="number" min="0" className="form-control" placeholder="Stock" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} />
                </div>
                <div className="col-6 col-md-3">
                  <input className="form-control" placeholder="Categoría" value={newProd.category} onChange={(e) => setNewProd({ ...newProd, category: e.target.value })} />
                </div>
                <div className="col-12 col-md-6">
                  <input type="file" className="form-control" multiple accept="image/*" onChange={(e) => setNewFiles(Array.from(e.target.files || []))} />
                </div>
                <div className="col-12 col-md-2 d-grid">
                  <button className="btn btn-success" type="submit">Crear</button>
                </div>
              </form>

              {err && <div className="alert alert-danger">{err}</div>}
              {loading && <div>Cargando productos...</div>}
              <div className="list-group">
                {items.map(p => (
                  <div key={p.id} className="list-group-item">
                    {editingId === p.id ? (
                      <div className="row g-2 align-items-center">
                        <div className="col-12 col-md-4">
                          <input className="form-control" value={editDrafts[p.id]?.name || ''} onChange={(e) => setEditDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], name: e.target.value } }))} />
                        </div>
                        <div className="col-6 col-md-2">
                          <input className="form-control" value={editDrafts[p.id]?.brand || ''} onChange={(e) => setEditDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], brand: e.target.value } }))} />
                        </div>
                        <div className="col-6 col-md-2">
                          <input type="number" className="form-control" value={editDrafts[p.id]?.price || ''} onChange={(e) => setEditDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], price: e.target.value } }))} />
                        </div>
                        <div className="col-12 col-md-4">
                          <input type="file" className="form-control" multiple accept="image/*" onChange={(e) => setEditDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], _newFiles: Array.from(e.target.files || []) } }))} />
                        </div>
                        <div className="col-12">
                          <textarea className="form-control" value={editDrafts[p.id]?.description || ''} onChange={(e) => setEditDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], description: e.target.value } }))} />
                        </div>
                        <div className="col-6 col-md-2">
                          <input type="number" className="form-control" value={editDrafts[p.id]?.stock || ''} onChange={(e) => setEditDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], stock: e.target.value } }))} />
                        </div>
                        <div className="col-6 col-md-2">
                          <input className="form-control" value={editDrafts[p.id]?.category || ''} onChange={(e) => setEditDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], category: e.target.value } }))} />
                        </div>
                        <div className="col-12 col-md-4 d-flex gap-2">
                          <button className="btn btn-sm btn-primary" onClick={() => saveEdit(p.id)}>Guardar</button>
                          <button className="btn btn-sm btn-secondary" onClick={() => cancelEdit(p.id)}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold">{p.name}</div>
                          <div className="small text-muted">{p.brand} • {formatCLPCurrency(p.price)}</div>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(p)}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>Eliminar</button>
                        </div>
                      </div>
                    )}
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

              {uErr && <div className="alert alert-danger d-flex justify-content-between align-items-center">{uErr} <button className="btn btn-sm btn-light ms-2" onClick={() => setUserRetryKey(k => k + 1)}>Reintentar</button></div>}
              {uLoading && <div>Cargando usuarios...</div>}
              <div className="list-group">
                {team.map(u => (
                  <div key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{u.name || u.username || u.email}</div>
                      <div className="small text-muted">
                        {u.email} • id: {u.id}
                        {u.status === 'blocked' && <span className="badge bg-danger ms-2">BLOQUEADO</span>}
                      </div>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <select className="form-select form-select-sm" style={{ width: 140 }} value={u.role || 'user'} onChange={(e) => handleChangeRole(u, e.target.value)}>
                        <option value="user">Usuario</option>
                        <option value="admin">Admin</option>
                      </select>
                      <select className="form-select form-select-sm" style={{ width: 140 }} value={u.status || 'active'} onChange={(e) => handleChangeStatus(u, e.target.value)}>
                        <option value="active">Activo</option>
                        <option value="blocked">Bloqueado</option>
                      </select>
                      <button className="btn btn-sm btn-outline-danger" onClick={async () => {
                        if (!confirm('Eliminar usuario?')) return
                        try {
                          await adminDeleteUser(token, u.id)
                          setTeam(team.filter(x => x.id !== u.id))
                        } catch (e) { alert('No se pudo eliminar el usuario (revisa permisos)') }
                      }}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === 'orders' && (
            <div>
              <h4 className="mt-3">Gestión de Órdenes</h4>
              {oErr && <div className="alert alert-danger">{oErr}</div>}
              {oLoading && <div>Cargando órdenes...</div>}
              <div className="list-group">
                {orders.map(o => (
                  <div key={o.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-bold">Orden #{o.id} • {new Date(o.created_at).toLocaleString()}</div>
                        <div className="small text-muted">Usuario ID: {o.user_id} • Total: {formatCLPCurrency(o.total || 0)}</div>
                        <div className="small">Estado: <strong>{o.status}</strong></div>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleOrderDetails(o)}>{expandedOrder === o.id ? 'Ocultar' : 'Ver'}</button>
                        {o.status === 'pending' && (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => changeOrderStatus(o, 'shipped')}>Aceptar (enviado)</button>
                            <button className="btn btn-sm btn-danger" onClick={() => changeOrderStatus(o, 'rejected')}>Rechazar</button>
                          </>
                        )}
                      </div>
                    </div>
                    {expandedOrder === o.id && (
                      <div className="mt-3">
                        <h6>Productos</h6>
                        {o._products ? (
                          <div className="list-group">
                            {(o._products || []).map(op => (
                              <div key={op.id} className="list-group-item d-flex justify-content-between">
                                <div>{op.product?.name || `Producto ID: ${op.product_id}`}</div>
                                <div className="text-muted">x{op.quantity} • {formatCLPCurrency(op.price_at_purchase || 0)}</div>
                              </div>
                            ))}
                          </div>
                        ) : <div>Cargando detalles...</div>}
                      </div>
                    )}
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