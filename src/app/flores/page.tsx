'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import FlowerCatalogReal from '@/components/FlowerCatalogReal';
import PageTransition from '@/components/PageTransition';
import { getOccasionByValue } from '@/config/occasions';

function FloresPageContent() {
  const searchParams = useSearchParams();
  const occasion = searchParams.get('ocasion') || '';
  
  const occasionInfo = getOccasionByValue(occasion);
  const hasOccasionFilter = occasion && occasionInfo;

  return (
    <PageTransition>
      <main className="min-h-screen">
        {/* Hero Section solo si hay una ocasión específica */}
        {hasOccasionFilter && (
          <div 
            className="relative text-white py-16 overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${occasionInfo.backgroundImage}')`
            }}
          >
            <div className="relative max-w-7xl mx-auto px-4 text-center">
              <div className="flex justify-center mb-4">
                {['lagrimas-piso', 'mantos-especiales', 'coronas', 'tripodes'].includes(occasion) ? (
                  <Image 
                    src="/img/iconos/pngwing.com.png" 
                    alt="Cinta de luto" 
                    width={64}
                    height={64}
                    className="object-contain filter brightness-0 invert"
                  />
                ) : (
                  <occasionInfo.icon className="w-16 h-16 text-white" />
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {occasionInfo.heroTitle}
              </h1>
              <p className="text-xl md:text-2xl mb-6 font-light">
                {occasionInfo.heroSubtitle}
              </p>
              <p className="text-lg max-w-3xl mx-auto opacity-90">
                {occasionInfo.heroDescription}
              </p>
            </div>
            
            {/* Decorative elements with icons instead of emojis */}
            <div className="absolute top-10 left-10 text-white/20">
              {occasion === 'condolencias' ? (
                <Image 
                  src="/img/iconos/pngwing.com.png" 
                  alt="Cinta de luto decorativa" 
                  width={40}
                  height={40}
                  className="object-contain filter brightness-0 invert opacity-20"
                />
              ) : (
                <occasionInfo.icon className="w-10 h-10" />
              )}
            </div>
            <div className="absolute top-20 right-20 text-white/20">
              {occasion === 'condolencias' ? (
                <Image 
                  src="/img/iconos/pngwing.com.png" 
                  alt="Cinta de luto decorativa" 
                  width={48}
                  height={48}
                  className="object-contain filter brightness-0 invert opacity-20"
                />
              ) : (
                <occasionInfo.icon className="w-12 h-12" />
              )}
            </div>
            <div className="absolute bottom-10 left-1/4 text-white/20">
              {occasion === 'condolencias' ? (
                <Image 
                  src="/img/iconos/pngwing.com.png" 
                  alt="Cinta de luto decorativa" 
                  width={32}
                  height={32}
                  className="object-contain filter brightness-0 invert opacity-20"
                />
              ) : (
                <occasionInfo.icon className="w-8 h-8" />
              )}
            </div>
            <div className="absolute bottom-20 right-1/3 text-white/20">
              {occasion === 'condolencias' ? (
                <Image 
                  src="/img/iconos/pngwing.com.png" 
                  alt="Cinta de luto decorativa" 
                  width={40}
                  height={40}
                  className="object-contain filter brightness-0 invert opacity-20"
                />
              ) : (
                <occasionInfo.icon className="w-10 h-10" />
              )}
            </div>
          </div>
        )}

        {/* Catálogo con filtro aplicado */}
        <div className={hasOccasionFilter ? "py-8" : "pt-16"}>
          <FlowerCatalogReal initialOccasion={occasion} />
        </div>
      </main>
    </PageTransition>
  );
}

export default function FloresPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-bright mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando catálogo de flores...</p>
        </div>
      </div>
    }>
      <FloresPageContent />
    </Suspense>
  );
}
