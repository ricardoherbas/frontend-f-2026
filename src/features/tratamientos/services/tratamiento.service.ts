import { crearCrudApi } from '@/core/api/crudApi';
import { crearListadoPaginadoApi, type Paginado } from '@/core/api/paginacion';
import type {
  DatosActualizarTratamiento,
  DatosCrearTratamiento,
  Tratamiento,
} from '../interfaces/tratamiento.interface';

export interface FiltrosTratamientos {
  page?: number;
  limit?: number;
  search?: string;
  activa?: boolean;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export type RespuestaTratamientosPaginada = Paginado<Tratamiento>;

const crudApi = crearCrudApi<
  Tratamiento,
  DatosCrearTratamiento,
  DatosActualizarTratamiento
>('tratamientos');

export const tratamientoService = {
  ...crudApi,

  listarPaginado: crearListadoPaginadoApi<Tratamiento, FiltrosTratamientos>('tratamientos'),
};
