'use client';

import { Truck, Clock, Shield, Sparkles, Gift, Heart } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: '100+ Diseños Únicos',
    description: 'Creaciones exclusivas para cada ocasión',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Truck,
    title: 'Entrega Garantizada',
    description: 'Puntualidad en cada pedido',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Clock,
    title: 'Flores Frescas Diarias',
    description: 'Calidad premium garantizada',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Shield,
    title: 'Compra Segura',
    description: 'Pagos 100% protegidos',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Gift,
    title: 'Envío Gratis',
    description: 'En pedidos mayores a S/ 150',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: Heart,
    title: 'Hecho con Amor',
    description: 'Cada arreglo es especial',
    color: 'bg-red-50 text-red-600',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container-wide">
        {/* Mobile: Scrollable */}
        <div className="lg:hidden overflow-x-auto no-scrollbar -mx-4 px-4">
          <div className="flex gap-4 w-max">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl min-w-[200px]"
              >
                <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-800">{feature.title}</h3>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden lg:grid lg:grid-cols-6 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm text-gray-800 mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
