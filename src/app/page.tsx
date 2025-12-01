'use client';

import { Suspense } from 'react';
import HeroSection from '@/components/HeroSection';
import FlowerCatalog from '@/components/FlowerCatalog';

export default function Home() {
  return (
    <>
      {/* SEO Content - Hidden but crawlable */}
      <div className="sr-only">
        <h1>Flores D&apos;Jazmin - Florería Premium en Lima, Perú</h1>
        <p>
          La mejor florería de Lima con flores frescas premium: rosas rojas, tulipanes, 
          girasoles, orquídeas y arreglos florales únicos para todas las ocasiones. 
          Entrega a domicilio en Lima.
        </p>
        <h2>Nuestros Productos</h2>
        <ul>
          <li>Rosas Premium - Desde S/ 45.00</li>
          <li>Tulipanes Frescos - Desde S/ 35.00</li>
          <li>Girasoles Brillantes - Desde S/ 30.00</li>
          <li>Orquídeas Exóticas - Desde S/ 65.00</li>
          <li>Desayunos Sorpresa - Desde S/ 80.00</li>
        </ul>
        <h2>Ocasiones Especiales</h2>
        <p>
          Flores para: Cumpleaños, Aniversario, Amor, Pedida de Mano, 
          Felicitaciones, Graduación, Boda, Nacimiento, Condolencias.
        </p>
      </div>

      {/* Hero Section con Carrusel */}
      <HeroSection />
      
      {/* Catálogo de Flores */}
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      }>
        <FlowerCatalog />
      </Suspense>
    </>
  );
}
