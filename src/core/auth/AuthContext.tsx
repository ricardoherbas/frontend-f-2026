import { createContext } from 'react';
import type { UsuarioSesion } from '@/features/auth/interfaces/auth.interface';
import type { Rol } from '@/core/permissions/roles';

interface AuthContextValue {
  usuario: UsuarioSesion | null;
  rol: Rol | null;
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<UsuarioSesion>;
  cerrarSesion: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
