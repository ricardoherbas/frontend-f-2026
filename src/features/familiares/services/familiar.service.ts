import { httpClient } from '@/core/api/httpClient';
import { crearCrudApi } from '@/core/api/crudApi';
import type { DatosCrearFamiliar, Familiar } from '../interfaces/familiar.interface';

export interface FiltrosFamiliares {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface RespuestaFamiliaresPaginada {
  datos: Familiar[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

const crudApi = crearCrudApi<Familiar, DatosCrearFamiliar>('familiares');

export const familiarService = {
  ...crudApi,

  listarPaginado: async (
    filtros: FiltrosFamiliares,
  ): Promise<RespuestaFamiliaresPaginada> => {
    const respuesta = await httpClient.get<RespuestaFamiliaresPaginada>(
      '/familiares',
      { params: filtros },
    );

    return respuesta.data;
  },
};
