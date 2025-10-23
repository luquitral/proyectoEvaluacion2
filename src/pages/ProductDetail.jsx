import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductImagesSlider from '../components/ProductImagesSlider'
import { getProduct, listProducts } from '../api/xano'
import { formatCLPCurrency } from '../components/priceFormat.jsx'
import { useCart } from '../context/CartContext'


const storageBase = (import.meta.env?.VITE_XANO_STORAGE_BASE || import.meta.env?.VITE_XANO_STORE_BASE || '').replace(/\/$/, '')
function buildUrlFromPath(path) {
  if (!path) return null
  if (typeof path === 'string' && path.startsWith('http')) return path
  if (!storageBase) return typeof path === 'string' ? path : null
  return storageBase + (String(path).startsWith('/') ? path : `/${path}`)
}

function resolveFirstImage(prod) {
  if (!prod) return '/vite.svg'
  const imgs = Array.isArray(prod.images) ? prod.images : (prod.images ? [prod.images] : [])
  const first = imgs.length > 0 ? imgs[0] : (prod.image || null)
  if (!first) return '/vite.svg'
  if (typeof first === 'string') return first.startsWith('http') ? first : buildUrlFromPath(first)
  if (first.url) return first.url
  if (first.src) return first.src
  if (first.path) return buildUrlFromPath(first.path)
  if (first.file?.url) return first.file.url
  if (first.file?.path) return buildUrlFromPath(first.file.path)
  return '/vite.svg'
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [suggested, setSuggested] = useState([])
  const { add } = useCart()

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const p = await getProduct(id)
        if (mounted) setProduct(p)
        // fetch some products and pick random ones as suggestions
        const all = await listProducts({ limit: 50 })
        if (mounted) {
          const pool = (Array.isArray(all) ? all : []).filter(x => String(x.id) !== String(id))
          // shuffle and pick up to 6
          for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[pool[i], pool[j]] = [pool[j], pool[i]]
          }
          setSuggested(pool.slice(0, 6))
        }
      } catch (e) {
        if (mounted) setError(e?.message || 'Error al cargar producto')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (loading) return <main className="container py-4">Cargando producto...</main>
  if (error) return <main className="container py-4"><div className="text-danger">{error}</div></main>
  if (!product) return <main className="container py-4">Producto no encontrado</main>

  const images = product?.images ?? (product?.image ? [product.image] : [])

  return (
    <main className="container py-4">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-body">
              <h2 className="fw-bold">{product.name}</h2>
              <div className="text-muted mb-2">{product.brand || 'Marca'}</div>
            </div>
            <ProductImagesSlider images={images} alt={product.name} aspect={'16/9'} />
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="mb-3 display-6 fw-bold">{formatCLPCurrency(product.price || 0)}</div>
              <div className="mb-2">Marca: <strong>{product.brand || '—'}</strong></div>
              <div className="mb-3 text-muted small">{product.description || 'Sin descripción'}</div>
              <div className="mb-2">Categoría: <strong>{product.category || '—'}</strong></div>
              <div className="mb-3">Stock: <strong>{typeof product.stock === 'number' ? product.stock : '—'}</strong></div>
              <div className="d-grid">
                <button className="btn btn-primary" onClick={async () => { try { await add(product, 1) ; navigate('/cart') } catch (e) { console.error(e) } }}>Agregar al carrito</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-5">
        <h4 className="fw-bold mb-3">Productos sugeridos</h4>
        <div className="row g-3">
          {suggested.map(p => (
            <div key={p.id} className="col-6 col-md-4 col-lg-2">
              <div className="card h-100">
                <div role="button" onClick={() => navigate(`/products/${p.id}`)} style={{ cursor: 'pointer' }}>
                  <img src={resolveFirstImage(p)} alt={p.name} className="card-img-top" style={{ objectFit: 'cover', height: 120 }} loading="lazy" />
                </div>
                <div className="card-body small">
                  <div className="fw-bold">{p.name}</div>
                  <div className="text-muted">{formatCLPCurrency(p.price || 0)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
