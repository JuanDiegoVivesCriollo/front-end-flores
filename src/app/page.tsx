'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Heart, Users, Flower2, Clock, MapPin, Flower, Shield, Truck, Star, ChevronDown, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import HeroCarousel from '@/components/HeroCarousel';

export default function Home() {
  return (
    <>
      {/* Contenido SEO Estático - SIEMPRE visible para bots (oculto visualmente) */}
      <div className="sr-only">
        <h2>Las Mejores Flores Frescas de Lima</h2>
        <p>Flores D&apos; Jazmin - Florería premium especializada en flores frescas y hermosas de Lima. Especialistas en rosas rojas, tulipanes, girasoles, orquídeas, liliums y todo tipo de arreglos florales para bodas, cumpleaños, aniversarios y eventos especiales.</p>
        
        <h2>Nuestros Productos y Servicios</h2>
        <h3>Flores Frescas Premium</h3>
        <ul>
          <li>Rosas Rojas Premium - Desde S/ 45.00</li>
          <li>Tulipanes Frescos - Desde S/ 35.00</li>
          <li>Girasoles Brillantes - Desde S/ 30.00</li>
          <li>Orquídeas Exóticas - Desde S/ 65.00</li>
          <li>Liliums Perfumados - Desde S/ 40.00</li>
        </ul>
        
        <h3>Arreglos Florales Profesionales</h3>
        <ul>
          <li>Arreglos para Bodas - Desde S/ 150.00</li>
          <li>Bouquets de Cumpleaños - Desde S/ 55.00</li>
          <li>Centros de Mesa - Desde S/ 80.00</li>
          <li>Arreglos San Valentín - Desde S/ 60.00</li>
        </ul>

        <h3>Ocasiones Especiales</h3>
        <p>Flores perfectas para: San Valentín, Día de la Madre, Bodas, Cumpleaños, Aniversarios, Graduaciones, Día de la Mujer, Navidad, Año Nuevo.</p>
        
        <address>
          <h3>Contacto</h3>
          <p>📞 Teléfono: +51 919 642 610</p>
          <p>📧 Email: info@floresdjazmin.com</p>
          <p>📍 Ubicación: Lima, Perú</p>
          <p>🕒 Horarios: Lunes a Domingo 9:00 AM - 8:00 PM</p>
        </address>
      </div>
      
      <div className="overflow-x-hidden w-full max-w-full">
        {/* Hero Section with Carousel */}
        <HeroCarousel />
        
        {/* Catálogo de Flores - Cards Falsas */}
        <FlowerCatalogSection />
        
        {/* SEO Content Section */}
        <SEOSection />
      </div>
    </>
  );
}

// Componente de Catálogo con cards falsas
function FlowerCatalogSection() {
  const dummyFlowers = [
    { id: 1, name: "Rosas Premium", price: 45, category: "Rosas" },
    { id: 2, name: "Tulipanes Holandeses", price: 35, category: "Tulipanes" },
    { id: 3, name: "Girasoles Brillantes", price: 30, category: "Girasoles" },
    { id: 4, name: "Orquídeas Exóticas", price: 65, category: "Orquídeas" },
    { id: 5, name: "Liliums Aromáticos", price: 40, category: "Liliums" },
    { id: 6, name: "Claveles Tradicionales", price: 25, category: "Claveles" },
    { id: 7, name: "Bouquet Romántico", price: 55, category: "Arreglos" },
    { id: 8, name: "Centro de Mesa", price: 80, category: "Arreglos" },
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-pink-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nuestro Catálogo de Flores
          </h2>
          <p className="text-lg text-gray-600">
            Descubre nuestra selección de flores frescas y arreglos exclusivos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dummyFlowers.map((flower) => (
            <div
              key={flower.id}
              className="bg-white rounded-2xl shadow-lg border-2 border-pink-100 overflow-hidden group hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {/* Imagen placeholder con gradiente */}
              <div className="relative h-64 bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100 flex items-center justify-center">
                <Flower2 className="w-20 h-20 text-pink-300 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute top-3 right-3 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Nuevo
                </div>
              </div>

              {/* Información */}
              <div className="p-5">
                <span className="text-xs font-semibold text-pink-600 uppercase tracking-wide">
                  {flower.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2 mb-3">
                  {flower.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-pink-600">
                      S/ {flower.price}
                    </span>
                  </div>
                  <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Ver
                  </button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">(24 reseñas)</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón ver más */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            Ver Catálogo Completo
          </button>
        </div>
      </div>
    </section>
  );
}

// Componente de Carrusel de Flores Populares
function PopularFlowersCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const flowers = [
    { name: "Rosas", image: "/img/imgFloresPopulares/imgRosas.png", desc: "Clásicas y elegantes" },
    { name: "Tulipanes", image: "/img/imgFloresPopulares/imgTulipanes.png", desc: "Frescura holandesa" },
    { name: "Girasoles", image: "/img/imgFloresPopulares/imgGirasoles.png", desc: "Alegría y vitalidad" },
    { name: "Orquídeas", image: "/img/imgFloresPopulares/imgorquideas.png", desc: "Exóticas y duraderas" },
    { name: "Liliums", image: "/img/imgFloresPopulares/imgliliums.png", desc: "Aromáticos y elegantes" },
    { name: "Claveles", image: "/img/imgFloresPopulares/imgclaveles.png", desc: "Tradición y belleza" }
  ];

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % flowers.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, flowers.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % flowers.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + flowers.length) % flowers.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Calcular slides visibles (3 en desktop, 1 en móvil)
  const getVisibleFlowers = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % flowers.length;
      result.push({ ...flowers[index], originalIndex: index });
    }
    return result;
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4">
      {/* Carrusel */}
      <div className="relative overflow-hidden">
        <div className="flex gap-6 transition-transform duration-500 ease-out">
          {/* Mobile: mostrar solo 1 */}
          <div className="block md:hidden w-full">
            <div className="bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 rounded-3xl shadow-xl border-2 border-pink-300 overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="relative h-[400px] bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100">
                <Image
                  src={flowers[currentIndex].image}
                  alt={flowers[currentIndex].name}
                  fill
                  className="object-contain p-8 group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </div>
              <div className="p-6 text-center bg-gradient-to-br from-white/80 to-pink-50/80 backdrop-blur-sm">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{flowers[currentIndex].name}</h4>
                <p className="text-gray-700">{flowers[currentIndex].desc}</p>
              </div>
            </div>
          </div>

          {/* Desktop: mostrar 3 */}
          <div className="hidden md:flex gap-6 w-full">
            {getVisibleFlowers().map((flower, idx) => (
              <div
                key={flower.originalIndex}
                className={`flex-1 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100 rounded-3xl shadow-xl border-2 border-pink-300 overflow-hidden group hover:shadow-2xl transition-all duration-300 ${
                  idx === 1 ? 'scale-105 border-pink-400 shadow-pink-200' : ''
                }`}
              >
                <div className="relative h-[400px] bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100">
                  <Image
                    src={flower.image}
                    alt={flower.name}
                    fill
                    className="object-contain p-8 group-hover:scale-105 transition-transform duration-300"
                    sizes="500px"
                  />
                </div>
                <div className="p-6 text-center bg-gradient-to-br from-white/80 to-pink-50/80 backdrop-blur-sm">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{flower.name}</h4>
                  <p className="text-gray-700 text-sm">{flower.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <button
        onClick={goToPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 z-10 border-2 border-pink-200"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6 text-pink-600" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 z-10 border-2 border-pink-200"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-6 h-6 text-pink-600" />
      </button>

      {/* Indicadores */}
      <div className="flex justify-center gap-2 mt-8">
        {flowers.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-pink-600 w-8'
                : 'bg-pink-200 hover:bg-pink-400'
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Componente FAQ Section con estado para acordeón
function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqData = [
    {
      question: "¿Hacen delivery en Lima?",
      answer: "Sí, ofrecemos servicio de delivery en Lima. Contáctanos para más información sobre zonas de cobertura y tarifas.",
      icon: <Truck className="w-5 h-5 text-white" />
    },
    {
      question: "¿Qué tipos de flores manejan?",
      answer: "Contamos con una amplia variedad: rosas rojas premium, tulipanes holandeses, girasoles vibrantes, orquídeas exóticas, liliums aromáticos, claveles tradicionales y muchas más. Todas nuestras flores son frescas y de calidad premium.",
      icon: <Flower2 className="w-5 h-5 text-white" />
    },
    {
      question: "¿Hacen arreglos para bodas y eventos?",
      answer: "Sí, somos especialistas en decoración floral para bodas, quinceañeros, bautizos y eventos corporativos. Ofrecemos consultoría personalizada y diseños únicos.",
      icon: <Heart className="w-5 h-5 text-white" />
    },
    {
      question: "¿Cuál es el horario de atención?",
      answer: "Atendemos de lunes a domingo de 9:00 AM a 8:00 PM. Nuestro servicio de atención al cliente está disponible para consultas y pedidos.",
      icon: <Clock className="w-5 h-5 text-white" />
    },
    {
      question: "¿Garantizan la frescura de las flores?",
      answer: "Absolutamente. Garantizamos que todas nuestras flores lleguen frescas y duraderas. Si no estás satisfecho con la calidad, reemplazamos tu pedido sin costo adicional.",
      icon: <Shield className="w-5 h-5 text-white" />
    },
    {
      question: "¿Puedo personalizar mi arreglo floral?",
      answer: "¡Por supuesto! Ofrecemos servicio de personalización completa. Puedes elegir tipos de flores, colores, tamaño del arreglo y agregar complementos como chocolates o peluches.",
      icon: <Star className="w-5 h-5 text-white" />
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="space-y-4">
      {faqData.map((item, index) => (
        <FAQItem
          key={index}
          question={item.question}
          answer={item.answer}
          icon={item.icon}
          isOpen={openItems.includes(index)}
          onToggle={() => toggleItem(index)}
        />
      ))}
    </div>
  );
}

// Componente StatCard con animación de conteo
function StatCard({ icon, number, suffix = '', text, label, color }: {
  icon: React.ReactNode;
  number?: number;
  suffix?: string;
  text?: string;
  label: string;
  color: 'pink' | 'purple' | 'blue' | 'green';
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (number && !hasAnimated) {
      const duration = 2000;
      const steps = 60;
      const increment = number / steps;
      let currentCount = 0;

      const timer = setInterval(() => {
        currentCount += increment;
        if (currentCount >= number) {
          setCount(number);
          setHasAnimated(true);
          clearInterval(timer);
        } else {
          setCount(Math.floor(currentCount));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [number, hasAnimated]);

  const colorClasses = {
    pink: 'from-pink-500 to-rose-500 text-white',
    purple: 'from-purple-500 to-indigo-500 text-white',
    blue: 'from-blue-500 to-cyan-500 text-white',
    green: 'from-green-500 to-emerald-500 text-white'
  };

  const bgClasses = {
    pink: 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200',
    purple: 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200',
    blue: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
    green: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
  };

  return (
    <div className={`group text-center p-6 bg-white rounded-2xl shadow-sm border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer ${bgClasses[color]}`}>
      <div className={`inline-flex p-3 rounded-full bg-gradient-to-r mb-4 group-hover:scale-110 transition-transform duration-300 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">
        {text || `${count}${suffix}`}
      </div>
      <div className="text-gray-600 text-sm md:text-base font-medium">{label}</div>
    </div>
  );
}

// Componente FAQ Item interactivo
function FAQItem({ question, answer, icon, isOpen, onToggle }: {
  question: string;
  answer: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h4 className="font-semibold text-gray-900 text-left">{question}</h4>
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-5 pl-20">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

// Componente SEO moderno y responsivo
function SEOSection() {
  return (
    <section className="bg-gradient-to-br from-pink-50 via-white to-purple-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block p-3 bg-pink-100 rounded-full mb-6">
            <Heart className="w-8 h-8 text-pink-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Flores D&apos; Jazmin
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Florería premium especializada en flores frescas y arreglos florales únicos para todas tus ocasiones especiales
          </p>
        </div>

        {/* Stats Grid con animaciones */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-16">
          <StatCard 
            icon={<Users className="w-6 h-6" />}
            number={300}
            suffix="+"
            label="Clientes Satisfechos"
            color="pink"
          />
          <StatCard 
            icon={<Flower2 className="w-6 h-6" />}
            number={50}
            suffix="+"
            label="Variedades de Flores"
            color="purple"
          />
          <StatCard 
            icon={<Clock className="w-6 h-6" />}
            number={24}
            suffix="/7"
            label="Atención al Cliente"
            color="blue"
          />
          <StatCard 
            icon={<MapPin className="w-6 h-6" />}
            text="Lima"
            label="Delivery Disponible"
            color="green"
          />
        </div>

        {/* Flores Populares - Carrusel */}
        <div className="mt-16">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">
            Nuestras Flores Más Populares
          </h3>
          <PopularFlowersCarousel />
        </div>

        {/* Ubicación y Contacto */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Nuestra Ubicación
            </h3>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-600 mb-4">
                Nos encontramos en <strong>Lima, Perú</strong>, 
                para brindarte el mejor servicio de flores frescas 
                con entregas rápidas y confiables.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div><strong>Zona de Cobertura:</strong></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Lima Metropolitana</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Consultar disponibilidad</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              ¿Por Qué Elegirnos?
            </h3>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Flower className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Flores Siempre Frescas</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Selección diaria de las mejores flores del mercado</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Delivery Confiable</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Entrega rápida y segura en Lima</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Diseños Únicos</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Arreglos personalizados por floristas expertos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <div className="inline-block p-3 bg-purple-100 rounded-full mb-6">
              <HelpCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encuentra respuestas a las dudas más comunes sobre nuestros servicios de florería
            </p>
          </div>
          
          <FAQSection />
        </div>
      </div>
    </section>
  );
}
