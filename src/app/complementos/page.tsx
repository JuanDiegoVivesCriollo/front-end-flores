import ComplementsCatalog from '@/components/ComplementsCatalog';
import PageTransition from '@/components/PageTransition';

export default function ComplementosPage() {
  return (
    <PageTransition>
      <main className="min-h-screen pt-16">
        <ComplementsCatalog />
      </main>
    </PageTransition>
  );
}
