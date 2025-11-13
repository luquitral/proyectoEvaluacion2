import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { items } = useCart()
  const { user, logoutAxios } = useAuth()
  const navigate = useNavigate()
  const count = items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0
  const isAdmin = user?.role === 'admin';
  const displayName = user?.name || user?.username || user?.email

  function handleLogout() {
    logoutAxios()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">404Store</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link" to="/products">Productos</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/about">Nosotros</Link></li>
            {/* Categorías eliminado */}
            <li className="nav-item"><Link className="nav-link" to="/contact">Contacto</Link></li>
          </ul>
          <div className="d-flex gap-2 align-items-center"> 
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">Hola{displayName ? `, ${displayName}` : ''}</span>
                {isAdmin && <Link className="btn btn-outline-secondary btn-sm" to="/admin">Admin</Link>}
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Salir</button>
              </div>
            ) : (
              <Link className="btn btn-outline-primary" to="/login">Iniciar sesión</Link>
            )}
            <Link className="btn btn-primary position-relative" to="/cart">
              <i className="bi bi-cart"></i> Carrito
              {count > 0 && <span className="badge bg-danger position-absolute" style={{ top: -6, right: -6 }}>{count}</span>}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
