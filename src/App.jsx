import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/home.jsx'
import Products from './pages/products.jsx'
import About from './pages/about.jsx'
import Contact from './pages/contact.jsx'
import LoginPage from './pages/LoginPage.jsx'
import Cart from './pages/Cart.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import ProductDetail from './pages/ProductDetail.jsx'

export default function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginPage />} />
  <Route path="/cart" element={<Cart />} />
  <Route path="/admin" element={<AdminPanel />} />
  <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
      <Footer />
    </div>
  )
}
