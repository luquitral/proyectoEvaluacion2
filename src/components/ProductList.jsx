import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { listProducts } from '../api/xano';

export default function ProductList({ limit = 12 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await listProducts({ limit });
        if (mounted) setItems(Array.isArray(data) ? data.slice(0, limit) : []);
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    load();
    return () => { mounted = false };
  }, [limit]);

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