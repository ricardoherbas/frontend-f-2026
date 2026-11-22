import { httpClient } from '@/core/api/httpClient';
import { crearCrudApi } from '@/core/api/crudApi';
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

export interface RespuestaPagosPaginada {
  datos: Pago[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

const crud = crearCrudApi<Pago, DatosCrearPago, DatosActualizarPago>('pagos');

export const pagoService = {
  ...crud,

  listarPaginado: async (
    filtros: FiltrosPagos,
  ): Promise<RespuestaPagosPaginada> => {
    const { data } = await httpClient.get<RespuestaPagosPaginada>(
      '/pagos',
      { params: filtros },
    );

    return data;
  },
};
