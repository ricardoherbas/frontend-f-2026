import { crearCrudApi } from '@/core/api/crudApi';
import { crearListadoPaginadoApi, type Paginado } from '@/core/api/paginacion';
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

export type RespuestaPacientesPaginada = Paginado<Paciente>;

const crudApi = crearCrudApi<
  Paciente,
  DatosCrearPaciente,
  DatosActualizarPaciente
>('pacientes');

export const pacienteService = {
  ...crudApi,

  listarPaginado: crearListadoPaginadoApi<Paciente, FiltrosPacientes>('pacientes'),
};
