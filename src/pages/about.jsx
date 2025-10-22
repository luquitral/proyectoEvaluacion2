export default function About() {
  return (
    <main className="container py-5">
      
      {/* 1. Sección Principal: Visión y Nombre */}
      <div className="text-center mb-5">
        <h1 className="display-3 fw-bold text-primary">
          <i className="bi bi-gear-fill me-3"></i> 
          Sobre 404Store: Expertos en Tecnología
        </h1>
        <p className="lead text-muted mt-3">
          Desde el corazón del hardware, acercamos la tecnología más avanzada a tus manos.
        </p>
      </div>

      <hr className="my-5" />

      {/* 2. Nuestra Historia y Diferenciación */}
      <div className="row align-items-center mb-5">
        <div className="col-lg-7">
          <h2 className="fw-bold mb-3 text-dark">¿Quiénes Somos?</h2>
          <p className="fs-5">
            Somos <strong>404Store</strong>, tu socio estratégico en el mundo de los componentes electrónicos, informática y hardware de alto rendimiento. Nacimos con la misión de eliminar las barreras entre el usuario y la tecnología más puntera.
          </p>
          <p>
            Nuestro catálogo está cuidadosamente seleccionado, enfocándonos en la <strong>calidad, la innovación y la durabilidad</strong>. No solo vendemos productos; ofrecemos las herramientas para construir, crear y potenciar tus proyectos, sean estos un <strong>setup gamer, un laboratorio de electrónica o una infraestructura empresarial</strong>.
          </p>
        </div>
        <div className="col-lg-5 text-center mt-4 mt-lg-0">
          {/* Imagen ilustrativa de componentes o un equipo técnico */}
          <img 
            src="https://leccionachile.b-cdn.net/wp-content/uploads/2022/01/ventajas-del-trabajo-en-equipo.jpg" 
            alt="Equipo técnico trabajando" 
            className="img-fluid rounded shadow-lg"
          />
        </div>
      </div>

      <hr className="my-5" />

      {/* 3. Misión, Visión y Valores (El triple pilar) */}
      <div className="row text-center">
        <div className="col-md-4 mb-4">
          <div className="p-4 border rounded shadow-sm h-100 bg-light">
            <i className="bi bi-lightning-charge-fill fs-2 text-warning mb-3"></i>
            <h3 className="h4 fw-bold">Nuestra Misión</h3>
            <p className="text-muted">
              Brindar <strong>acceso a tecnología de vanguardia</strong> y componentes especializados para proyectos de gaming, desarrollo, enseñanza e industria, garantizando precios competitivos.
            </p>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="p-4 border rounded shadow-sm h-100 bg-light">
            <i className="bi bi-check2-circle fs-2 text-success mb-3"></i>
            <h3 className="h4 fw-bold">Nuestro Compromiso</h3>
            <p className="text-muted">
              Más allá de la venta, garantizamos un <strong>servicio técnico experto</strong> y una asesoría post-venta que asegura el rendimiento y la vida útil de cada componente que adquieres.
            </p>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="p-4 border rounded shadow-sm h-100 bg-light">
            <i className="bi bi-rocket-fill fs-2 text-danger mb-3"></i>
            <h3 className="h4 fw-bold">Nuestra Visión</h3>
            <p className="text-muted">
              Ser el referente #1 en la comercialización de hardware en la región, impulsando la innovación tecnológica y la educación en cada comunidad.
            </p>
          </div>
        </div>
      </div>
      
    </main>
  )
}