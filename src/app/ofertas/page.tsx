import FlowersOnSale from '@/components/FlowersOnSale';
import PageTransition from '@/components/PageTransition';

export default function OfertasPage() {
  return (
    <PageTransition>
      <main className="min-h-screen pt-16">
        <FlowersOnSale />
      </main>
    </PageTransition>
  );
}
