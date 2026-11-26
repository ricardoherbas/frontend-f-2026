import { crearCrudApi } from '@/core/api/crudApi';
import { crearListadoPaginadoApi, type Paginado } from '@/core/api/paginacion';
import type { EstadoPago } from '@/core/types/estado-pago.type';
import type { MedioPago } from '@/core/types/medio-pago.type';
import type {
  DatosActualizarPago,
  DatosCrearPago,
  Pago,
} from '../interfaces/pago.interface';

export interface FiltrosPagos {
  page: number;
  limit: number;
  search?: string;
  estado?: EstadoPago;
  medio_pago?: MedioPago;
  periodoDesde?: string;
  periodoHasta?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export type RespuestaPagosPaginada = Paginado<Pago>;

const crud = crearCrudApi<Pago, DatosCrearPago, DatosActualizarPago>('pagos');

export const pagoService = {
  ...crud,

  listarPaginado: crearListadoPaginadoApi<Pago, FiltrosPagos>('pagos'),
};
