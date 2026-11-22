import { httpClient } from '@/core/api/httpClient';
import { crearCrudApi } from '@/core/api/crudApi';
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

export interface RespuestaCuidadorasPaginada {
  datos: Cuidadora[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

const crudApi = crearCrudApi<Cuidadora, DatosCrearCuidadora>(
  'cuidadoras',
);

export const cuidadoraService = {
  ...crudApi,

  listarPaginado: async (
    filtros: FiltrosCuidadoras,
  ): Promise<RespuestaCuidadorasPaginada> => {
    const respuesta =
      await httpClient.get<RespuestaCuidadorasPaginada>(
        '/cuidadoras',
        { params: filtros },
      );

    return respuesta.data;
  },
};
