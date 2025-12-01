'use client';

import { Crown, Ribbon } from 'lucide-react';

interface CondolenciasFiltersProps {
  onOccasionSelect: (occasion: string) => void;
  selectedOccasion: string;
}

const condolenciasOccasions = [
  {
    label: 'Todas las condolencias',
    value: 'all-condolencias',
    icon: Ribbon,
    description: 'Ver todos los arreglos'
  },
  {
    label: 'Lágrimas de Piso',
    value: 'lagrimas-piso',
    icon: Ribbon,
    description: 'Arreglos elegantes en el suelo'
  },
  {
    label: 'Mantos Especiales',
    value: 'mantos-especiales',
    icon: Ribbon,
    description: 'Coberturas florales únicas'
  },
  {
    label: 'Coronas',
    value: 'coronas',
    icon: Crown,
    description: 'Coronas tradicionales'
  },
  {
    label: 'Trípodes',
    value: 'tripodes',
    icon: Ribbon,
    description: 'Arreglos en trípodes elegantes'
  }
];

export default function CondolenciasFilters({ onOccasionSelect, selectedOccasion }: CondolenciasFiltersProps) {
  const handleOccasionClick = (occasion: typeof condolenciasOccasions[0]) => {
    onOccasionSelect(occasion.value);
  };

  return (
    <div className="bg-white border-b border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Tipos de Arreglos Florales
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Selecciona el tipo de arreglo floral que mejor exprese tu mensaje de condolencia
          </p>
        </div>

        <div 
          className="flex overflow-x-auto gap-6 mb-6 pb-4" 
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {condolenciasOccasions.map((occasion) => {
            const IconComponent = occasion.icon;
            const isSelected = selectedOccasion === occasion.value;
            const isAllOccasions = occasion.value === 'all-condolencias';
            
            return (
              <button
                key={occasion.label}
                onClick={() => handleOccasionClick(occasion)}
                className={`
                  flex-shrink-0 w-56 group relative overflow-hidden rounded-xl p-6 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                  ${isSelected 
                    ? isAllOccasions
                      ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg ring-2 ring-purple-500'
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg ring-2 ring-gray-700'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-400 hover:shadow-md'
                  }
                `}
              >
                {/* Background pattern for elegance */}
                <div className="absolute inset-0 opacity-5">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    <defs>
                      <pattern id={`floral-pattern-${occasion.value}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.1"/>
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill={`url(#floral-pattern-${occasion.value})`}/>
                  </svg>
                </div>

                <div className="relative">
                  {/* Icon container with elegant background */}
                  <div className={`
                    mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                    ${isSelected 
                      ? 'bg-white/10 backdrop-blur-sm' 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                    }
                  `}>
                    <IconComponent 
                      size={32} 
                      className={`
                        transition-all duration-300
                        ${isSelected 
                          ? 'text-white' 
                          : 'text-gray-600 group-hover:text-gray-800'
                        }
                      `}
                    />
                  </div>

                  {/* Title */}
                  <h3 className={`
                    font-bold text-lg mb-2 transition-colors duration-300
                    ${isSelected ? 'text-white' : 'text-gray-800'}
                  `}>
                    {occasion.label}
                  </h3>

                  {/* Description */}
                  <p className={`
                    text-sm leading-relaxed transition-colors duration-300
                    ${isSelected 
                      ? 'text-gray-200' 
                      : 'text-gray-600 group-hover:text-gray-700'
                    }
                  `}>
                    {occasion.description}
                  </p>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>

                {/* Hover effect overlay */}
                <div className={`
                  absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  ${isSelected ? 'hidden' : ''}
                `}></div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
