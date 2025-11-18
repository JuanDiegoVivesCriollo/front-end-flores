import ServicesSection from '@/components/ServicesSection';
import PageTransition from '@/components/PageTransition';

export default function ServiciosPage() {
  return (
    <PageTransition>
      <main className="min-h-screen pt-16">
        <ServicesSection />
      </main>
    </PageTransition>
  );
}
