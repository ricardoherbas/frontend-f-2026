import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { tieneRol } from '@/core/permissions/roles';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { formatFecha } from '@/shared/utils/formatFecha';
import { useNombres } from '@/features/asignaciones/hooks/useNombres';
import { useParteDiario } from '../hooks/usePartesDiarios';

export default function ParteDiarioDetallePage() {
  const { id } = useParams();
  const { rol } = useAuth();
  const { data, isLoading, error } = useParteDiario(Number(id));
  const nombres = useNombres();

  const puedeEditar = tieneRol(rol, [
    'administrador',
    'secretaria',
    'cuidadora',
  ]);

  const paciente =
    data?.asignacion?.paciente?.persona;

  const cuidadora =
    data?.asignacion?.cuidadora?.persona;

  return (
    <>
      <PageHeader
        titulo="Ficha del parte diario"
        descripcion={data ? `Registro del ${formatFecha(data.fecha)}` : undefined}
        accion={
          puedeEditar && data ? (
            <Link
              className="btn btn-secundario"
              to={`/partes-diarios/${data.id}/editar`}
            >
              Editar
            </Link>
          ) : undefined
        }
      />

      <div className="panel">
        <StateView
          cargando={isLoading}
          error={error}
          vacio={!data}
          textoVacio="No se encontró el parte diario."
        >
          {data && (
            <dl className="ficha">
              <div>
                <dt>Fecha</dt>
                <dd>{formatFecha(data.fecha)}</dd>
              </div>

              <div>
                <dt>Paciente</dt>
                <dd>
                  {paciente
                    ? `${paciente.apellido}, ${paciente.nombre}`
                    : data.asignacion
                      ? nombres.paciente(data.asignacion.paciente_id)
                      : '—'}
                </dd>
              </div>

              <div>
                <dt>Cuidadora</dt>
                <dd>
                  {cuidadora
                    ? `${cuidadora.apellido}, ${cuidadora.nombre}`
                    : data.asignacion
                      ? nombres.cuidadora(data.asignacion.cuidador_id)
                      : '—'}
                </dd>
              </div>

              <div>
                <dt>Asignación</dt>
                <dd>#{data.asignacion_id}</dd>
              </div>

              <div>
                <dt>Ánimo</dt>
                <dd>{data.animo ?? '—'}</dd>
              </div>

              <div>
                <dt>Alimentación</dt>
                <dd>{data.alimentacion ?? '—'}</dd>
              </div>

              <div>
                <dt>Descanso</dt>
                <dd>{data.descanso ?? '—'}</dd>
              </div>

              <div>
                <dt>Higiene</dt>
                <dd>{data.higiene ?? '—'}</dd>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <dt>Novedades</dt>
                <dd>{data.novedades ?? '—'}</dd>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <dt>Observaciones</dt>
                <dd>{data.observaciones ?? '—'}</dd>
              </div>
            </dl>
          )}
        </StateView>

        <div className="form-acciones" style={{ marginTop: '1rem' }}>
          <Link className="btn btn-secundario" to="/partes-diarios">
            Volver al listado
          </Link>
        </div>
      </div>
    </>
  );
}
