import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { medicamentoService } from '../services/medicamento.service';
import type { FiltrosMedicamentos } from '../services/medicamento.service';
import type { DatosCrearMedicamento } from '../interfaces/medicamento.interface';

const CLAVE = 'medicamentos';

// Se conserva para los formularios que necesitan el catálogo completo,
// especialmente TratamientoFormPage.
export const useMedicamentos = () =>
  useQuery({
    queryKey: [CLAVE],
    queryFn: medicamentoService.listar,
  });

// Consulta paginada exclusiva para el listado de Medicamentos.
export const useMedicamentosPaginado = (filtros: FiltrosMedicamentos) =>
  useQuery({
    queryKey: [CLAVE, 'paginado', filtros],
    queryFn: () => medicamentoService.listarPaginado(filtros),
  });

/** Alta (sin id) o edición (con id). El backend exige todos los campos en ambos casos. */
export function useGuardarMedicamento() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, datos }: { id?: number; datos: DatosCrearMedicamento }) =>
      id === undefined
        ? medicamentoService.crear(datos)
        : medicamentoService.actualizar(id, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLAVE] }),
  });
}

export function useEliminarMedicamento() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => medicamentoService.eliminar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLAVE] }),
  });
}
