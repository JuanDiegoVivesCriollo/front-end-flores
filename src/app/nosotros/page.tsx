import AboutSection from '@/components/AboutSection';
import PageTransition from '@/components/PageTransition';

export default function NosotrosPage() {
  return (
    <PageTransition>
      <main className="min-h-screen pt-16">
        <AboutSection />
      </main>
    </PageTransition>
  );
}
