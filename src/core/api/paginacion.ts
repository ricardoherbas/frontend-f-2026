import { httpClient } from './httpClient';

/**
 * Forma ÚNICA con la que el front consume los listados paginados.
 * Las páginas y los hooks solo conocen esta forma: si el backend cambia
 * el formato de respuesta, se ajusta `normalizarPaginado` y nada más.
 */
export interface Paginado<T> {
  datos: T[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

type Crudo = Record<string, unknown>;

const esObjeto = (v: unknown): v is Crudo => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Devuelve el primer valor numérico válido entre varias claves posibles. */
function numero(fuentes: Crudo[], claves: string[]): number | undefined {
  for (const fuente of fuentes) {
    for (const clave of claves) {
      const valor = Number(fuente[clave]);
      if (fuente[clave] !== undefined && fuente[clave] !== null && Number.isFinite(valor)) return valor;
    }
  }
  return undefined;
}

const CLAVES_LISTA = ['datos', 'data', 'items', 'results', 'rows', 'registros'];
const CLAVES_META = ['paginacion', 'pagination', 'meta', 'paging'];

/**
 * Acepta el formato actual del backend ({ datos, paginacion }) y los
 * formatos habituales a los que suele migrar ({ data, meta }, { items, total },
 * arreglo plano, etc.) y siempre devuelve `Paginado<T>`.
 */
export function normalizarPaginado<T>(
  crudo: unknown,
  pedido: { page?: number; limit?: number } = {},
): Paginado<T> {
  let datos: T[] = [];
  let raiz: Crudo = {};

  if (Array.isArray(crudo)) {
    datos = crudo as T[];
  } else if (esObjeto(crudo)) {
    raiz = crudo;
    const clave = CLAVES_LISTA.find((c) => Array.isArray(crudo[c]));
    if (clave) datos = crudo[clave] as T[];
  }

  const meta = CLAVES_META.map((c) => raiz[c]).find(esObjeto) ?? {};
  const fuentes = [meta, raiz];

  const limite =
    numero(fuentes, ['limite', 'limit', 'pageSize', 'perPage', 'per_page']) ?? pedido.limit ?? (datos.length || 10);
  const pagina = numero(fuentes, ['pagina', 'page', 'currentPage', 'current_page']) ?? pedido.page ?? 1;
  const total = numero(fuentes, ['total', 'totalItems', 'total_items', 'count', 'totalRegistros']) ?? datos.length;
  const totalPaginas =
    numero(fuentes, ['totalPaginas', 'totalPages', 'total_pages', 'pages', 'lastPage', 'last_page']) ??
    (limite > 0 ? Math.ceil(total / limite) : 0);

  return { datos, paginacion: { pagina, limite, total, totalPaginas } };
}

/** Fábrica de `listarPaginado` para cada recurso (GET /<ruta> con filtros). */
export function crearListadoPaginadoApi<Entidad, Filtros extends { page?: number; limit?: number }>(
  ruta: string,
) {
  return async (filtros: Filtros): Promise<Paginado<Entidad>> => {
    const { data } = await httpClient.get<unknown>(`/${ruta}`, { params: filtros });
    return normalizarPaginado<Entidad>(data, filtros);
  };
}
