import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Percent, Star, ArrowRight, Award, Sparkles, Tag, Zap, Gift } from 'lucide-react';

export const metadata: Metadata = {
  title: "Ofertas y Promociones | Flores D'Jazmin - Descuentos en Flores Lima",
  description: "Aprovecha nuestras ofertas especiales en arreglos florales. Descuentos exclusivos en ramos de rosas, bouquets y más. ¡No te los pierdas!",
};

const offers = [
  {
    id: 1,
    title: '20% OFF en Rosas Rojas',
    description: 'Válido para ramos de 12 y 24 rosas rojas premium',
    discount: 20,
    originalPrice: 180,
    finalPrice: 144,
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop',
    validUntil: '31 Dic 2024',
    category: 'Rosas',
    badge: 'Más vendido',
    badgeColor: 'bg-red-500',
  },
  {
    id: 2,
    title: '2x1 en Girasoles',
    description: 'Compra un ramo y lleva otro de regalo',
    discount: 50,
    originalPrice: 190,
    finalPrice: 95,
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?q=80&w=800&auto=format&fit=crop',
    validUntil: '31 Dic 2024',
    category: 'Girasoles',
    badge: '2x1',
    badgeColor: 'bg-amber-500',
  },
  {
    id: 3,
    title: '15% OFF Bouquets Mixtos',
    description: 'En toda nuestra línea de bouquets primaverales',
    discount: 15,
    originalPrice: 120,
    finalPrice: 102,
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=800&auto=format&fit=crop',
    validUntil: '31 Dic 2024',
    category: 'Bouquets',
    badge: 'Nuevo',
    badgeColor: 'bg-green-500',
  },
  {
    id: 4,
    title: '30% OFF Tulipanes',
    description: 'Ramos de tulipanes holandeses importados',
    discount: 30,
    originalPrice: 160,
    finalPrice: 112,
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?q=80&w=800&auto=format&fit=crop',
    validUntil: '15 Dic 2024',
    category: 'Tulipanes',
    badge: 'Limitado',
    badgeColor: 'bg-purple-500',
  },
  {
    id: 5,
    title: 'Combo Desayuno + Flores',
    description: 'Desayuno romántico + ramo de 6 rosas a precio especial',
    discount: 25,
    originalPrice: 280,
    finalPrice: 210,
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=800&auto=format&fit=crop',
    validUntil: '31 Dic 2024',
    category: 'Combos',
    badge: 'Combo',
    badgeColor: 'bg-pink-500',
  },
];

const benefits = [
  {
    icon: Clock,
    title: 'Entrega Express',
    description: 'Mismo día en Lima',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Award,
    title: 'Garantía de Frescura',
    description: '7 días garantizados',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Gift,
    title: 'Empaque Premium',
    description: 'Incluido gratis',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Sparkles,
    title: 'Calidad Premium',
    description: 'Flores seleccionadas',
    color: 'bg-blue-100 text-blue-600',
  },
];

export default function OfertasPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Inmersivo */}
      <section className="relative h-[60vh] min-h-[400px] max-h-[550px] overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=2000&auto=format&fit=crop"
            alt="Ofertas especiales en flores"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/80 via-pink-600/70 to-purple-600/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        </div>

        {/* Contenido */}
        <div className="relative h-full flex items-center">
          <div className="container-wide">
            <div className="max-w-2xl">
              {/* Badge animado */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full mb-6 border border-white/30 animate-pulse">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Ofertas por tiempo limitado</span>
              </div>

              {/* Título */}
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Ofertas
                <span className="block text-yellow-300">Irresistibles</span>
              </h1>

              {/* Descripción */}
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Descuentos exclusivos en los arreglos más hermosos. 
                ¡No te los pierdas!
              </p>

              {/* CTA */}
              <a 
                href="#ofertas" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-semibold rounded-full hover:bg-yellow-300 hover:text-red-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Percent className="w-5 h-5" />
                Ver Ofertas
              </a>
            </div>
          </div>
        </div>

        {/* Transición */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent" />
      </section>

      {/* Countdown Banner */}
      <section className="py-6 bg-gray-900 text-white">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <Clock className="w-6 h-6 text-yellow-400 animate-pulse" />
            <p className="font-medium">
              ¡Ofertas válidas hasta agotar stock! No te quedes sin tu arreglo favorito
            </p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-red-600 rounded font-bold">24</span>
              <span>:</span>
              <span className="px-3 py-1 bg-red-600 rounded font-bold">59</span>
              <span>:</span>
              <span className="px-3 py-1 bg-red-600 rounded font-bold">59</span>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-8 bg-white border-b">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className={`w-12 h-12 ${benefit.color} rounded-xl flex items-center justify-center`}>
                  <benefit.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{benefit.title}</h3>
                  <p className="text-xs text-gray-500">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section id="ofertas" className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full mb-4">
              <Tag className="w-4 h-4" />
              <span className="text-sm font-medium">Descuentos Especiales</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Nuestras Mejores Ofertas
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Aprovecha estos increíbles descuentos en flores y arreglos seleccionados
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      </section>


    </main>
  );
}

interface Offer {
  id: number;
  title: string;
  description: string;
  discount: number;
  originalPrice: number;
  finalPrice: number;
  image: string;
  validUntil: string;
  category: string;
  badge: string;
  badgeColor: string;
}

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={offer.image}
          alt={offer.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Discount badge */}
        {offer.discount > 0 && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
            -{offer.discount}%
          </div>
        )}
        
        {/* Category badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 ${offer.badgeColor} text-white text-xs font-medium rounded-full shadow-md`}>
          {offer.badge}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Link
            href={`/ramos?categoria=${offer.category.toLowerCase()}`}
            className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg hover:bg-yellow-300"
          >
            Ver Oferta
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            {offer.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            Hasta {offer.validUntil}
          </span>
        </div>
        
        <h3 className="font-semibold text-lg text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
          {offer.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4">{offer.description}</p>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            {offer.originalPrice > 0 && (
              <>
                <span className="text-2xl font-bold text-red-600">S/ {offer.finalPrice}</span>
                <span className="text-sm text-gray-400 line-through">S/ {offer.originalPrice}</span>
              </>
            )}
          </div>
          <Link
            href={`/ramos?categoria=${offer.category.toLowerCase()}`}
            className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Comprar
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
