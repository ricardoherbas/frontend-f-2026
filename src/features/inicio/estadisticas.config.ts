import type { Rol } from '@/core/permissions/roles';
import type { Paginado } from '@/core/api/paginacion';
import { hoyISO } from '@/shared/utils/formatFecha';
import { pacienteService } from '@/features/pacientes/services/paciente.service';
import { cuidadoraService } from '@/features/cuidadoras/services/cuidadora.service';
import { familiarService } from '@/features/familiares/services/familiar.service';
import { turnoService } from '@/features/turnos/services/turno.service';
import { asignacionService } from '@/features/asignaciones/services/asignacion.service';
import { medicamentoService } from '@/features/medicamentos/services/medicamento.service';
import { tratamientoService } from '@/features/tratamientos/services/tratamiento.service';
import { parteDiarioService } from '@/features/partes-diarios/services/parteDiario.service';
import { pagoService } from '@/features/pagos/services/pago.service';

export type Tono = 'neutro' | 'aviso' | 'peligro' | 'ok';

export interface Estadistica {
  clave: string;
  etiqueta: string;
  /** Pantalla a la que lleva la tarjeta. */
  ruta: string;
  roles: Rol[];
  tono?: Tono;
  /** Devuelve un listado de 1 registro: lo único que importa es `paginacion.total`. */
  cargar: () => Promise<Paginado<unknown>>;
}

const TODOS: Rol[] = ['administrador', 'secretaria', 'cuidadora', 'familiar'];
const ADMIN_SEC: Rol[] = ['administrador', 'secretaria'];
const ADMIN_SEC_CUID: Rol[] = ['administrador', 'secretaria', 'cuidadora'];
const ADMIN_SEC_FAM: Rol[] = ['administrador', 'secretaria', 'familiar'];

const UNO = { page: 1, limit: 1 } as const;

/**
 * Las estadísticas se arman con los listados que ya existen (solo se lee el total),
 * así que el home funciona sin endpoints nuevos. Si el backend suma un
 * GET /dashboard/resumen, alcanza con reemplazar `cargar` en este archivo.
 */
export const ESTADISTICAS: Estadistica[] = [
  { clave: 'pacientes', etiqueta: 'Pacientes activos', ruta: '/pacientes', roles: TODOS, cargar: () => pacienteService.listarPaginado({ ...UNO, activo: true }) },
  { clave: 'tratamientos', etiqueta: 'Tratamientos activos', ruta: '/tratamientos', roles: TODOS, cargar: () => tratamientoService.listarPaginado({ ...UNO, activa: true }) },
  { clave: 'partes-hoy', etiqueta: 'Partes diarios de hoy', ruta: '/partes-diarios', roles: TODOS, cargar: () => parteDiarioService.listarPaginado({ ...UNO, fechaDesde: hoyISO(), fechaHasta: hoyISO() }) },
  { clave: 'cuidadoras', etiqueta: 'Cuidadoras', ruta: '/cuidadoras', roles: ADMIN_SEC, cargar: () => cuidadoraService.listarPaginado(UNO) },
  { clave: 'familiares', etiqueta: 'Familiares', ruta: '/familiares', roles: ADMIN_SEC, cargar: () => familiarService.listarPaginado(UNO) },
  { clave: 'turnos', etiqueta: 'Turnos activos', ruta: '/turnos', roles: ADMIN_SEC_CUID, cargar: () => turnoService.listarPaginado({ ...UNO, activo: true }) },
  { clave: 'asignaciones', etiqueta: 'Asignaciones activas', ruta: '/asignaciones', roles: ADMIN_SEC_CUID, cargar: () => asignacionService.listarPaginado({ ...UNO, activo: true }) },
  { clave: 'medicamentos', etiqueta: 'Medicamentos', ruta: '/medicamentos', roles: ADMIN_SEC_CUID, cargar: () => medicamentoService.listarPaginado(UNO) },
  { clave: 'pagos-pendientes', etiqueta: 'Pagos pendientes', ruta: '/pagos', roles: ADMIN_SEC_FAM, tono: 'aviso', cargar: () => pagoService.listarPaginado({ ...UNO, estado: 'pendiente' }) },
  { clave: 'pagos-vencidos', etiqueta: 'Pagos vencidos', ruta: '/pagos', roles: ADMIN_SEC_FAM, tono: 'peligro', cargar: () => pagoService.listarPaginado({ ...UNO, estado: 'vencido' }) },
];

export interface AccionRapida {
  etiqueta: string;
  ruta: string;
  roles: Rol[];
}

/** Atajos de alta. Los roles replican los de cada ruta "/nuevo" en routes.config. */
export const ACCIONES_RAPIDAS: AccionRapida[] = [
  { etiqueta: 'Nuevo parte diario', ruta: '/partes-diarios/nuevo', roles: ADMIN_SEC_CUID },
  { etiqueta: 'Nuevo paciente', ruta: '/pacientes/nuevo', roles: ADMIN_SEC },
  { etiqueta: 'Nuevo tratamiento', ruta: '/tratamientos/nuevo', roles: ADMIN_SEC },
  { etiqueta: 'Nuevo pago', ruta: '/pagos/nuevo', roles: ADMIN_SEC },
];

/** Texto corto de cada pantalla para las tarjetas de acceso rápido. */
export const DESCRIPCION_ACCESO: Record<string, string> = {
  '/usuarios': 'Altas, roles y estado de las cuentas.',
  '/pacientes': 'Fichas y datos de las personas asistidas.',
  '/familiares': 'Familiares y datos de contacto.',
  '/vinculos-familiares': 'Relación familiar–paciente y códigos QR.',
  '/cuidadoras': 'Equipo de cuidadoras.',
  '/turnos': 'Días y franjas horarias de cuidado.',
  '/asignaciones': 'Quién cuida a quién y en qué turno.',
  '/medicamentos': 'Catálogo de medicamentos.',
  '/tratamientos': 'Tratamientos en curso de cada paciente.',
  '/partes-diarios': 'Registro diario de ánimo, higiene y novedades.',
  '/pagos': 'Seguimiento mensual de cobros.',
  '/perfil': 'Tus datos y tu contraseña.',
};
