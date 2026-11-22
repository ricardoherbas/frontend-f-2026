import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parteDiarioService } from '../services/parteDiario.service';
import type { FiltrosPartesDiarios } from '../services/parteDiario.service';
import type {
  DatosActualizarParteDiario,
  DatosCrearParteDiario,
} from '../interfaces/parteDiario.interface';

const CLAVE = 'partesDiarios';

// Se conserva la consulta completa porque puede utilizarse en otros componentes.
export const usePartesDiarios = () =>
  useQuery({
    queryKey: [CLAVE],
    queryFn: parteDiarioService.listar,
  });

export const usePartesDiariosPaginado = (
  filtros: FiltrosPartesDiarios,
) =>
  useQuery({
    queryKey: [CLAVE, 'paginado', filtros],
    queryFn: () => parteDiarioService.listarPaginado(filtros),
  });

export const useParteDiario = (id: number) =>
  useQuery({
    queryKey: [CLAVE, id],
    queryFn: () => parteDiarioService.obtener(id),
    enabled: Number.isFinite(id) && id > 0,
  });

export function useCrearParteDiario() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (datos: DatosCrearParteDiario) =>
      parteDiarioService.crear(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLAVE] }),
  });
}

export function useActualizarParteDiario(id: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (datos: DatosActualizarParteDiario) =>
      parteDiarioService.actualizar(id, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLAVE] }),
  });
}

export function useEliminarParteDiario() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => parteDiarioService.eliminar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLAVE] }),
  });
}
