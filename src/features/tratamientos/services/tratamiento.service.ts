import { httpClient } from '@/core/api/httpClient';
import { crearCrudApi } from '@/core/api/crudApi';
import type {
  DatosActualizarTratamiento,
  DatosCrearTratamiento,
  Tratamiento,
} from '../interfaces/tratamiento.interface';

export interface FiltrosTratamientos {
  page?: number;
  limit?: number;
  search?: string;
  activa?: boolean;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface RespuestaTratamientosPaginada {
  datos: Tratamiento[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

const crudApi = crearCrudApi<
  Tratamiento,
  DatosCrearTratamiento,
  DatosActualizarTratamiento
>('tratamientos');

export const tratamientoService = {
  ...crudApi,

  listarPaginado: async (
    filtros: FiltrosTratamientos,
  ): Promise<RespuestaTratamientosPaginada> => {
    const respuesta = await httpClient.get<RespuestaTratamientosPaginada>(
      '/tratamientos',
      { params: filtros },
    );

    return respuesta.data;
  },
};
