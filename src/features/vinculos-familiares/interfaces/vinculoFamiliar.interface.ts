import type { Persona } from '@/core/types/persona.interface';
import type { Paciente } from '@/features/pacientes/interfaces/paciente.interface';

export interface VinculoFamiliar {
  id: number;
  familiar_id: number;
  paciente_id: number;
  parentesco: string;
  es_contacto_principal: boolean;
  /** El listado no devuelve este campo; llega al crear o regenerar el código. */
  codigo_vinculacion?: string | null;
  codigo_usado: boolean;
  /** Fecha y hora de vencimiento del código (ISO). */
  expira_en: string;
  activo: boolean;
  creado_en: string;
  familiar?: {
    id: number;
    persona_id: number;
    persona?: Persona;
  };
  paciente?: Paciente;
}

export interface DatosCrearVinculo {
  familiar_id: number;
  paciente_id: number;
  parentesco: string;
  es_contacto_principal?: boolean;
}

export type DatosActualizarVinculo = Partial<DatosCrearVinculo>;

/** Respuesta de POST / y PATCH /:id/regenerar-codigo. */
export interface RespuestaCodigoVinculo {
  mensaje: string;
  vinculo: {
    codigo_vinculacion: string;
    expira_en: string;
  };
}
