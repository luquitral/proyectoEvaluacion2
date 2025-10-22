import ProductList from '../components/ProductList'

export default function Home() {
  return (
    <main className="container py-4">
      
        <div className="col-12">
          <div className="bg-dark text-white p-4 p-md-5 rounded shadow-lg" style={{ minHeight: '350px', backgroundImage: 'url(https://media.spdigital.cl/file_upload/Desktop_Hero_04_Hallogamer_2025_c529253e.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        </div>

      <h2 className="mt-4 mb-4 border-bottom pb-2 text-danger fw-bold">🔥 ¡No te pierdas! Productos Destacados</h2>
      <ProductList limit={8} />

    </main>
  )
}