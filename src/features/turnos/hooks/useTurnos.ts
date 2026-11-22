import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { turnoService } from '../services/turno.service';
import type { FiltrosTurnos } from '../services/turno.service';
import type {
  DatosActualizarTurno,
  DatosCrearTurno,
} from '../interfaces/turno.interface';

const CLAVE = 'turnos';

// Se conserva para AsignacionFormModal y otros componentes que necesitan
// el catálogo completo de turnos.
export const useTurnos = () =>
  useQuery({
    queryKey: [CLAVE],
    queryFn: turnoService.listar,
  });

// Consulta paginada exclusiva del listado.
export const useTurnosPaginado = (filtros: FiltrosTurnos) =>
  useQuery({
    queryKey: [CLAVE, 'paginado', filtros],
    queryFn: () => turnoService.listarPaginado(filtros),
  });

// Consulta individual para la ficha.
export const useTurno = (id: number) =>
  useQuery({
    queryKey: [CLAVE, id],
    queryFn: () => turnoService.obtener(id),
    enabled: Number.isInteger(id) && id > 0,
  });

export function useCrearTurno() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (datos: DatosCrearTurno) => turnoService.crear(datos),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLAVE] });
    },
  });
}

export function useActualizarTurno() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: DatosActualizarTurno }) =>
      turnoService.actualizar(id, datos),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLAVE] });
      // Las asignaciones incluyen el turno: si se edita, su caché queda vieja.
      qc.invalidateQueries({ queryKey: ['asignaciones'] });
    },
  });
}

export function useEliminarTurno() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => turnoService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CLAVE] });
      qc.invalidateQueries({ queryKey: ['asignaciones'] });
    },
  });
}
