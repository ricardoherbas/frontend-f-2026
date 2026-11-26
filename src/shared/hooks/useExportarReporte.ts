import { useMutation } from '@tanstack/react-query';
import { descargarReporte } from '@/core/api/reportesApi';

export function useExportarReporte(ruta: string) {
  return useMutation({
    mutationFn: (filtros: Record<string, unknown>) => descargarReporte(ruta, filtros),
  });
}
