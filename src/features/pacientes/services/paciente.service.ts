import { httpClient } from '@/core/api/httpClient';
import { crearCrudApi } from '@/core/api/crudApi';
import type {
  DatosActualizarPaciente,
  DatosCrearPaciente,
  Paciente,
} from '../interfaces/paciente.interface';

export interface FiltrosPacientes {
  page?: number;
  limit?: number;
  search?: string;
  obra_social?: string;
  activo?: boolean;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface RespuestaPacientesPaginada {
  datos: Paciente[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

const crudApi = crearCrudApi<
  Paciente,
  DatosCrearPaciente,
  DatosActualizarPaciente
>('pacientes');

export const pacienteService = {
  ...crudApi,

  listarPaginado: async (
    filtros: FiltrosPacientes,
  ): Promise<RespuestaPacientesPaginada> => {
    const respuesta = await httpClient.get<RespuestaPacientesPaginada>(
      '/pacientes',
      { params: filtros },
    );

    return respuesta.data;
  },
};
