import ContactSection from '@/components/ContactSection';
import PageTransition from '@/components/PageTransition';

export default function ContactoPage() {
  return (
    <PageTransition>
      <main className="min-h-screen pt-16">
        <ContactSection />
      </main>
    </PageTransition>
  );
}
