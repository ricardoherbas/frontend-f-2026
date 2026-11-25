import type { Rol } from '@/core/permissions/roles';
import type { Persona } from '@/core/types/persona.interface';

export interface UsuarioSesion {
  id: number;
  persona_id: number;
  email: string;
  rol: Rol;
  activo: boolean;
}

export interface DatosLogin {
  email: string;
  password: string;
}

export interface RespuestaLogin {
  token: string;
  usuario: UsuarioSesion;
}

/** GET /auth/perfil: el usuario con su persona anidada */
export interface PerfilUsuario extends UsuarioSesion {
  creado_en: string;
  actualizado_en: string;
  persona: Persona;
}

/** POST /auth/registro: registro familiar mediante código de vinculación */
export interface DatosRegistroFamiliar {
  codigo_vinculacion: string;
  email: string;
  password: string;
}
