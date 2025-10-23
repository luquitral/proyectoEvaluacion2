import { useEffect, useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import { listProducts } from '../api/xano';

export default function ProductList({ limit = 12, filters = {} }) {
  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { q = '', minPrice = '', maxPrice = '', brandText = '', sort = 'relevance' } = filters

  useEffect(() => {
    let mounted = true;
    
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Usamos q para que el backend filtre por búsqueda si soporta
        const data = await listProducts({ limit: 1000, q });
        if (mounted) setRawItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    load();
    return () => { mounted = false };
  }, [limit, q]);

  const items = useMemo(() => {
    let arr = rawItems.slice();
    // Filtros en cliente
    const min = parseInt(String(minPrice || '').replace(/\D/g, '') || '0', 10)
    const max = parseInt(String(maxPrice || '').replace(/\D/g, '') || '0', 10)
    const brand = (brandText || '').trim().toLowerCase()
    const qClean = (q || '').trim().toLowerCase()

    if (min > 0) arr = arr.filter(p => (parseInt(String(p.price || '').replace(/\D/g, ''), 10) || 0) >= min)
    if (max > 0) arr = arr.filter(p => (parseInt(String(p.price || '').replace(/\D/g, ''), 10) || 0) <= max)

    // brandText debe filtrar solo por la marca
    if (brand) arr = arr.filter(p => (String(p.brand || '').toLowerCase().split(/\s+/).some(tok => tok.startsWith(brand))))

    // búsqueda q -> solo por nombre, usando coincidencia startsWith por tokens
    if (qClean) {
      const toks = qClean.split(/\s+/).filter(Boolean)
      arr = arr.filter(p => {
        const name = (p.name || '').toLowerCase()
        return toks.every(t => name.split(/\s+/).some(nt => nt.startsWith(t)))
      })
    }

    // Ordenamiento
    switch (sort) {
      case 'price-asc':
        arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-desc':
        arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'newest':
        arr.sort((a, b) => (new Date(b.created_at || 0) - new Date(a.created_at || 0)));
        break;
      default:
        // relevance (dejar como viene del backend)
        break;
    }
    // Limitar visualización
    return arr.slice(0, limit);
  }, [rawItems, minPrice, maxPrice, brandText, sort, limit]);

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div className="text-danger">Error: {error}</div>;

  return (
    <div className="row g-3">
      {items.map(p => (
        <div className="col-6 col-md-4 col-lg-3" key={p.id}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}