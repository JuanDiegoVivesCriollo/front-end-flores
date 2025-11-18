import React from 'react';
import { Crown, Ribbon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CondolenciasNavigationProps {
  currentOccasion: string;
  onOccasionChange?: (occasion: string) => void; // Opcional ahora
}

const condolenciasTypes = [
  {
    label: 'Lágrimas de Piso',
    value: 'lagrimas-piso',
    icon: Ribbon,
    description: 'Arreglos elegantes colocados en el suelo',
    gradient: 'from-slate-500 to-gray-600'
  },
  {
    label: 'Mantos Especiales',
    value: 'mantos-especiales', 
    icon: Ribbon,
    description: 'Coberturas florales únicas y significativas',
    gradient: 'from-gray-600 to-slate-700'
  },
  {
    label: 'Coronas',
    value: 'coronas',
    icon: Crown,
    description: 'Coronas tradicionales de condolencias',
    gradient: 'from-slate-600 to-gray-700'
  },
  {
    label: 'Trípodes',
    value: 'tripodes',
    icon: Ribbon,
    description: 'Arreglos montados en estructura elegante',
    gradient: 'from-gray-500 to-slate-600'
  }
];

export default function CondolenciasNavigation({ currentOccasion }: CondolenciasNavigationProps) {
  const router = useRouter();

  const handleOccasionClick = (type: typeof condolenciasTypes[0]) => {
    // Navegar a la URL correcta para cambiar toda la página
    router.push(`/flores/?ocasion=${type.value}`);
  };
  return (
    <div className="relative bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 rounded-2xl p-6 border border-gray-200/50 shadow-lg overflow-hidden">
      
      {/* Elementos decorativos de fondo con cintas de luto */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Cinta grande arriba izquierda */}
        <div className="absolute -top-4 -left-4 w-16 h-16 opacity-[0.15] rotate-12">
          <img 
            src="/img/iconos/pngwing.com.png" 
            alt="Decoración luto" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Cinta mediana arriba derecha */}
        <div className="absolute top-8 -right-2 w-12 h-12 opacity-[0.12] rotate-[-15deg]">
          <img 
            src="/img/iconos/pngwing.com.png" 
            alt="Decoración luto" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Cinta pequeña centro izquierda */}
        <div className="absolute top-20 left-4 w-8 h-8 opacity-[0.08] rotate-45">
          <img 
            src="/img/iconos/pngwing.com.png" 
            alt="Decoración luto" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Cinta mediana abajo centro */}
        <div className="absolute bottom-4 left-1/3 w-10 h-10 opacity-[0.10] rotate-[-30deg]">
          <img 
            src="/img/iconos/pngwing.com.png" 
            alt="Decoración luto" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Cinta pequeña abajo derecha */}
        <div className="absolute bottom-8 right-8 w-6 h-6 opacity-[0.08] rotate-[60deg]">
          <img 
            src="/img/iconos/pngwing.com.png" 
            alt="Decoración luto" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Cinta extra sutil centro derecha */}
        <div className="absolute top-1/2 right-2 w-8 h-8 opacity-[0.06] rotate-[20deg]">
          <img 
            src="/img/iconos/pngwing.com.png" 
            alt="Decoración luto" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Elementos decorativos sutiles adicionales */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-gray-200/10 rounded-full blur-sm"></div>
        <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-slate-200/10 rounded-full blur-sm"></div>
      </div>
      
      {/* Contenido principal con z-index mayor */}
      <div className="relative z-10">
      {/* Título */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          <span className="bg-gradient-to-r from-gray-700 via-slate-700 to-gray-800 bg-clip-text text-transparent">
            Flores de Condolencias
          </span>
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          Acompaña en momentos difíciles con arreglos florales que transmiten paz y consuelo
        </p>
      </div>

      {/* Botones para Desktop: 4 en fila */}
      <div className="hidden md:grid md:grid-cols-4 gap-4">
        {condolenciasTypes.map((type) => {
          const IconComponent = type.icon;
          const isActive = currentOccasion === type.value || 
                          currentOccasion === type.label ||
                          (currentOccasion === 'all-condolencias' && type.value === 'coronas'); // Default a coronas si es "all-condolencias"
          
          return (
            <button
              key={type.value}
              onClick={() => handleOccasionClick(type)}
              className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 transform hover:scale-105 ${
                isActive 
                  ? 'bg-gradient-to-br ' + type.gradient + ' text-white shadow-xl' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg border border-gray-200'
              }`}
            >
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gradient-to-br ' + type.gradient + ' text-white'
                }`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className={`font-semibold text-sm mb-1 ${
                  isActive ? 'text-white' : 'text-gray-900'
                }`}>
                  {type.label}
                </h3>
                <p className={`text-xs leading-relaxed ${
                  isActive ? 'text-white/90' : 'text-gray-600'
                }`}>
                  {type.description}
                </p>
              </div>
              
              {/* Efecto hover */}
              {!isActive && (
                <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Botones para Móvil: 2x2 compacto */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        {condolenciasTypes.map((type) => {
          const IconComponent = type.icon;
          const isActive = currentOccasion === type.value || 
                          currentOccasion === type.label ||
                          (currentOccasion === 'all-condolencias' && type.value === 'coronas');
          
          return (
            <button
              key={type.value}
              onClick={() => handleOccasionClick(type)}
              className={`group relative overflow-hidden rounded-xl p-3 text-center transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-br ' + type.gradient + ' text-white shadow-lg' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md border border-gray-200'
              }`}
            >
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-2 mx-auto ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gradient-to-br ' + type.gradient + ' text-white'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className={`font-semibold text-xs mb-1 ${
                  isActive ? 'text-white' : 'text-gray-900'
                }`}>
                  {type.label}
                </h3>
                <p className={`text-xs leading-tight ${
                  isActive ? 'text-white/90' : 'text-gray-500'
                }`}>
                  {type.description.split(' ').slice(0, 3).join(' ')}...
                </p>
              </div>
              
              {/* Efecto hover */}
              {!isActive && (
                <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
              )}
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}