export default function Footer() {
  return (
    <footer className="bg-light mt-4 py-3">
      <div className="container text-center">
        <div>© {new Date().getFullYear()} 404 Store - Tienda de componentes electrónicos</div>
        <div className="text-muted small">Contacto: contacto@404Store.cl</div>
      </div>
    </footer>
  )
}
