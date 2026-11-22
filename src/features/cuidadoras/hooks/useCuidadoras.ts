import { useQuery } from '@tanstack/react-query';
import { cuidadoraService } from '../services/cuidadora.service';
import type { FiltrosCuidadoras } from '../services/cuidadora.service';

const CLAVE = 'cuidadoras';

// Conservamos el listado original para otros módulos, como Asignaciones.
export const useCuidadoras = () =>
  useQuery({
    queryKey: [CLAVE],
    queryFn: cuidadoraService.listar,
  });

// Listado paginado exclusivo para la página de Cuidadoras.
export const useCuidadorasPaginado = (filtros: FiltrosCuidadoras) =>
  useQuery({
    queryKey: [CLAVE, 'paginado', filtros],
    queryFn: () => cuidadoraService.listarPaginado(filtros),
  });

// Consulta individual para visualizar o editar una cuidadora.
export const useCuidadora = (id: number) =>
  useQuery({
    queryKey: [CLAVE, id],
    queryFn: () => cuidadoraService.obtener(id),
    enabled: Number.isFinite(id) && id > 0,
  });
