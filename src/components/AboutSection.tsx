'use client';

import { motion } from 'framer-motion';
import { Heart, Award, Truck, Clock, Star, Users } from 'lucide-react';

export default function AboutSection() {
  const features = [
    {
      icon: Heart,
      title: "Pasión por las Flores",
      description: "Más de 20 años dedicados a crear momentos especiales con las flores más frescas de Lima."
    },
    {
      icon: Award,
      title: "Calidad Premium",
      description: "Trabajamos solo con los mejores proveedores para garantizar la frescura y belleza de cada flor."
    },
    {
      icon: Truck,
      title: "Entrega Rápida",
      description: "Delivery el mismo día en Lima y Callao. Tu pedido llegará fresco y puntual."
    },
    {
      icon: Clock,
      title: "Disponibles 24/7",
      description: "Atencion al cliente las 24 horas para esos momentos especiales que no pueden esperar."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Clientes Felices" },
    { number: "500+", label: "Arreglos al Mes" },
    { number: "50+", label: "Tipos de Flores" },
    { number: "4.9", label: "Rating Promedio" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-rose-light via-white to-pink-light/20">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Heart className="w-16 h-16 text-pink-bright" />
            </motion.div>
          </div>
          <h2 className="text-5xl font-bold text-pink-dark mb-6">
            Sobre Flores y Detalles Lima
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Somos una florería familiar que desde hace más de dos décadas se dedica a crear 
            momentos mágicos y expresar sentimientos a través de los arreglos florales más hermosos de Lima.
          </p>
        </motion.div>

        {/* Historia */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-3xl font-bold text-pink-dark mb-6">Nuestra Historia</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Todo comenzó con un sueño: llevar la belleza y el amor a cada hogar limeño. 
                Desde nuestros humildes inicios en el 2000, hemos crecido hasta convertirnos en 
                la florería de confianza de miles de familias.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Cada arreglo floral que creamos lleva consigo nuestra pasión, dedicación y 
                el compromiso de hacer de cada momento una ocasión especial e inolvidable.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-600">Más de 5,000 reseñas positivas</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-pink-bright to-pink-dark rounded-3xl p-8 text-white shadow-xl">
              <h3 className="text-3xl font-bold mb-6">Nuestra Misión</h3>
              <p className="mb-6 leading-relaxed">
                &quot;Crear experiencias únicas que toquen el corazón y fortalezcan los lazos 
                entre las personas, a través de arreglos florales de la más alta calidad.&quot;
              </p>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8" />
                <span className="text-lg font-semibold">Equipo de más de 15 profesionales</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Características */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h3 className="text-4xl font-bold text-center text-pink-dark mb-12">
            ¿Por Qué Elegirnos? 💖
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg text-center"
              >
                <div className="bg-pink-light rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-pink-dark" />
                </div>
                <h4 className="text-xl font-bold text-pink-dark mb-3">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-pink-bright to-pink-dark rounded-3xl p-8 text-white"
        >
          <h3 className="text-4xl font-bold text-center mb-12">Nuestros Números Hablan 📊</h3>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-pink-bright">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
