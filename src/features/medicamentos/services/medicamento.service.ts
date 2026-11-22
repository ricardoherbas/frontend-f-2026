import { httpClient } from '@/core/api/httpClient';
import { crearCrudApi } from '@/core/api/crudApi';
import type {
  DatosActualizarMedicamento,
  DatosCrearMedicamento,
  Medicamento,
} from '../interfaces/medicamento.interface';

export interface FiltrosMedicamentos {
  page?: number;
  limit?: number;
  search?: string;
  cantidad?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface RespuestaMedicamentosPaginada {
  datos: Medicamento[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

const crudApi = crearCrudApi<
  Medicamento,
  DatosCrearMedicamento,
  DatosActualizarMedicamento
>('medicamentos');

export const medicamentoService = {
  ...crudApi,

  listarPaginado: async (
    filtros: FiltrosMedicamentos,
  ): Promise<RespuestaMedicamentosPaginada> => {
    const respuesta = await httpClient.get<RespuestaMedicamentosPaginada>(
      '/medicamentos',
      { params: filtros },
    );

    return respuesta.data;
  },
};
