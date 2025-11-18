'use client';

import { motion } from 'framer-motion';
import { Truck, Shield, Clock, Heart, Award, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Delivery Gratuito',
    description: 'Entrega gratis en áreas de cobertura de Canto Rey',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Shield,
    title: 'Garantía de Frescura',
    description: 'Flores frescas garantizadas o te devolvemos tu dinero',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Clock,
    title: 'Entrega Rápida',
    description: 'Entrega el mismo día para pedidos antes de las 4 PM',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Heart,
    title: 'Diseños Únicos',
    description: 'Cada arreglo es creado con amor y dedicación especial',
    color: 'from-pink-500 to-pink-600'
  },
  {
    icon: Award,
    title: 'Calidad Premium',
    description: 'Solo trabajamos con las mejores flores importadas',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Sparkles,
    title: 'Momentos Mágicos',
    description: 'Convertimos ocasiones especiales en recuerdos únicos',
    color: 'from-yellow-500 to-yellow-600'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-pink-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-bright to-purple-500 rounded-full shadow-lg mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-dark via-purple-600 to-pink-bright bg-clip-text text-transparent mb-6">
            ¿Por qué elegirnos?
          </h2>
          
          <div className="h-2 w-24 bg-gradient-to-r from-pink-400 via-purple-500 to-pink-bright rounded-full mx-auto mb-6" />
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            En Flores y Detalles Lima nos comprometemos a brindarte la mejor experiencia, 
            <span className="text-pink-bright font-semibold"> desde el primer contacto hasta la sonrisa de quien recibe tus flores</span>
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100/50">
                  
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-pink-bright transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>

                  {/* Hover Effect */}
                  <div className="h-1 w-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mt-6 group-hover:w-full transition-all duration-500" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-pink-bright/10 to-purple-500/10 rounded-2xl p-8 backdrop-blur-sm border border-pink-200/50">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              ¿Listo para crear momentos únicos?
            </h3>
            <p className="text-gray-600 mb-6">
              Descubre nuestro catálogo completo y encuentra el arreglo perfecto
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-bright to-purple-500 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Ver Catálogo Completo
            </motion.button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
