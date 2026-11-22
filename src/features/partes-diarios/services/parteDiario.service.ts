import { httpClient } from '@/core/api/httpClient';
import { crearCrudApi } from '@/core/api/crudApi';
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

export interface RespuestaPartesDiariosPaginada {
  datos: ParteDiario[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

const crudApi = crearCrudApi<
  ParteDiario,
  DatosCrearParteDiario,
  DatosActualizarParteDiario
>('partesDiarios');

export const parteDiarioService = {
  ...crudApi,

  listarPaginado: async (
    filtros: FiltrosPartesDiarios,
  ): Promise<RespuestaPartesDiariosPaginada> => {
    const respuesta = await httpClient.get<RespuestaPartesDiariosPaginada>(
      '/partesDiarios',
      { params: filtros },
    );

    return respuesta.data;
  },
};
