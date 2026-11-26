import { Link } from 'react-router-dom';
import { StateView } from '@/shared/components/StateView';
import { DataTable } from '@/shared/components/DataTable';
import { Badge } from '@/shared/components/ui/Badge';
import { formatMoneda } from '@/shared/utils/formatMoneda';
import { usePagosPaginados } from '@/features/pagos/hooks/usePagos';
import {
  ETIQUETA_ESTADO_PAGO,
  TONO_ESTADO_PAGO,
  formatPeriodo,
} from '@/features/pagos/adapters/pago.adapter';
import type { Pago } from '@/features/pagos/interfaces/pago.interface';

const FILTROS = { page: 1, limit: 5, estado: 'vencido' as const, sortBy: 'periodo', order: 'DESC' as const };

export function PanelPagosPorCobrar() {
  const { data, isLoading, error } = usePagosPaginados(FILTROS);
  const pagos = data?.datos ?? [];

  return (
    <section className="panel" aria-labelledby="titulo-pagos">
      <div className="panel-encabezado">
        <h2 id="titulo-pagos">Pagos vencidos</h2>
        <Link to="/pagos">Ver todos</Link>
      </div>
      <StateView cargando={isLoading} error={error} vacio={pagos.length === 0} textoVacio="No hay pagos vencidos. ¡Todo al día!">
        <DataTable<Pago>
          filas={pagos}
          clave={(p) => p.id}
          columnas={[
            { titulo: 'Período', render: (p) => formatPeriodo(p.periodo) },
            {
              titulo: 'Paciente',
              render: (p) => {
                const persona = p.paciente?.persona;
                return persona ? `${persona.apellido}, ${persona.nombre}` : `Paciente #${p.paciente_id}`;
              },
            },
            { titulo: 'Monto', render: (p) => formatMoneda(p.monto) },
            { titulo: 'Estado', render: (p) => <Badge tono={TONO_ESTADO_PAGO[p.estado]}>{ETIQUETA_ESTADO_PAGO[p.estado]}</Badge> },
          ]}
          acciones={(p) => (
            <Link className="btn btn-texto btn-chico" to={`/pagos/${p.id}`}>
              Ver ficha
            </Link>
          )}
        />
      </StateView>
    </section>
  );
}
