import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RUTAS_PRIVADAS, RUTAS_PUBLICAS } from './routes.config';
import { Inicio, SinAcceso, NoEncontrada } from './RouterPages';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: RUTAS_PUBLICAS.map(({ path, Componente }) => ({ path, element: <Componente /> })),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Inicio /> },
          { path: '/sin-acceso', element: <SinAcceso /> },
          // Cada ruta se envuelve con su propio guard de roles (una sola fuente: routes.config)
          ...RUTAS_PRIVADAS.map(({ path, roles, Componente }) => ({
            path,
            element: <ProtectedRoute roles={roles} />,
            children: [{ index: true, element: <Componente /> }],
          })),
          { path: '*', element: <NoEncontrada /> },
        ],
      },
    ],
  },
]);