
import { motion } from 'motion/react';
import { MapPin, Search } from 'lucide-react';

export default function WhereToBuySection() {
  return (
    <section id="onde-comprar" className="py-24 bg-white text-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-600 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-red-600 font-semibold tracking-wide uppercase text-sm"
          >
            Encontre a Long Way
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 mt-2 mb-4"
          >
            Onde Comprar
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto text-lg"
          >
            Nossos produtos estão disponíveis nos melhores mercados e empórios do Brasil.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Map/Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop"
              alt="Mapa de Lojas"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-bold mb-1">Encontre a loja mais próxima</h3>
              <p className="text-gray-300 text-sm">Digite seu CEP ao lado para buscar.</p>
            </div>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Busque por região</h3>
            <form className="space-y-6">
              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">CEP ou Cidade</label>
                <div className="relative">
                  <input
                    type="text"
                    id="cep"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-gray-900 shadow-sm"
                    placeholder="Digite seu CEP ou cidade..."
                  />
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Search size={20} />
                Buscar Lojas
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Principais Parceiros:</h4>
              <div className="flex flex-wrap gap-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Logos placeholder */}
                <span className="font-bold text-xl text-gray-400">Carrefour</span>
                <span className="font-bold text-xl text-gray-400">Pão de Açúcar</span>
                <span className="font-bold text-xl text-gray-400">Extra</span>
                <span className="font-bold text-xl text-gray-400">Oba Hortifruti</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
