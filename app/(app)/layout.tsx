import { Sidebar } from '@/components/Sidebar';

// Ce layout protège toutes les pages enfants. NextAuth redirigera si non connecté.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}