import { httpClient } from '@/core/api/httpClient';
import { crearCrudApi } from '@/core/api/crudApi';
import type {
  DatosActualizarTurno,
  DatosCrearTurno,
  Turno,
} from '../interfaces/turno.interface';

export interface FiltrosTurnos {
  page?: number;
  limit?: number;
  search?: string;
  dia_semana?: string;
  activo?: boolean;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface RespuestaTurnosPaginada {
  datos: Turno[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

const crudApi = crearCrudApi<
  Turno,
  DatosCrearTurno,
  DatosActualizarTurno
>('turnos');

export const turnoService = {
  ...crudApi,

  listarPaginado: async (
    filtros: FiltrosTurnos,
  ): Promise<RespuestaTurnosPaginada> => {
    const respuesta = await httpClient.get<RespuestaTurnosPaginada>(
      '/turnos',
      { params: filtros },
    );

    return respuesta.data;
  },
};
