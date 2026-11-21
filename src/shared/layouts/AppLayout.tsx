import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from '@/shared/components/Header';
import { Footer } from '@/shared/components/Footer';

export function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="app">
      <Sidebar
        abierto={menuAbierto}
        onNavegar={() => setMenuAbierto(false)}
      />

      <div className="contenido">
        <Header
          menuAbierto={menuAbierto}
          onToggleMenu={() => setMenuAbierto((v) => !v)}
        />

        <main className="pagina">
          <Suspense fallback={<div className="estado-vista" role="status">Cargando…</div>}>
            <Outlet />
          </Suspense>
        </main>

        <Footer />
      </div>
    </div>
  );
}
