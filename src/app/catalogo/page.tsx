import HeroCarousel from '@/components/HeroCarousel';
import FlowerCatalogNew from '@/components/FlowerCatalogNew';
import FlowersOnSale from '@/components/FlowersOnSale';
import PageTransition from '@/components/PageTransition';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogo de Flores | Rosas, Tulipanes y Más - Flores de Jazmín',
  description: 'Explora nuestro catálogo completo de flores frescas: rosas rojas, tulipanes, girasoles y arreglos florales. Entrega en Lima y Callao. ¡Compra online!',
  keywords: 'catálogo flores, rosas frescas, tulipanes, girasoles, arreglos florales, flores lima, florería online',
  openGraph: {
    title: 'Catálogo de Flores Frescas | Flores de Jazmín',
    description: 'Las mejores flores para cada ocasión. Rosas, tulipanes y arreglos únicos con entrega en Lima.',
    images: ['/img/catalogo/featured-catalog.jpg'],
  },
};

export default function CatalogoPage() {
  return (
    <PageTransition>
      <main className="min-h-screen">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-pink-50 to-rose-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Catálogo de Flores - Flores de Jazmín
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Descubre nuestra amplia selección de <strong>rosas frescas</strong>, <strong>tulipanes</strong>, 
              <strong>girasoles</strong> y arreglos florales únicos. Cada flor es seleccionada cuidadosamente 
              para garantizar la máxima calidad y frescura.
            </p>
          </div>
        </section>

        {/* Sección Hero */}
        <section>
          <HeroCarousel />
        </section>

        {/* Sección Flores Destacadas */}
        <section>
          <FlowerCatalogNew />
        </section>

        {/* Sección Flores en Oferta */}
        <section>
          <FlowersOnSale />
        </section>
      </main>
    </PageTransition>
  );
}
