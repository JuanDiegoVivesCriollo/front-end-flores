'use client';

import { useState } from 'react';
import Image from 'next/image';
import FlowerCatalogReal from '@/components/FlowerCatalogReal';
import CondolenciasFilters from '@/components/CondolenciasFilters';
import PageTransition from '@/components/PageTransition';

export default function CondolenciasPage() {
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [catalogKey, setCatalogKey] = useState(0); // Para forzar re-render del catálogo

  const handleOccasionSelect = (occasion: string) => {
    setSelectedOccasion(occasion);
    // Incrementar key para forzar re-render del catálogo
    setCatalogKey(prev => prev + 1);
  };

  // Si no hay ocasión seleccionada, usar un valor especial para mostrar todas las condolencias
  const occasionForCatalog = selectedOccasion === '' ? 'all-condolencias' : selectedOccasion;

  return (
    <PageTransition>
      <main className="min-h-screen">
        {/* Hero Section para Condolencias */}
        <div 
          className="relative text-white py-16 overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/img/FondosParaOcasiones/FloresDeCondolencias.webp')`
          }}
        >
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-4">
              <Image 
                src="/img/iconos/pngwing.com.png" 
                alt="Cinta de luto" 
                width={64}
                height={64}
                className="object-contain filter brightness-0 invert"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Flores de Condolencias
            </h1>
            <p className="text-xl md:text-2xl mb-6 font-light">
              Acompaña en momentos difíciles
            </p>
            <p className="text-lg max-w-3xl mx-auto opacity-90">
              Expresa tu solidaridad y apoyo con arreglos florales que transmiten paz y consuelo en momentos de duelo.
            </p>
          </div>
        </div>

        {/* Filtros específicos de condolencias */}
        <CondolenciasFilters 
          onOccasionSelect={handleOccasionSelect}
          selectedOccasion={selectedOccasion}
        />

        {/* Catálogo de Flores de Condolencias */}
        <FlowerCatalogReal 
          key={catalogKey}
          initialOccasion={occasionForCatalog} 
          hideFilters={true}
        />
      </main>
    </PageTransition>
  );
}
