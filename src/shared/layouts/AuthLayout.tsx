import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/shared/components/Header';
import { Footer } from '@/shared/components/Footer';

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <Header />

      <main className="acceso">
        <div className="panel acceso-caja">
          <Suspense fallback={<div className="estado-vista" role="status">Cargando…</div>}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
