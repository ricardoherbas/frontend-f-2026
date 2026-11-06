import { Navigate } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { rutaInicial } from './routes.config';

export function Inicio() {
  const { rol } = useAuth();
  return <Navigate to={rutaInicial(rol)} replace />;
}

export function SinAcceso() {
  return (
    <div className="estado-vista">
      <strong>No tenés acceso a esta pantalla</strong>
      Tu rol no tiene permisos para ver esta sección.
    </div>
  );
}

export function NoEncontrada() {
  return (
    <div className="estado-vista">
      <strong>Pantalla no encontrada</strong>
      Revisá la dirección o volvé al inicio.
    </div>
  );
}