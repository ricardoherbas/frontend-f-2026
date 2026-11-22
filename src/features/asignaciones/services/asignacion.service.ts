import { httpClient } from '@/core/api/httpClient';
import { crearCrudApi } from '@/core/api/crudApi';
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

export interface RespuestaAsignacionesPaginada {
  datos: Asignacion[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

const crud = crearCrudApi<
  Asignacion,
  DatosCrearAsignacion,
  DatosActualizarAsignacion
>('asignaciones');

export const asignacionService = {
  ...crud,

  listarPaginado: async (
    filtros: FiltrosAsignaciones,
  ): Promise<RespuestaAsignacionesPaginada> => {
    const { data } = await httpClient.get<RespuestaAsignacionesPaginada>(
      '/asignaciones',
      { params: filtros },
    );
    return data;
  },
};
