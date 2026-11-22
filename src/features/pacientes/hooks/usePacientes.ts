import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pacienteService } from '../services/paciente.service';
import type { FiltrosPacientes } from '../services/paciente.service';
import type {
  DatosActualizarPaciente,
  DatosCrearPaciente,
} from '../interfaces/paciente.interface';

const CLAVE = 'pacientes';

// Conservamos el listado original para los módulos que esperan Paciente[].
export const usePacientes = () =>
  useQuery({
    queryKey: [CLAVE],
    queryFn: pacienteService.listar,
  });

// Nuevo hook exclusivo para el listado paginado.
export const usePacientesPaginado = (filtros: FiltrosPacientes) =>
  useQuery({
    queryKey: [CLAVE, 'paginado', filtros],
    queryFn: () => pacienteService.listarPaginado(filtros),
  });

export const usePaciente = (id: number) =>
  useQuery({
    queryKey: [CLAVE, id],
    queryFn: () => pacienteService.obtener(id),
    enabled: Number.isFinite(id),
  });

export function useCrearPaciente() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (datos: DatosCrearPaciente) =>
      pacienteService.crear(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLAVE] }),
  });
}

export function useActualizarPaciente(id: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (datos: DatosActualizarPaciente) =>
      pacienteService.actualizar(id, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLAVE] }),
  });
}

export function useEliminarPaciente() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => pacienteService.eliminar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLAVE] }),
  });
}
