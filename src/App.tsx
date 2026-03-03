/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
        <Header />
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
        <Footer />
      </div>
    </Router>
  );
}
