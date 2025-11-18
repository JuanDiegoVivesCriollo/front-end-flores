'use client';

import { motion } from 'framer-motion';
import { Star, Quote, Heart, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "María González",
      role: "Novia Feliz",
      rating: 5,
      text: "¡Increíbles! Los arreglos para mi boda fueron exactamente como los soñé. Cada detalle fue perfecto y las flores duraron hermosas todo el día. Sin duda la mejor decisión fue elegir Flores y Detalles Lima.",
      date: "Hace 2 semanas"
    },
    {
      name: "Carlos Mendoza",
      role: "Esposo Enamorado",
      rating: 5,
      text: "Sorprendí a mi esposa con un ramo de rosas en nuestro aniversario. La entrega fue puntual y las flores llegaron en perfecto estado. Mi esposa lloró de emoción. ¡Gracias por ayudarme a crear este momento!",
      date: "Hace 1 semana"
    },
    {
      name: "Ana Rodríguez",
      role: "Organizadora de Eventos",
      rating: 5,
      text: "Trabajo con ellos para todos mis eventos corporativos. Su profesionalismo, creatividad y calidad son incomparables. Los arreglos siempre superan las expectativas de mis clientes. ¡Altamente recomendados!",
      date: "Hace 3 días"
    },
    {
      name: "Luis Torres",
      role: "Cliente Frecuente",
      rating: 5,
      text: "Cada mes les compro flores para mi esposa. Siempre innovando, siempre frescos, siempre hermosos. Han convertido un gesto simple en algo mágico. Mi esposa siempre pregunta: '¿de dónde sacaste estas flores tan lindas?'",
      date: "Hace 4 días"
    },
    {
      name: "Sofia Vargas",
      role: "Madre Orgullosa",
      image: "👩",
      rating: 5,
      text: "Para la graduación de mi hija pedí un arreglo especial. No solo cumplieron con el diseño que imaginé, sino que lo superaron. Mi hija estaba radiante y las fotos quedaron preciosas. ¡Mil gracias! 🎓",
      date: "Hace 5 días"
    },
    {
      name: "Roberto Silva",
      role: "CEO",
      image: "👨‍💼",
      rating: 5,
      text: "Para nuestra oficina necesitábamos arreglos florales elegantes y duraderos. El equipo de Flores y Detalles Lima nos ayudó a crear un ambiente hermoso y profesional. Nuestros clientes siempre comentan sobre las flores.",
      date: "Hace 1 semana"
    }
  ];

  const stats = [
    { number: "4.9/5", label: "Rating Promedio", icon: Star },
    { number: "2,500+", label: "Reseñas Positivas", icon: User },
    { number: "98%", label: "Clientes Satisfechos", icon: Heart },
    { number: "15,000+", label: "Entregas Realizadas", icon: Quote }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50/30 via-white to-purple-50/20">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-bright to-purple-500 rounded-full shadow-lg mb-6">
            <Quote className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-dark via-purple-600 to-pink-bright bg-clip-text text-transparent mb-6">
            Lo Que Dicen Nuestros Clientes
          </h2>
          
          <div className="h-2 w-24 bg-gradient-to-r from-pink-400 via-purple-500 to-pink-bright rounded-full mx-auto mb-6" />
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Miles de clientes han confiado en nosotros para sus momentos más especiales. 
            <span className="text-pink-bright font-semibold"> Sus sonrisas y palabras de agradecimiento son nuestra mayor recompensa.</span>
          </p>
        </motion.div>

        {/* Testimonial Principal */}
        <motion.div
          key={currentTestimonial}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl p-12 shadow-2xl mb-16 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-light/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-light/30 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <div className="text-6xl mb-6">{testimonials[currentTestimonial].image}</div>
            
            <div className="flex justify-center mb-6">
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                >
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}
            </div>
            
            <blockquote className="text-2xl text-gray-700 italic mb-8 leading-relaxed">
              &quot;{testimonials[currentTestimonial].text}&quot;
            </blockquote>
            
            <div>
              <div className="text-xl font-bold text-pink-dark">
                {testimonials[currentTestimonial].name}
              </div>
              <div className="text-gray-500">
                {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].date}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Indicadores de Testimonios */}
        <div className="flex justify-center gap-2 mb-16">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentTestimonial 
                  ? 'bg-pink-bright scale-125' 
                  : 'bg-gray-300 hover:bg-pink-light'
              }`}
            />
          ))}
        </div>

        {/* Grid de Testimonios Pequeños */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{testimonial.image}</span>
                <div>
                  <div className="font-bold text-pink-dark">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {testimonial.text.substring(0, 150)}...
              </p>
              
              <div className="text-xs text-gray-400 mt-3">{testimonial.date}</div>
            </motion.div>
          ))}
        </div>

        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-pink-bright to-pink-dark rounded-3xl p-8 text-white"
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            Números Que Nos Respaldan 📊
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-white/20 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-pink-light">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-pink-dark mb-4">
              ¿Quieres Ser Nuestro Próximo Cliente Feliz? 😊
            </h3>
            <p className="text-gray-600 mb-6">
              Únete a miles de clientes satisfechos y crea momentos inolvidables
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-pink-bright hover:bg-pink-dark text-white px-8 py-4 rounded-full font-bold text-lg transition-colors"
            >
              Realizar Mi Pedido 🌸
            </motion.button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
