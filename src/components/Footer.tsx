
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img 
                src="https://longwayalimentos.com.br/wp-content/uploads/2024/10/logo-branco-longway-1.svg" 
                alt="Long Way" 
                className="h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Levando o autêntico sabor oriental para a sua mesa com qualidade e tradição desde 2001.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Links Rápidos</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="/" className="hover:text-red-500 transition-colors">Home</a></li>
              <li><a href="/produtos" className="hover:text-red-500 transition-colors">Produtos</a></li>
              <li><a href="/receitas" className="hover:text-red-500 transition-colors">Receitas</a></li>
              <li><a href="/onde-comprar" className="hover:text-red-500 transition-colors">Onde Comprar</a></li>
              <li><a href="/sobre" className="hover:text-red-500 transition-colors">Sobre Nós</a></li>
              <li><a href="/contato" className="hover:text-red-500 transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Contato</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-red-500 mt-1 flex-shrink-0" />
                <span>(11) 4615–5858<br />(11) 94141-8274</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-red-500 mt-1 flex-shrink-0" />
                <a href="mailto:contato@longwayalimentos.com.br" className="hover:text-red-500 transition-colors">
                  contato@longwayalimentos.com.br
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-red-500 mt-1 flex-shrink-0" />
                <span>Rua Pacífico, 160<br />Cotia/SP - Polo Industrial Granja Viana</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Novidades</h3>
            <p className="text-gray-400 text-sm mb-4">
              Receba nossas receitas e ofertas exclusivas.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm"
              >
                Inscrever-se
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} Long Way Alimentos. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
