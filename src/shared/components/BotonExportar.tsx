import { obtenerMensajeError } from '@/core/api/errors';
import { useExportarReporte } from '@/shared/hooks/useExportarReporte';
import { Button } from './ui/Button';

interface Props {
  /** Recurso del backend con endpoint GET /api/<ruta>/reporte (turnos, asignaciones, pagos). */
  ruta: string;
  /** Mismos filtros que usa el listado (la paginación se descarta al exportar). */
  filtros: Record<string, unknown>;
  deshabilitado?: boolean;
}

/** Descarga el reporte Excel generado por la API; convive con "Imprimir / guardar PDF". */
export function BotonExportar({ ruta, filtros, deshabilitado }: Props) {
  const exportar = useExportarReporte(ruta);

  return (
    <>
      <Button
        variante="secundario"
        chico
        disabled={deshabilitado || exportar.isPending}
        onClick={() => exportar.mutate(filtros)}
      >
        {exportar.isPending ? 'Generando…' : 'Exportar Excel'}
      </Button>
      {exportar.isError && (
        <span role="alert" className="error-exportar">
          {obtenerMensajeError(exportar.error)}
        </span>
      )}
    </>
  );
}
