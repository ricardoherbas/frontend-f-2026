import axios from 'axios';
import { httpClient } from './httpClient';
import type { ErrorApi } from '@/core/types/api.types';

type Filtros = Record<string, unknown>;

/**
 * Contrato real del backend (solo turnos, asignaciones y pagos):
 *   GET /api/<ruta>/reporte?<mismos filtros del listado>  ->  .xlsx
 * El nombre del archivo viaja en Content-Disposition, pero el backend no lo expone
 * por CORS (sin exposedHeaders), por eso hay un nombre de respaldo.
 */
export const rutaExportacion = (ruta: string) => `/${ruta}/reporte`;

/** Las exportaciones traen TODOS los registros filtrados: no se manda la paginación. */
function filtrosParaExportar(filtros: Filtros): Filtros {
  const { page: _page, limit: _limit, ...resto } = filtros;
  void _page;
  void _limit;
  return resto;
}

function nombreDesdeCabecera(cabecera: unknown): string | null {
  if (typeof cabecera !== 'string') return null;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(cabecera);
  if (utf8) return decodeURIComponent(utf8[1]);
  const simple = /filename="?([^";]+)"?/i.exec(cabecera);
  return simple ? simple[1] : null;
}

/** Cuando el backend falla con responseType blob, el { mensaje } llega dentro del blob. */
async function mensajeDeErrorBlob(error: unknown): Promise<Error> {
  if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
    try {
      const texto = await error.response.data.text();
      const json = JSON.parse(texto) as Partial<ErrorApi>;
      if (json.mensaje) return new Error(json.mensaje);
    } catch {
      /* el cuerpo no era JSON: se usa el error original */
    }
  }
  return error instanceof Error ? error : new Error('No se pudo generar el reporte');
}

export async function descargarReporte(ruta: string, filtros: Filtros): Promise<void> {
  try {
    const respuesta = await httpClient.get<Blob>(rutaExportacion(ruta), {
      params: filtrosParaExportar(filtros),
      responseType: 'blob',
    });

    const fecha = new Date().toISOString().slice(0, 10);
    const nombre =
      nombreDesdeCabecera(respuesta.headers['content-disposition']) ??
      `${ruta}-${fecha}.xlsx`;

    const url = URL.createObjectURL(respuesta.data);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    throw await mensajeDeErrorBlob(error);
  }
}
