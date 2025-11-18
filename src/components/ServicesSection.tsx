'use client';

import { motion } from 'framer-motion';
import { Crown, Gift, Car, Sparkles, MapPin, Phone, Calendar, Heart } from 'lucide-react';

export default function ServicesSection() {
  const services = [
    {
      icon: Crown,
      title: "Bodas & Eventos",
      description: "Decoración completa para tu día especial",
      features: ["Arreglos de ceremonia", "Centros de mesa", "Ramos de novia", "Decoración completa"],
      price: "Desde S/. 800",
      popular: true
    },
    {
      icon: Gift,
      title: "Arreglos Personalizados",
      description: "Diseños únicos para cada ocasión",
      features: ["Consulta personalizada", "Diseño exclusivo", "Flores premium", "Entrega incluida"],
      price: "Desde S/. 120",
      popular: false
    },
    {
      icon: Car,
      title: "Delivery Express",
      description: "Entrega el mismo día en Lima",
      features: ["Entrega en 2-4 horas", "Seguimiento en tiempo real", "Cuidado especial", "Lima y Callao"],
      price: "Desde S/. 15",
      popular: false
    },
    {
      icon: Sparkles,
      title: "Suscripción Floral",
      description: "Flores frescas cada semana",
      features: ["Arreglos semanales", "Variedades rotativos", "Descuento especial", "Sin compromiso"],
      price: "Desde S/. 80/sem",
      popular: false
    }
  ];

  const areas = [
    // Lima Centro
    { name: 'Lima Cercado', price: 20, zone: 'Centro' },
    { name: 'Breña', price: 20, zone: 'Centro' },
    { name: 'La Victoria', price: 20, zone: 'Centro' },
    { name: 'Rímac', price: 20, zone: 'Centro' },
    
    // Lima Norte
    { name: 'Ancón', price: 69, zone: 'Norte' },
    { name: 'Carabayllo', price: 50, zone: 'Norte' },
    { name: 'Comas', price: 35, zone: 'Norte' },
    { name: 'Independencia', price: 30, zone: 'Norte' },
    { name: 'Los Olivos', price: 25, zone: 'Norte' },
    { name: 'Puente Piedra', price: 35, zone: 'Norte' },
    { name: 'San Martín de Porres', price: 25, zone: 'Norte' },
    { name: 'Santa Rosa', price: 26, zone: 'Norte' },
    
    // Lima Este
    { name: 'Ate', price: 50, zone: 'Este' },
    { name: 'Chaclacayo', price: 70, zone: 'Este' },
    { name: 'Cieneguilla', price: 90, zone: 'Este' },
    { name: 'El Agustino', price: 20, zone: 'Este' },
    { name: 'La Molina', price: 35, zone: 'Este' },
    { name: 'Lurigancho - Chosica', price: 40, zone: 'Este' },
    { name: 'San Juan de Lurigancho', price: 20, zone: 'Este' },
    { name: 'Santa Anita', price: 25, zone: 'Este' },
    
    // Lima Sur
    { name: 'Chorrillos', price: 30, zone: 'Sur' },
    { name: 'Lurín', price: 55, zone: 'Sur' },
    { name: 'Pachacámac', price: 45, zone: 'Sur' },
    { name: 'Pucusana', price: 120, zone: 'Sur' },
    { name: 'Punta Hermosa', price: 140, zone: 'Sur' },
    { name: 'Punta Negra', price: 100, zone: 'Sur' },
    { name: 'San Bartolo', price: 80, zone: 'Sur' },
    { name: 'San Juan de Miraflores', price: 40, zone: 'Sur' },
    { name: 'Villa El Salvador', price: 45, zone: 'Sur' },
    { name: 'Villa María del Triunfo', price: 60, zone: 'Sur' },
    
    // Lima Oeste
    { name: 'Barranco', price: 25, zone: 'Oeste' },
    { name: 'Jesús María', price: 20, zone: 'Oeste' },
    { name: 'La Magdalena del Mar', price: 20, zone: 'Oeste' },
    { name: 'Lince', price: 25, zone: 'Oeste' },
    { name: 'Miraflores', price: 26, zone: 'Oeste' },
    { name: 'Pueblo Libre', price: 20, zone: 'Oeste' },
    { name: 'San Isidro', price: 25, zone: 'Oeste' },
    { name: 'San Miguel', price: 20, zone: 'Oeste' },
    { name: 'Surquillo', price: 20, zone: 'Oeste' },
    { name: 'Santiago de Surco', price: 25, zone: 'Oeste' },
    { name: 'San Borja', price: 20, zone: 'Oeste' },
    
    // Callao
    { name: 'Bellavista', price: 40, zone: 'Callao' },
    { name: 'Callao', price: 40, zone: 'Callao' },
    { name: 'Carmen de la Legua Reynoso', price: 30, zone: 'Callao' },
    { name: 'La Perla', price: 30, zone: 'Callao' },
    { name: 'La Punta', price: 50, zone: 'Callao' },
    { name: 'Mi Perú', price: 36, zone: 'Callao' },
    { name: 'Ventanilla', price: 50, zone: 'Callao' }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-pink-light/10 to-rose-light">
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
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-16 h-16 text-pink-bright" />
            </motion.div>
          </div>
          <h2 className="text-5xl font-bold text-pink-dark mb-6">
            Nuestros Servicios ✨
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Desde arreglos íntimos hasta eventos grandiosos, tenemos el servicio 
            perfecto para cada ocasión especial en tu vida.
          </p>
        </motion.div>

        {/* Servicios Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative bg-white rounded-3xl p-8 shadow-xl border-2 ${
                service.popular 
                  ? 'border-pink-bright bg-gradient-to-br from-pink-light/20 to-white' 
                  : 'border-transparent'
              }`}
            >
              {service.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-pink-bright text-white px-4 py-2 rounded-full text-sm font-bold">
                    ⭐ Más Popular
                  </div>
                </div>
              )}

              <div className="flex items-start gap-6">
                <div className="bg-pink-light rounded-2xl p-4">
                  <service.icon className="w-8 h-8 text-pink-dark" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-pink-dark mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600">
                        <Heart className="w-4 h-4 text-pink-bright" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-pink-bright">
                      {service.price}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-pink-bright hover:bg-pink-dark text-white px-6 py-3 rounded-full font-semibold transition-colors"
                    >
                      Solicitar Cotización
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Áreas de Cobertura */}
        <motion.div
          id="areas-cobertura"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl p-8 shadow-xl mb-16"
        >
          <div className="text-center mb-8">
            <MapPin className="w-12 h-12 text-pink-bright mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-pink-dark mb-4">
              Áreas de Cobertura 📍
            </h3>
            <p className="text-gray-600 mb-6">
              Realizamos entregas en todos los distritos de Lima y Callao con precios transparentes
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-center">
                <p className="text-blue-800 font-semibold mb-2">
                  💰 <strong>Precios de Envío por Distrito</strong>
                </p>
                <p className="text-gray-600">
                  Los precios varían según el distrito de destino. ¡Ya no necesitas consultar por WhatsApp!
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {areas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.02 }}
                className={`p-3 rounded-lg border-2 text-center ${
                  area.name === 'San Juan de Lurigancho' 
                    ? 'bg-gradient-to-r from-green-100 to-green-200 border-green-300 text-green-800'
                    : area.price <= 25
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-800'
                    : area.price <= 50
                    ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-800'
                    : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800'
                }`}
              >
                <div className="font-semibold text-sm mb-1">{area.name}</div>
                <div className="text-xs opacity-75 mb-1">{area.zone}</div>
                <div className="font-bold">
                  {area.name === 'San Juan de Lurigancho' ? (
                    <span className="text-green-700">🏠 Zona Local</span>
                  ) : (
                    `S/. ${area.price}`
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA de Contacto */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-pink-bright to-pink-dark rounded-3xl p-12 text-white">
            <h3 className="text-4xl font-bold mb-6">
              ¿Tienes una Ocasión Especial? 💕
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Contáctanos para crear el arreglo perfecto para tu momento especial
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-pink-bright px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Llamar Ahora
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-pink-bright transition-all flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Agendar Consulta
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
