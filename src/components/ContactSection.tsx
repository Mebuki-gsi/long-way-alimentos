
import { motion } from 'motion/react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contato" className="py-24 bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-600 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-red-500 font-semibold tracking-wide uppercase text-sm mb-2 block">
              Fale Conosco
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Pronto para levar o sabor oriental para o seu negócio?
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Entre em contato com nossa equipe comercial e descubra as vantagens de ser um parceiro Long Way.
              Atendemos restaurantes, mercados e distribuidores.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-red-500/50 transition-colors group">
                <div className="bg-red-600/20 p-3 rounded-full text-red-500 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Ligue para nós</h4>
                  <p className="text-gray-400">(11) 4615–5858</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-red-500/50 transition-colors group">
                <div className="bg-red-600/20 p-3 rounded-full text-red-500 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Envie um e-mail</h4>
                  <p className="text-gray-400">contato@longwayalimentos.com.br</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-red-500/50 transition-colors group">
                <div className="bg-red-600/20 p-3 rounded-full text-red-500 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Visite-nos</h4>
                  <p className="text-gray-400">Rua Pacífico, 160 - Cotia/SP</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Envie uma mensagem</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-gray-900"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-gray-900"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-gray-900"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-gray-900 resize-none"
                  placeholder="Como podemos ajudar?"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transform hover:-translate-y-1"
              >
                Enviar Mensagem
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
