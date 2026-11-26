import { crearCrudApi } from '@/core/api/crudApi';
import { crearListadoPaginadoApi, type Paginado } from '@/core/api/paginacion';
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

export type RespuestaTurnosPaginada = Paginado<Turno>;

const crudApi = crearCrudApi<
  Turno,
  DatosCrearTurno,
  DatosActualizarTurno
>('turnos');

export const turnoService = {
  ...crudApi,

  listarPaginado: crearListadoPaginadoApi<Turno, FiltrosTurnos>('turnos'),
};
