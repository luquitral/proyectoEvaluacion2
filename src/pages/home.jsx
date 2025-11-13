import ProductList from '../components/ProductList';

// Importaciones de las imágenes desde la carpeta 'assets'
import banner1 from '../assets/banner.png'; 
import banner2 from '../assets/carrusel2.png'; 
import banner3 from '../assets/carrusel3.png'; 

export default function Home() {
    
    // Definición de las imágenes para el carrusel (solo necesitas el ID y la imagen)
    const carouselItems = [
        { id: 1, image: banner1 },
        { id: 2, image: banner2 },
        { id: 3, image: banner3 }
    ];

    return (
        <main className="container py-4">

            {/* 1. SECCIÓN PRINCIPAL: CARRUSEL DE BOOTSTRAP */}
            <div className="row mb-5">
                <div className="col-12">
                    
                    {/* Estructura del Carrusel */}
                    <div id="mainCarousel" className="carousel slide carousel-fade rounded shadow-lg" data-bs-ride="carousel">
                        
                        {/* Indicadores */}
                        <div className="carousel-indicators">
                            {carouselItems.map((item, index) => (
                                <button 
                                    key={item.id}
                                    type="button" 
                                    data-bs-target="#mainCarousel" 
                                    data-bs-slide-to={index} 
                                    className={index === 0 ? 'active' : ''} 
                                    aria-current={index === 0 ? 'true' : 'false'} 
                                    aria-label={`Slide ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Items del Carrusel (sin contenido de texto superpuesto) */}
                        <div className="carousel-inner" style={{ minHeight: '350px' }}>
                            {carouselItems.map((item, index) => (
                                <div 
                                    key={item.id}
                                    className={`carousel-item ${index === 0 ? 'active' : ''} bg-dark`} // No se necesita text-white si no hay texto
                                    data-bs-interval="5000" 
                                    style={{
                                        minHeight: '350px',
                                        backgroundImage: `url(${item.image})`, 
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                        // Eliminado: position: 'relative' y el div con el overlay y el texto
                                    }}
                                >
                                    {/* Ya no hay contenido de texto aquí dentro */}
                                </div>
                            ))}
                        </div>

                        {/* Controles de Navegación (Flechas) */}
                        <button className="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>

                    </div>
                    {/* Fin del Carrusel */}

                </div>
            </div>
            
            <h2 className="mt-4 mb-4 border-bottom pb-2 text-danger fw-bold">🔥 ¡No te pierdas! Productos Destacados</h2>
            <ProductList limit={8} />

        </main>
    );
}