import { Link } from 'react-router-dom';
import { StateView } from '@/shared/components/StateView';
import { DataTable } from '@/shared/components/DataTable';
import { formatFecha } from '@/shared/utils/formatFecha';
import { usePartesDiariosPaginado } from '@/features/partes-diarios/hooks/usePartesDiarios';
import type { ParteDiario } from '@/features/partes-diarios/interfaces/parteDiario.interface';

const FILTROS = { page: 1, limit: 5, sortBy: 'fecha', order: 'DESC' as const };

const nombre = (p?: { nombre: string; apellido: string } | null) => (p ? `${p.apellido}, ${p.nombre}` : '—');

export function PanelPartesRecientes() {
  const { data, isLoading, error } = usePartesDiariosPaginado(FILTROS);
  const partes = data?.datos ?? [];

  return (
    <section className="panel" aria-labelledby="titulo-partes">
      <div className="panel-encabezado">
        <h2 id="titulo-partes">Últimos partes diarios</h2>
        <Link to="/partes-diarios">Ver todos</Link>
      </div>
      <StateView cargando={isLoading} error={error} vacio={partes.length === 0} textoVacio="Todavía no hay partes cargados.">
        <DataTable<ParteDiario>
          filas={partes}
          clave={(p) => p.id}
          columnas={[
            { titulo: 'Fecha', render: (p) => formatFecha(p.fecha) },
            { titulo: 'Paciente', render: (p) => nombre(p.asignacion?.paciente?.persona) },
            { titulo: 'Ánimo', render: (p) => p.animo ?? '—' },
          ]}
          acciones={(p) => (
            <Link className="btn btn-texto btn-chico" to={`/partes-diarios/${p.id}`}>
              Ver ficha
            </Link>
          )}
        />
      </StateView>
    </section>
  );
}
