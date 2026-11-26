import { crearCrudApi } from '@/core/api/crudApi';
import { crearListadoPaginadoApi, type Paginado } from '@/core/api/paginacion';
import type { DatosCrearFamiliar, Familiar } from '../interfaces/familiar.interface';

export interface FiltrosFamiliares {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export type RespuestaFamiliaresPaginada = Paginado<Familiar>;

const crudApi = crearCrudApi<Familiar, DatosCrearFamiliar>('familiares');

export const familiarService = {
  ...crudApi,

  listarPaginado: crearListadoPaginadoApi<Familiar, FiltrosFamiliares>('familiares'),
};
