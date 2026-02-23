
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

const timelineEvents = [
  {
    year: '1999',
    title: 'Fundação da Long Way',
    description: 'A Long Way foi fundada na cidade de São Paulo em uma planta de 150m², trabalhando somente com um produto, a Massa de Rolinho Primavera.',
    image: 'https://longwayalimentos.com.br/wp-content/uploads/2025/03/Captura-de-tela-2025-03-11-164341.png'
  },
  {
    year: '2004',
    title: 'Expansão para Cotia',
    description: 'Em busca de mais espaço, se muda para uma nova planta de 1.200m² em Cotia/SP, para continuar sua expansão.',
    image: 'https://longwayalimentos.com.br/wp-content/uploads/2024/11/IMG_0602-1400x683.jpg'
  },
  {
    year: '2009',
    title: 'Lançamento do Guioza Long Way',
    description: 'Aperfeiçoando e trabalhando somente com a massa do Rolinho Primavera até 2009, a empresa lança seu segundo produto, o Guioza Long Way.',
    image: 'https://longwayalimentos.com.br/wp-content/uploads/2025/03/WhatsApp-Image-2025-03-11-at-16.54.32.jpeg'
  }
];

export default function About() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Hero / Intro Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-red-600 font-semibold tracking-wide uppercase text-sm"
            >
              Nossa História
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-gray-900 mt-2 mb-4"
            >
              Sobre a Long Way
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6 text-gray-600 text-lg leading-relaxed text-justify"
          >
            <p>
              A Long Way foi fundada pelo Sr. Wu, nascido em Taiwan, que veio para o Brasil com seus 8 anos de idade, e sua esposa Sra. Suely, nascida no Brasil, mas de descendência japonesa.
            </p>
            <p>
              Depois de inúmeras tentativas de negócios no Brasil, o Sr. Wu e a Sra. Suely se encontraram no Ramo Alimentício.
            </p>
            <p>
              Antes de existir a Long Way, faziam a massa de harumaki (Rolinho Primavera) e laminavam a mão artesanalmente para o seu comércio.
            </p>
            <p>
              Com o passar do tempo, surgiu uma oportunidade onde, naquela época era uma alta demanda da massa de harumaki, sendo necessária uma produção muito maior do que produziam.
            </p>
            <p className="font-semibold text-gray-900">
              Foi então em 1999 que a Long Way nasceu.
            </p>
            <p>
              O Sr. Wu e sua esposa, mergulharam nessa oportunidade de cabeça, investindo em uma planta de 150m² na cidade de São Paulo e em uma máquina para produzir em maior escala a massa de Harumaki.
            </p>
            <p>
              Uma história de muita parceria, perseverança, persistência, força de vontade e trabalho duro, foram crescendo cada vez mais a cada ano que se passava.
            </p>
            <p>
              Desde então a Long Way investiu e se especializou em uma produção de alta escala, mantendo os sabores e características artesanais de seus produtos, prezando sempre pela sua qualidade.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-yellow-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900">
              LINHA DO TEMPO <span className="text-red-600">da</span>
              <br />
              <span className="text-red-600">empresa e produtos</span>
            </h2>
          </div>

          <div className="relative">
            {/* Horizontal Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gray-200 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={event.year}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  {/* Year & Icon */}
                  <div className="mb-8 flex flex-col items-center">
                    <span className="text-2xl font-bold text-red-600 mb-4">{event.year}</span>
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-4 border-white">
                      <Clock size={24} />
                    </div>
                    {/* Connector for mobile */}
                    <div className="md:hidden h-12 w-1 bg-gray-200 my-2"></div>
                  </div>

                  {/* Card */}
                  <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 w-full hover:shadow-2xl transition-shadow duration-300">
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold text-red-600 mb-3">{event.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
