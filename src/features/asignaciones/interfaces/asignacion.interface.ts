import type { Turno } from '@/features/turnos/interfaces/turno.interface';
import type { Persona } from '@/core/types/persona.interface';

/** Datos de Persona que devuelve el backend dentro de una asignación. */
export type PersonaResumen = Pick<Persona, 'nombre' | 'apellido'> &
  Partial<Pick<Persona, 'dni' | 'telefono'>>;

export interface PacienteAsignado {
  id?: number;
  persona?: PersonaResumen | null;
}

export interface CuidadoraAsignada {
  id?: number;
  persona?: PersonaResumen | null;
}

export interface Asignacion {
  id: number;
  turno_id: number;
  cuidador_id: number;
  paciente_id: number;
  activo: boolean;
  creado_en: string;
  turno?: Turno;
  cuidadora?: CuidadoraAsignada;
  paciente?: PacienteAsignado;
}

export interface DatosCrearAsignacion {
  turno_id: number;
  cuidador_id: number;
  paciente_id: number;
  activo?: boolean;
}

export type DatosActualizarAsignacion = Partial<DatosCrearAsignacion>;
