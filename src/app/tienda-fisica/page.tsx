import { Metadata } from 'next';
import { MapPin, Phone, Clock, Star, Navigation, Calendar, Flower2, Sparkles, Gift } from 'lucide-react';

export const metadata: Metadata = {
  title: "Tienda Física | Flores D'Jazmin - Visítanos en Lima",
  description: "Visita nuestra tienda física en Lima. Descubre nuestros arreglos florales, consulta con nuestros expertos y llévate un ramo hermoso hoy mismo.",
};

export default function TiendaFisicaPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary-100 via-pink-50 to-white">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Nuestra Tienda Física
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Ven a conocernos y descubre la magia de nuestras flores en persona
            </p>
          </div>
        </div>
      </section>

      {/* Store Info */}
      <section className="py-16">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Map */}
            <div className="aspect-video md:aspect-square bg-gray-200 rounded-2xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3903.5!2d-77.0062079!3d-11.9753631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c5415aafe44d%3A0x5141eade405d580c!2sflores%20y%20detalles%20lima!5e0!3m2!1ses!2spe!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Flores D'Jazmin"
              />
            </div>

            {/* Info Cards */}
            <div className="space-y-6">
              {/* Address */}
              <div className="flex gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Dirección</h3>
                  <p className="text-gray-600">Av. Próceres de la Independencia N°3301</p>
                  <p className="text-gray-600">Mercado Progreso Los Pinos, 2do. Piso - Tienda 12</p>
                  <p className="text-gray-600">San Juan de Lurigancho, Lima</p>
                  <a 
                    href="https://www.google.com/maps/place/flores+y+detalles+lima/@-11.9753631,-77.0062079,17z" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary-600 text-sm mt-2 hover:text-primary-700"
                  >
                    <Navigation className="w-4 h-4" />
                    Cómo llegar
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Horarios</h3>
                  <div className="space-y-1 text-gray-600">
                    <p className="flex justify-between">
                      <span>Lunes - Domingo</span>
                      <span className="font-medium">8:00 AM - 10:00 PM</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Módulo de Flores</span>
                      <span className="font-medium">2:00 PM - 10:00 PM</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Teléfono</h3>
                  <a 
                    href="tel:+51919642610" 
                    className="text-lg text-gray-800 hover:text-primary-600"
                  >
                    +51 919 642 610
                  </a>
                  <p className="text-sm text-gray-500 mt-1">
                    Atención personalizada - También WhatsApp
                  </p>
                </div>
              </div>

              {/* Appointment */}
              <div className="flex gap-4 p-6 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">¿Evento especial?</h3>
                  <p className="text-white/90 text-sm mb-3">
                    Agenda una cita personalizada con nuestro equipo de diseño floral
                  </p>
                  <a 
                    href="/contacto"
                    className="inline-flex items-center px-4 py-2 bg-white text-primary-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Agendar Cita
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Features */}
      <section className="py-16 bg-gray-50">
        <div className="container-wide">
          <h2 className="font-display text-3xl font-bold text-gray-800 text-center mb-12">
            ¿Qué encontrarás en nuestra tienda?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Flower2 className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Flores Frescas Diarias
              </h3>
              <p className="text-gray-600">
                Recibimos flores frescas todos los días directamente de los mejores productores
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Diseño Personalizado
              </h3>
              <p className="text-gray-600">
                Nuestros floristas crean arreglos únicos adaptados a tus gustos y ocasión
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Complementos y Regalos
              </h3>
              <p className="text-gray-600">
                Chocolates, peluches, globos y más para complementar tu arreglo floral
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16">
        <div className="container-wide">
          <h2 className="font-display text-3xl font-bold text-gray-800 text-center mb-12">
            Lo que dicen nuestros clientes
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'María García',
                rating: 5,
                text: 'Excelente atención y flores hermosas. Siempre que necesito un arreglo especial, vengo aquí.',
              },
              {
                name: 'Carlos López',
                rating: 5,
                text: 'Los mejores arreglos para eventos corporativos. Muy profesionales y puntuales.',
              },
              {
                name: 'Ana Rodríguez',
                rating: 5,
                text: 'Me encanta la variedad de flores que tienen. El personal es muy amable y te ayuda a elegir.',
              },
            ].map((review, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">&quot;{review.text}&quot;</p>
                <p className="font-medium text-gray-800">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
