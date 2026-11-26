import { crearCrudApi } from '@/core/api/crudApi';
import { crearListadoPaginadoApi, type Paginado } from '@/core/api/paginacion';
import type {
  Cuidadora,
  DatosCrearCuidadora,
} from '../interfaces/cuidadora.interface';

export interface FiltrosCuidadoras {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export type RespuestaCuidadorasPaginada = Paginado<Cuidadora>;

const crudApi = crearCrudApi<Cuidadora, DatosCrearCuidadora>(
  'cuidadoras',
);

export const cuidadoraService = {
  ...crudApi,

  listarPaginado: crearListadoPaginadoApi<Cuidadora, FiltrosCuidadoras>('cuidadoras'),
};
