
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Products from './pages/Products';
import Recipes from './pages/Recipes';
import WhereToBuy from './pages/WhereToBuy';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tables from './pages/Tables';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className={`min-h-screen bg-white text-gray-900 font-sans flex flex-col`}>
      {!isDashboard && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/receitas" element={<Recipes />} />
          <Route path="/onde-comprar" element={<WhereToBuy />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster position="bottom-right" toastOptions={{ duration: 4000, style: { fontSize: '14px', fontWeight: '500' } }} />
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}
