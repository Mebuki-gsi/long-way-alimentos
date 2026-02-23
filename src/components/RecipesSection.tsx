
import { motion } from 'motion/react';
import { ArrowRight, Clock, Users } from 'lucide-react';

const recipes = [
  {
    id: 1,
    title: 'Guioza Grelhado Tradicional',
    description: 'Aprenda a fazer o clássico guioza com aquela casquinha crocante irresistível.',
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c423c?q=80&w=800&auto=format&fit=crop',
    time: '15 min',
    servings: '2 pessoas',
  },
  {
    id: 2,
    title: 'Sopa de Wantan com Guioza',
    description: 'Uma sopa reconfortante e cheia de sabor para os dias mais frios.',
    image: 'https://images.unsplash.com/photo-1547592166-23acbe3b624b?q=80&w=800&auto=format&fit=crop',
    time: '25 min',
    servings: '4 pessoas',
  },
  {
    id: 3,
    title: 'Harumaki Doce com Sorvete',
    description: 'Uma sobremesa surpreendente usando nossos rolinhos primavera.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800&auto=format&fit=crop',
    time: '10 min',
    servings: '2 pessoas',
  },
];

export default function RecipesSection() {
  return (
    <section id="receitas" className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-red-600 font-semibold tracking-wide uppercase text-sm"
          >
            Inspire-se
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 mt-2 mb-4"
          >
            Receitas Deliciosas
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto text-lg"
          >
            Descubra novas formas de saborear nossos produtos com receitas criadas por chefs.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  {recipe.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {recipe.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Clock size={16} className="text-red-500" />
                    <span>{recipe.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} className="text-red-500" />
                    <span>{recipe.servings}</span>
                  </div>
                </div>
                <button className="w-full py-3 rounded-xl border-2 border-gray-100 text-gray-700 font-semibold hover:border-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                  Ver Receita <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
