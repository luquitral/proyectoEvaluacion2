export default function Contact() {
  return (
    <div className="container py-5">
      
      {/* Título y Subtítulo */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">
          <i className="bi bi-headset me-3"></i> 
          Contáctanos
        </h1>
        <p className="lead text-muted mt-3">
          ¿Necesitas asesoría, tienes dudas sobre una compra o requieres soporte técnico? Estamos aquí para ayudarte.
        </p>
      </div>

      <div className="row">
        
        {/* 1. Formulario de Contacto (Principal CTA) */}
        <div className="col-lg-7 mb-4">
          <div className="card shadow-lg border-0 h-100">
            <div className="card-body p-4 p-md-5">
              <h4 className="card-title fw-bold mb-4">Envíanos un Mensaje</h4>
              
              <form>
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">Nombre Completo</label>
                  <input type="text" className="form-control" id="nombre" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Correo Electrónico</label>
                  <input type="email" className="form-control" id="email" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="asunto" className="form-label">Asunto</label>
                  <select className="form-select" id="asunto" required>
                    <option value="">Selecciona un motivo...</option>
                    <option value="soporte">Soporte Técnico / Garantías</option>
                    <option value="ventas">Dudas sobre productos / Stock</option>
                    <option value="cotizacion">Cotización para Empresas</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="mensaje" className="form-label">Tu Mensaje</label>
                  <textarea className="form-control" id="mensaje" rows="4" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100 mt-3 fw-bold">
                  <i className="bi bi-send-fill me-2"></i> Enviar Consulta
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 2. Información Adicional y Canales (Sidebar) */}
        <div className="col-lg-5 mb-4">
          <div className="d-grid gap-4">
            
            {/* Contacto Directo */}
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title fw-bold text-primary">Contacto Rápido</h5>
                <ul className="list-unstyled mt-3">
                  <li className="mb-2">
                    <i className="bi bi-envelope-fill me-2 text-primary"></i> 
                    <strong>Email Soporte:</strong> <a href="mailto:soporte@404store.test" className="text-decoration-none">soporte@404store.test</a>
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-telephone-fill me-2 text-primary"></i> 
                    <strong>Teléfono:</strong> (+56) 2 2987 6543
                  </li>
                  <li>
                    <i className="bi bi-whatsapp me-2 text-success"></i> 
                    <strong>WhatsApp:</strong> <a href="https://wa.me/56900000000" className="text-decoration-none">+56 9 0000 0000</a>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Ubicación y Horarios */}
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title fw-bold text-primary">Horarios y Dirección</h5>
                <ul className="list-unstyled mt-3">
                  <li className="mb-2">
                    <i className="bi bi-clock-fill me-2 text-secondary"></i> 
                    <strong>Horario Tienda:</strong> Lunes a Viernes, 9:00 a 18:00 hrs.
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-geo-alt-fill me-2 text-secondary"></i> 
                    <strong>Retiro en Sucursal:</strong> Av. Tecnología 404, Santiago.
                  </li>
                  <li className="text-muted small mt-3">
                    *Puedes verificar el stock en línea antes de visitarnos.*
                  </li>
                </ul>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="text-center">
              <h5 className="fw-bold text-primary mb-3">Síguenos</h5>
              <a href="#" className="btn btn-outline-dark me-2"><i className="bi bi-instagram fs-4"></i></a>
              <a href="#" className="btn btn-outline-dark me-2"><i className="bi bi-twitter fs-4"></i></a>
              <a href="#" className="btn btn-outline-dark"><i className="bi bi-facebook fs-4"></i></a>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}