import { crearCrudApi } from '@/core/api/crudApi';
import { crearListadoPaginadoApi, type Paginado } from '@/core/api/paginacion';
import type {
  Asignacion,
  DatosActualizarAsignacion,
  DatosCrearAsignacion,
} from '../interfaces/asignacion.interface';

export interface FiltrosAsignaciones {
  page: number;
  limit: number;
  search?: string;
  activo?: boolean;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export type RespuestaAsignacionesPaginada = Paginado<Asignacion>;

const crud = crearCrudApi<
  Asignacion,
  DatosCrearAsignacion,
  DatosActualizarAsignacion
>('asignaciones');

export const asignacionService = {
  ...crud,

  listarPaginado: crearListadoPaginadoApi<Asignacion, FiltrosAsignaciones>('asignaciones'),
};
