'use client';

import Link from "next/link";
import Image from "next/image";
import { regularOccasions } from '@/config/occasions';

// Mapeo de ocasiones a sus imágenes de fondo
const occasionImageMap: { [key: string]: string } = {
  'graduacion': '/img/FondosParaOcasiones/FloreParaGraduacion.webp',
  'amor': '/img/FondosParaOcasiones/FloresDeAMor.webp',
  'aniversario': '/img/FondosParaOcasiones/FloresDeAniversario.webp',
  'condolencias': '/img/FondosParaOcasiones/FloresCondolencias.webp',
  'cumpleanos': '/img/FondosParaOcasiones/FloresDeCumpleaños.webp',
  'felicitaciones': '/img/FondosParaOcasiones/FloresFelicitaciones.webp',
  'mejorate-pronto': '/img/FondosParaOcasiones/FloresMejoratePronto.webp',
  'boda': '/img/FondosParaOcasiones/FloresParaBoda.webp',
  'para-el': '/img/FondosParaOcasiones/FloresparaEl.webp',
  'pedida-mano': '/img/FondosParaOcasiones/FloresPedidaDeMano.webp',
  'institucional': '/img/FondosParaOcasiones/FondoInstitucional.png',
  'inauguraciones': '/img/FondosParaOcasiones/inauguracion.webp',
  'nacimiento': '/img/FondosParaOcasiones/FondoNacimiento.png',
  'solo-porque-si': '/img/FondosParaOcasiones/FloresDeAMor.webp',
};

export default function OcasionesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <div className="relative text-white py-8 overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <Image
            src="/img/FondosParaOcasiones/FondoOcasiones.png"
            alt="Fondo Ocasiones"
            fill
            className="object-cover scale-110"
            priority
          />
        </div>
        {/* Overlay más sutil para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40"></div>
        {/* Contenido */}
        <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ocasiones Especiales
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Encuentra el arreglo floral perfecto para cada momento especial de tu vida
          </p>
        </div>
      </div>

      {/* Grid de Ocasiones */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {regularOccasions.map((occasion) => {
            const IconComponent = occasion.icon;
            const backgroundImage = occasionImageMap[occasion.value] || occasion.backgroundImage;
            const isCondolencias = occasion.value === 'condolencias';
            
            return (
              <Link
                key={occasion.value}
                href={isCondolencias ? '/condolencias' : `/flores?ocasion=${occasion.value}`}
                className="group relative overflow-hidden rounded-2xl aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                {/* Imagen de fondo */}
                {backgroundImage ? (
                  <Image
                    src={backgroundImage}
                    alt={occasion.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                ) : null}
                
                {/* Overlay con gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300" />
                
                {/* Contenido */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
                  <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px] flex flex-col items-center">
                    {/* Título centrado con fondo rosa */}
                    <div className="bg-[#FB6CBB] px-4 py-2 rounded-full mb-4 shadow-lg">
                      <h3 className="text-lg font-bold text-white text-center whitespace-nowrap">
                        {occasion.label}
                      </h3>
                    </div>
                    
                    {/* Icono debajo del título */}
                    <div className="mb-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    
                    {/* Call to action - aparece en hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="inline-flex items-center text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30 shadow-lg">
                        {isCondolencias ? 'Ver opciones' : 'Ver flores'}
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/30 border-l-0 border-b-0 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-pink-100 to-rose-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¿No encuentras la ocasión perfecta?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Nuestro equipo puede ayudarte a crear el arreglo floral ideal para cualquier momento especial
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Contactar ahora
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.652-.396c-1.081.514-2.362.396-3.311-.102a4.926 4.926 0 01-1.667-1.67c-.498-.949-.616-2.23-.102-3.311A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
