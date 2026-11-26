import { crearCrudApi } from '@/core/api/crudApi';
import { crearListadoPaginadoApi, type Paginado } from '@/core/api/paginacion';
import type {
  DatosActualizarParteDiario,
  DatosCrearParteDiario,
  ParteDiario,
} from '../interfaces/parteDiario.interface';

export interface FiltrosPartesDiarios {
  page?: number;
  limit?: number;
  search?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  animo?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export type RespuestaPartesDiariosPaginada = Paginado<ParteDiario>;

const crudApi = crearCrudApi<
  ParteDiario,
  DatosCrearParteDiario,
  DatosActualizarParteDiario
>('partesDiarios');

export const parteDiarioService = {
  ...crudApi,

  listarPaginado: crearListadoPaginadoApi<ParteDiario, FiltrosPartesDiarios>('partesDiarios'),
};
