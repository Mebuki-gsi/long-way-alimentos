
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { categories } from '../data/products';

export default function CategorySection() {
  return (
    <section id="categorias" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-red-600 font-semibold tracking-wide uppercase text-sm">
            Nossa Variedade
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
            Explore Nossas Categorias
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            De massas crocantes a recheios suculentos, temos tudo para o seu paladar oriental.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              {/* Image */}
              <div className="aspect-w-16 aspect-h-10 overflow-hidden h-64">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 group-hover:text-red-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2 group-hover:text-white transition-colors">
                  {category.description}
                </p>
                <a
                  href={`#${category.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors group-hover:translate-x-2 duration-300"
                >
                  Ver Produtos <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
