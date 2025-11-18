'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Heart, Instagram, Facebook } from 'lucide-react';
import { useState } from 'react';
import { openWhatsApp, WHATSAPP_NUMBERS } from '@/utils/whatsapp';
import PhoneInput from '@/components/PhoneInput';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const contactInfo = [
    {
      icon: MapPin,
      title: "Dirección",
      content: "Av. Próceres de la Independencia N°3301\nMercado Progreso Los Pinos, 2do. Piso - Tienda 12\nSan Juan de Lurigancho, Lima",
      action: "Cómo llegar"
    },
    {
      icon: Phone,
      title: "Teléfono",
      content: "+51 919 642 610\nAtención personalizada",
      action: "Llamar Ahora"
    },
    {
      icon: Mail,
      title: "Email",
      content: "floresydetalleslima1@gmail.com",
      action: "Enviar Email"
    },
    {
      icon: Clock,
      title: "Horarios",
      content: "Lun - Dom: 8:00 AM - 10:00 PM\nMódulo de Flores: 2:00 PM - 10:00 PM",
      action: "Ver Disponibilidad"
    }
  ];

  const socialMedia = [
    { 
      icon: Instagram, 
      name: "Instagram", 
      handle: "@floresydetalleslima", 
      color: "from-pink-500 to-purple-500",
      url: "#", // Pendiente de agregar
      isCustomIcon: false
    },
    { 
      icon: Facebook, 
      name: "Facebook", 
      handle: "FloresyDetallesLima", 
      color: "from-blue-600 to-blue-700",
      url: "https://www.facebook.com/floresydetalleslima/?locale=es_LA",
      isCustomIcon: false
    },
    { 
      icon: null, // Will use custom SVG
      name: "TikTok", 
      handle: "@floresydetalleslima", 
      color: "from-black to-gray-800",
      url: "https://www.tiktok.com/@floresydetalleslima",
      isCustomIcon: true
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que el teléfono sea válido antes de enviar
    if (!isPhoneValid && formData.phone) {
      alert('Por favor, ingresa un número de teléfono válido (9 dígitos que inicie con 9)');
      return;
    }
    
    // Crear el mensaje para WhatsApp con todos los datos del formulario
    const message = `🌸 *Nuevo contacto desde Flores y Detalles Lima*

👤 *Nombre:* ${formData.name}
📧 *Email:* ${formData.email}
📱 *Teléfono:* ${formData.phone}
📝 *Asunto:* ${formData.subject}

💬 *Mensaje:*
${formData.message}

---
Enviado desde el formulario web`;

    // Abrir WhatsApp con el mensaje
    openWhatsApp({ 
      phoneNumber: WHATSAPP_NUMBERS.MAIN, 
      message 
    });
    
    // Limpiar el formulario
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    
    alert('¡Te estamos redirigiendo a WhatsApp para enviar tu mensaje! 🌸');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-white via-rose-light/20 to-pink-light/30">
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
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <MessageCircle className="w-16 h-16 text-pink-bright" />
            </motion.div>
          </div>
          <h2 className="text-5xl font-bold text-pink-dark mb-6">
            ¡Conversemos! 💬
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Estamos aquí para ayudarte a crear momentos especiales. Contáctanos por cualquier 
            medio y te responderemos en menos de 2 horas.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Información de Contacto */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid gap-6 mb-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-pink-light rounded-2xl p-3">
                      <info.icon className="w-6 h-6 text-pink-dark" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-pink-dark mb-2">{info.title}</h3>
                      <p className="text-gray-600 whitespace-pre-line mb-3">{info.content}</p>
                      <button 
                        className="text-pink-bright hover:text-pink-dark font-semibold text-sm transition-colors"
                        onClick={() => {
                          if (info.action === "Cómo llegar") {
                            window.open('https://www.google.com/maps/place/Flores+%26+Detalles+Lima/@-11.9753631,-77.0062079,17z/data=!4m10!1m2!2m1!1sFlores+%26+Detalles+Lima!3m6!1s0x9105c5415aafe44d:0x5141eade405d580c!8m2!3d-11.9753631!4d-77.0014443!15sChZGbG9yZXMgJiBEZXRhbGxlcyBMaW1hWhgiFmZsb3JlcyAmIGRldGFsbGVzIGxpbWGSAQdmbG9yaXN0mgEjQ2haRFNVaE5NRzluUzBWSlEwRm5TVU5QTUhaTWQyVkJFQUWqAXQKDS9nLzExdDByMTFfMjcKDS9nLzExeDh5ZjczejAQASoVIhFmbG9yZXMgJiBkZXRhbGxlcygOMh8QASIb3PlDxnbZPSWlaZsEYGv93mpLAA9iUiV8S6RFMhoQAiIWZmxvcmVzICYgZGV0YWxsZXMgbGltYeABAPoBBAgAEDA!16s%2Fg%2F11t0r11_27?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D', '_blank');
                          } else if (info.action === "Llamar Ahora") {
                            window.open('tel:+51919642610');
                          } else if (info.action === "Enviar Email") {
                            window.open('mailto:floresydetalleslima1@gmail.com');
                          }
                        }}
                      >
                        {info.action} →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Redes Sociales */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-pink-dark mb-6 text-center">
                Síguenos en Redes Sociales 📱
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {socialMedia.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gradient-to-r ${social.color} p-3 sm:p-4 rounded-xl text-white text-center cursor-pointer block`}
                  >
                    {social.isCustomIcon ? (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2">
                        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.10z"/>
                        </svg>
                      </div>
                    ) : (
                      social.icon && <social.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                    )}
                    <div className="text-xs sm:text-sm font-semibold">{social.name}</div>
                    <div className="text-[10px] sm:text-xs opacity-90 break-all">{social.handle}</div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Formulario de Contacto */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <Heart className="w-12 h-12 text-pink-bright mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-pink-dark mb-2">
                  Envíanos un Mensaje
                </h3>
                <p className="text-gray-600">
                  Completa el formulario y te contactaremos pronto
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-pink-bright focus:ring-2 focus:ring-pink-light transition-all"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(phone, isValid) => {
                        setFormData(prev => ({ ...prev, phone }));
                        setIsPhoneValid(isValid);
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-pink-bright focus:ring-2 focus:ring-pink-light transition-all"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Asunto
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-pink-bright focus:ring-2 focus:ring-pink-light transition-all"
                  >
                    <option value="">Selecciona un tema</option>
                    <option value="arreglo-personalizado">Arreglo Personalizado</option>
                    <option value="boda-evento">Boda o Evento</option>
                    <option value="delivery">Consulta de Delivery</option>
                    <option value="cotizacion">Solicitar Cotización</option>
                    <option value="reclamo">Reclamo o Sugerencia</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-pink-bright focus:ring-2 focus:ring-pink-light transition-all resize-none"
                    placeholder="Cuéntanos cómo podemos ayudarte a crear un momento especial..."
                  ></textarea>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-pink-bright to-pink-dark text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar Mensaje 💕
                </motion.button>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  También puedes escribirnos por WhatsApp para una respuesta más rápida
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    openWhatsApp({ 
                      phoneNumber: WHATSAPP_NUMBERS.MAIN 
                    });
                  }}
                  className="mt-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
                >
                  💬 Chatear por WhatsApp
                </motion.button>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Mapa o CTA adicional */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-pink-bright to-pink-dark rounded-3xl p-6 sm:p-12 text-white text-center">
            <h3 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6">
              ¿Necesitas Ayuda Inmediata? 🚨
            </h3>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90">
              Para emergencias o pedidos urgentes, llámanos directamente
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-pink-bright px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-lg transition-all"
                onClick={() => window.open('tel:+51919642610')}
              >
                📞 +51 919 642 610
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-4 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-lg hover:bg-white hover:text-pink-bright transition-all break-all"
                onClick={() => window.open('mailto:floresydetalleslima1@gmail.com')}
              >
                <span className="block sm:hidden">📧 Email</span>
                <span className="hidden sm:block">📧 floresydetalleslima1@gmail.com</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
