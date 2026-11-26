import { crearCrudApi } from '@/core/api/crudApi';
import { crearListadoPaginadoApi, type Paginado } from '@/core/api/paginacion';
import type {
  DatosActualizarMedicamento,
  DatosCrearMedicamento,
  Medicamento,
} from '../interfaces/medicamento.interface';

export interface FiltrosMedicamentos {
  page?: number;
  limit?: number;
  search?: string;
  cantidad?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export type RespuestaMedicamentosPaginada = Paginado<Medicamento>;

const crudApi = crearCrudApi<
  Medicamento,
  DatosCrearMedicamento,
  DatosActualizarMedicamento
>('medicamentos');

export const medicamentoService = {
  ...crudApi,

  listarPaginado: crearListadoPaginadoApi<Medicamento, FiltrosMedicamentos>('medicamentos'),
};
