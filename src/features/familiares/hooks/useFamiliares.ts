import { useQuery } from '@tanstack/react-query';
import { familiarService } from '../services/familiar.service';
import type { FiltrosFamiliares } from '../services/familiar.service';

const CLAVE = 'familiares';

// Conservamos el listado original para Vínculos Familiares.
export const useFamiliares = () =>
  useQuery({
    queryKey: [CLAVE],
    queryFn: familiarService.listar,
  });

// Listado paginado exclusivo para la página de Familiares.
export const useFamiliaresPaginado = (filtros: FiltrosFamiliares) =>
  useQuery({
    queryKey: [CLAVE, 'paginado', filtros],
    queryFn: () => familiarService.listarPaginado(filtros),
  });

// Consulta individual para visualizar o editar un familiar.
export const useFamiliar = (id: number) =>
  useQuery({
    queryKey: [CLAVE, id],
    queryFn: () => familiarService.obtener(id),
    enabled: Number.isFinite(id) && id > 0,
  });
