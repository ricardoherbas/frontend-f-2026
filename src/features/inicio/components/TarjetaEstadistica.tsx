import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Estadistica } from '../estadisticas.config';

export function TarjetaEstadistica({ estadistica }: { estadistica: Estadistica }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['inicio', 'estadistica', estadistica.clave],
    queryFn: estadistica.cargar,
    staleTime: 60_000,
  });

  return (
    <Link to={estadistica.ruta} className={`estadistica estadistica-${estadistica.tono ?? 'neutro'}`}>
      <span className="estadistica-valor" aria-live="polite">
        {isLoading ? '…' : isError ? '—' : data?.paginacion.total ?? 0}
      </span>
      <span className="estadistica-etiqueta">{estadistica.etiqueta}</span>
      {isError && <small>No se pudo cargar</small>}
    </Link>
  );
}
