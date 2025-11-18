'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Heart, Users, Flower2, Clock, MapPin, Sun, Sparkles, Flower, Crown, Shield, Truck, Star, ChevronDown, HelpCircle } from 'lucide-react';
import HeroCarousel from '@/components/HeroCarousel';
import YellowFlowersCatalog2025 from '@/components/YellowFlowersCatalog2025';
import FlowerCatalogReal from "@/components/FlowerCatalogReal";
import GlobalLoader from '@/components/GlobalLoader';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useCriticalImagesPreload } from '@/hooks/useImagePreload';

export default function Home() {
  const searchParams = useSearchParams();
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const { isLoading, setLoading } = useLoadingState({ 
    initialLoading: true, 
    minimumLoadingTime: 1500 // Reducido para mejor UX
  });

  // Precargar imágenes críticas
  const { isLoading: imagesLoading } = useCriticalImagesPreload();

  useEffect(() => {
    const orderStatus = searchParams.get('order');
    const orderNum = searchParams.get('order_number');
    
    if (orderStatus === 'success') {
      setShowOrderSuccess(true);
      setOrderNumber(orderNum);
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowOrderSuccess(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Controlar la carga principal basada en imágenes críticas
  useEffect(() => {
    const initializeApp = async () => {
      // Esperar a que las imágenes críticas se carguen
      if (!imagesLoading) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoading(false);
      }
    };

    initializeApp();
  }, [imagesLoading, setLoading]);

  return (
    <>
      <GlobalLoader isLoading={isLoading} />
      
      <main className="min-h-screen overflow-x-hidden w-full max-w-full">
        {/* Order Success Modal */}
        {showOrderSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ¡Pedido realizado con éxito!
            </h3>
            {orderNumber && (
              <p className="text-gray-600 mb-4">
                Número de pedido: <span className="font-semibold">{orderNumber}</span>
              </p>
            )}
            <p className="text-gray-600 mb-6">
              Recibirás un email de confirmación con los detalles de tu pedido.
            </p>
            <button
              onClick={() => setShowOrderSuccess(false)}
              className="w-full bg-pink-bright text-white px-4 py-2 rounded-lg hover:bg-pink-dark transition-colors"
            >
              Continuar comprando
            </button>
          </div>
        </div>
        )}
        
        {/* Hero Section with H1 */}
        <HeroCarousel />
        
        <YellowFlowersCatalog2025 />
        <FlowerCatalogReal />
        
        {/* SEO Content Section */}
        <SEOSection />
      </main>
    </>
  );
}

// Componente FAQ Section con estado para acordeón
function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqData = [
    {
      question: "¿Hacen delivery en San Juan de Lurigancho?",
      answer: "Sí, ofrecemos delivery gratuito en Canto Rey y servicio con tarifa preferencial en el resto de San Juan de Lurigancho. Nuestro servicio express garantiza entregas el mismo día con flores frescas y en perfectas condiciones.",
      icon: <Truck className="w-5 h-5 text-white" />
    },
    {
      question: "¿Qué tipos de flores manejan?",
      answer: "Contamos con una amplia variedad: rosas rojas premium, tulipanes holandeses, girasoles vibrantes, orquídeas exóticas, liliums aromáticos, claveles tradicionales y muchas más. Todas nuestras flores son frescas y de calidad premium, seleccionadas diariamente.",
      icon: <Flower2 className="w-5 h-5 text-white" />
    },
    {
      question: "¿Hacen arreglos para bodas y eventos?",
      answer: "Sí, somos especialistas en decoración floral para bodas, quinceañeros, bautizos y eventos corporativos. Ofrecemos consultoría personalizada, diseños únicos y coordinamos toda la decoración floral de tu evento especial.",
      icon: <Heart className="w-5 h-5 text-white" />
    },
    {
      question: "¿Cuál es el horario de atención?",
      answer: "Atendemos de lunes a domingo de 8:00 AM a 8:00 PM. Nuestro servicio de atención al cliente vía WhatsApp está disponible las 24 horas para consultas urgentes y pedidos de último momento.",
      icon: <Clock className="w-5 h-5 text-white" />
    },
    {
      question: "¿Garantizan la frescura de las flores?",
      answer: "Absolutamente. Garantizamos que todas nuestras flores lleguen frescas y duraderas. Si no estás satisfecho con la calidad, reemplazamos tu pedido sin costo adicional. Nuestras flores duran entre 7-10 días con el cuidado adecuado.",
      icon: <Shield className="w-5 h-5 text-white" />
    },
    {
      question: "¿Puedo personalizar mi arreglo floral?",
      answer: "¡Por supuesto! Ofrecemos servicio de personalización completa. Puedes elegir tipos de flores, colores, tamaño del arreglo y agregar complementos como chocolates, peluches o tarjetas. Nuestros floristas expertos crearán el arreglo perfecto para ti.",
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
      const duration = 2000; // 2 segundos
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

// Componente SEO moderno y responsivo con animaciones cute
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
            Flores y Detalles Lima
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            La florería más confiable de San Juan de Lurigancho, especializada en flores frescas premium y arreglos florales únicos
          </p>
        </div>

        {/* Stats Grid con animaciones */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-16">
          <StatCard 
            icon={<Users className="w-6 h-6" />}
            number={347}
            suffix="+"
            label="Clientes Satisfechos"
            color="pink"
          />
          <StatCard 
            icon={<Flower2 className="w-6 h-6" />}
            number={85}
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
            text="Canto Rey"
            label="Delivery Gratuito"
            color="green"
          />
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Sobre Nosotros */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Tu Florería de Confianza en San Juan de Lurigancho
            </h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Flores y Detalles Lima</strong> es la florería líder en San Juan de Lurigancho, especializada en 
                flores frescas premium y arreglos florales únicos. Desde hace años, nos dedicamos a crear momentos 
                especiales con las mejores flores del mercado, seleccionadas cuidadosamente para garantizar frescura 
                y belleza excepcional.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Nuestro catálogo incluye una amplia variedad de flores como <strong>rosas rojas premium</strong>, 
                <strong>tulipanes holandeses</strong>, <strong>girasoles vibrantes</strong>, <strong>orquídeas exóticas</strong> 
                y <strong>liliums aromáticos</strong>. Cada arreglo floral es diseñado por nuestros expertos floristas 
                con años de experiencia en el arte floral.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Ofrecemos <strong>delivery gratuito en Canto Rey</strong> y servicio de entrega a toda Lima Este 
                con tarifas preferenciales. Nuestro servicio express garantiza que tus flores lleguen frescas y en 
                perfectas condiciones en el momento exacto que las necesites.
              </p>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Nuestros Servicios
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Arreglos para Bodas</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">Decoración floral completa para tu día especial</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Eventos Corporativos</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">Ambientación profesional para empresas</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Ramos Personalizados</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">Diseños únicos según tus preferencias</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Ocasiones Especiales</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">San Valentín, Día de la Madre, cumpleaños</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flores Populares */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
            Nuestras Flores Más Populares
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[
              { name: "Rosas Rojas", icon: <Heart className="w-8 h-8" />, desc: "Clásicas y elegantes", color: "text-rose-500" },
              { name: "Tulipanes", icon: <Flower2 className="w-8 h-8" />, desc: "Frescura holandesa", color: "text-pink-500" },
              { name: "Girasoles", icon: <Sun className="w-8 h-8" />, desc: "Alegría y vitalidad", color: "text-yellow-500" },
              { name: "Orquídeas", icon: <Sparkles className="w-8 h-8" />, desc: "Exóticas y duraderas", color: "text-purple-500" },
              { name: "Liliums", icon: <Flower className="w-8 h-8" />, desc: "Aromáticos y elegantes", color: "text-indigo-500" },
              { name: "Claveles", icon: <Crown className="w-8 h-8" />, desc: "Tradición y belleza", color: "text-emerald-500" }
            ].map((flower, index) => (
              <div key={index} className="group text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className={`inline-flex p-3 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 mb-4 group-hover:scale-110 transition-transform duration-300 ${flower.color}`}>
                  {flower.icon}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm md:text-base mb-2">{flower.name}</h4>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{flower.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ubicación y Contacto */}
        <div className="mt-16 grid md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Nuestra Ubicación
            </h3>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-600 mb-4">
                Nos encontramos estratégicamente ubicados en <strong>San Juan de Lurigancho</strong>, 
                el distrito más poblado de Lima, para brindarte el mejor servicio de flores frescas 
                con entregas rápidas y confiables.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div><strong>Zona de Cobertura:</strong></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Canto Rey (delivery gratuito)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>San Juan de Lurigancho (consultar tarifa)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Lima Este (servicio disponible)</span>
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
                    <h4 className="font-semibold text-gray-900 mb-1">Delivery Express</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Entrega gratuita en Canto Rey el mismo día</p>
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