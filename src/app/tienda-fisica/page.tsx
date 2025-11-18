'use client';

import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation, Car, Bus, Star, Heart, MessageCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { openWhatsApp, WHATSAPP_NUMBERS, WHATSAPP_MESSAGES } from '@/utils/whatsapp';

// Importar el mapa dinámicamente
const DynamicGoogleStoreMap = dynamic(() => import('@/components/GoogleStoreMap'), {
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-bright mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  ),
  ssr: false
});

export default function TiendaFisicaPage() {
  const storeInfo = {
    name: "Flores y Detalles Lima - Mercado Progreso Los Pinos",
    address: "Av. Próceres de la Independencia N°3301",
    location: "Mercado Progreso Los Pinos, 2do. Piso / Tienda 12",
    district: "San Juan de Lurigancho, Lima",
    reference: "Al costado de Metro de Canto Rey - SJL",
    phone: "+51 919 642 610",
    email: "floresydetalleslima1@gmail.com",
    hours: {
      main: "8:00 AM - 10:00 PM",
      module: "Módulo de Flores: 2:00 PM - 10:00 PM",
      moduleLocation: "Al costado de Rústica de Canto Rey",
      special: "Atención personalizada todos los días"
    }
  };

  const directions = [
    {
      icon: Car,
      title: "En Auto",
      description: "Desde el centro de Lima, tomar Av. Próceres de la Independencia hacia San Juan de Lurigancho. Buscar el N°3301, al costado del Metro Canto Rey."
    },
    {
      icon: Bus,
      title: "Metro Canto Rey",
      description: "Tomar el Metro hasta Estación Canto Rey. La tienda está al costado del Metro, en el Mercado Progreso Los Pinos, 2do piso, tienda #12."
    },
    {
      icon: Navigation,
      title: "Referencias",
      description: "Buscar 'Metro Canto Rey' o 'Av. Próceres de la Independencia 3301, SJL'. Está al costado de Rústica de Canto Rey."
    }
  ];

  const features = [
    "🌸 Amplia variedad de flores frescas",
    "🎁 Servicio de personalización in-situ",
    "� Al costado del Metro Canto Rey",
    "💳 Aceptamos todas las tarjetas",
    "📱 Pedidos por WhatsApp",
    "🚚 Delivery desde ambas ubicaciones",
    "🕐 Horarios extendidos todos los días",
    "👥 Atención personalizada y experta"
  ];

  return (
    <PageTransition>
      <main className="min-h-screen pt-16 bg-gradient-to-br from-rose-light/20 to-pink-light/30">
        
        {/* Header */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="flex justify-center mb-6"
              >
                <MapPin className="w-16 h-16 text-pink-bright" />
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
                Nuestra <span className="text-pink-bright">Tienda Física</span> 🏪
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Visítanos en nuestro local en San Juan De Lurigancho, Canto Rey, al costado del metro de Canto Rey. 
                Exactamente en el Mercado Progreso Los Pinos 2do. Piso tienda # 12 con las flores, detalles y con nuestro servicio personalizado.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => {
                    openWhatsApp({ 
                      phoneNumber: WHATSAPP_NUMBERS.MAIN, 
                      message: '¡Hola! Me gustaría consultar sus horarios de atención 🕐' 
                    });
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-6 h-6" />
                  Consultar Horarios
                </motion.button>
                
                <motion.a
                  href="tel:+51919642610"
                  className="bg-pink-bright hover:bg-pink-dark text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone className="w-6 h-6" />
                  <span className="hidden sm:inline">Llamar Ahora:</span>
                  <span className="sm:hidden">Llamar:</span>
                  +51 919 642 610
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Información Principal */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              
              {/* Información de la Tienda */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-pink-bright rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">{storeInfo.name}</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-6 h-6 text-pink-bright mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800">Dirección Principal</p>
                        <p className="text-gray-600">{storeInfo.address}</p>
                        <p className="text-gray-600">{storeInfo.location}</p>
                        <p className="text-gray-600">{storeInfo.district}</p>
                        <p className="text-sm text-pink-bright">{storeInfo.reference}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Phone className="w-6 h-6 text-pink-bright mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800">Teléfono</p>
                        <p className="text-gray-600">{storeInfo.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <Clock className="w-6 h-6 text-pink-bright mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800">Horarios</p>
                        <p className="text-gray-600">Tienda Principal: {storeInfo.hours.main}</p>
                        <p className="text-gray-600">{storeInfo.hours.module}</p>
                        <p className="text-sm text-gray-500">{storeInfo.hours.moduleLocation}</p>
                        <p className="text-sm text-pink-bright">{storeInfo.hours.special}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Características */}
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Nuestras Ubicaciones</h3>
                  
                  {/* Tienda Principal */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-pink-light/20 to-rose-light/20 rounded-xl">
                    <h4 className="font-bold text-gray-800 mb-2">🏪 Tienda Principal</h4>
                    <p className="text-gray-600">Mercado Progreso Los Pinos, 2do. Piso / Tienda 12</p>
                    <p className="text-sm text-pink-bright">Horario: 8:00 AM - 10:00 PM</p>
                  </div>
                  
                  {/* Módulo */}
                  <div className="p-4 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl">
                    <h4 className="font-bold text-gray-800 mb-2">🌸 Módulo de Flores</h4>
                    <p className="text-gray-600">Al costado de Rústica de Canto Rey</p>
                    <p className="text-sm text-emerald-600">Horario: 2:00 PM - 10:00 PM</p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">¿Por qué visitarnos?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-light/20 to-rose-light/20 rounded-xl"
                      >
                        <span className="text-lg">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Mapa */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="h-full"
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl h-full">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Ubicación</h3>
                  <div className="h-96 w-full rounded-2xl overflow-hidden border border-gray-200">
                    <DynamicGoogleStoreMap height="384px" zoom={17} />
                  </div>
                  
                  {/* Información adicional debajo del mapa */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                      📍 Mercado Progreso Los Pinos, al costado del Metro Canto Rey
                    </p>
                    <p className="text-pink-bright text-sm font-medium mt-2">
                      Haz clic en el marcador para ver más detalles
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Cómo Llegar */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                ¿Cómo llegar? 🗺️
              </h2>
              <p className="text-xl text-gray-600">
                Te explicamos las mejores rutas para visitarnos
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {directions.map((direction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-gradient-to-br from-pink-light/10 to-rose-light/20 rounded-3xl p-8 text-center hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-16 h-16 bg-pink-bright rounded-full flex items-center justify-center mx-auto mb-6">
                    <direction.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{direction.title}</h3>
                  <p className="text-gray-600 mb-4">{direction.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-pink-bright to-pink-dark">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                ¡Te esperamos en nuestra tienda! 🌸
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Ven y descubre la magia de crear arreglos personalizados con nuestro equipo experto
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="https://www.google.com/maps/place/Flores+%26+Detalles+Lima/@-11.9753631,-77.0062079,17z/data=!4m10!1m2!2m1!1sFlores+%26+Detalles+Lima!3m6!1s0x9105c5415aafe44d:0x5141eade405d580c!8m2!3d-11.9753631!4d-77.0014443!15sChZGbG9yZXMgJiBEZXRhbGxlcyBMaW1hWhgiFmZsb3JlcyAmIGRldGFsbGVzIGxpbWGSAQdmbG9yaXN0mgEjQ2haRFNVaE5NRzluUzBWSlEwRm5TVU5QTUhaTWQyVkJFQUWqAXQKDS9nLzExdDByMTFfMjcKDS9nLzExeDh5ZjczejAQASoVIhFmbG9yZXMgJiBkZXRhbGxlcygOMh8QASIb3PlDxnbZPSWlaZsEYGv93mpLAA9iUiV8S6RFMhoQAiIWZmxvcmVzICYgZGV0YWxsZXMgbGltYeABAPoBBAgAEDA!16s%2Fg%2F11t0r11_27?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-pink-bright px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📍 Cómo llegar
                </motion.a>
                
                <motion.a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openWhatsApp({ 
                      phoneNumber: WHATSAPP_NUMBERS.MAIN, 
                      message: WHATSAPP_MESSAGES.STORE_VISIT 
                    });
                  }}
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-pink-bright transition-all transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💬 Reservar Visita
                </motion.a>
              </div>
              
              <div className="mt-6 flex justify-center items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-white ml-3 font-semibold">4.9/5 - Más de 500 reseñas</span>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
    </PageTransition>
  );
}
