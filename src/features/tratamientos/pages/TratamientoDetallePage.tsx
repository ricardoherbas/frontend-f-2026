import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { tieneRol } from '@/core/permissions/roles';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { Badge } from '@/shared/components/ui/Badge';
import { formatFecha } from '@/shared/utils/formatFecha';
import { textoVigencia } from '../adapters/tratamiento.adapter';
import { useTratamiento } from '../hooks/useTratamientos';

export default function TratamientoDetallePage() {
  const { id } = useParams();
  const { rol } = useAuth();

  const { data, isLoading, error } = useTratamiento(Number(id));
  const puedeEditar = tieneRol(rol, ['administrador', 'secretaria']);

  const nombrePaciente = data?.paciente?.persona
    ? `${data.paciente.persona.nombre} ${data.paciente.persona.apellido}`
    : `Paciente #${data?.paciente_id ?? ''}`;

  return (
    <>
      <PageHeader
        titulo="Ficha del tratamiento"
        accion={
          puedeEditar && data ? (
            <Link
              className="btn btn-secundario"
              to={`/tratamientos/${data.id}/editar`}
            >
              Editar
            </Link>
          ) : undefined
        }
      />

      <div className="panel">
        <StateView cargando={isLoading} error={error}>
          {data && (
            <>
              <dl className="ficha">
                <div>
                  <dt>ID del tratamiento</dt>
                  <dd>{data.id}</dd>
                </div>

                <div>
                  <dt>Estado</dt>
                  <dd>
                    <Badge tono={data.activa ? 'ok' : 'neutro'}>
                      {data.activa ? 'En curso' : 'Finalizado'}
                    </Badge>
                  </dd>
                </div>

                <div>
                  <dt>Paciente</dt>
                  <dd>{nombrePaciente}</dd>
                </div>

                <div>
                  <dt>ID del paciente</dt>
                  <dd>{data.paciente_id}</dd>
                </div>

                <div>
                  <dt>DNI del paciente</dt>
                  <dd>{data.paciente?.persona?.dni ?? '—'}</dd>
                </div>

                <div>
                  <dt>Fecha de nacimiento</dt>
                  <dd>
                    {formatFecha(data.paciente?.persona?.fecha_nacimiento)}
                  </dd>
                </div>

                <div>
                  <dt>Medicamento</dt>
                  <dd>{data.medicamento?.nombre ?? `Medicamento #${data.medicamento_id}`}</dd>
                </div>

                <div>
                  <dt>ID del medicamento</dt>
                  <dd>{data.medicamento_id}</dd>
                </div>

                <div>
                  <dt>Presentación</dt>
                  <dd>{data.medicamento?.presentacion ?? '—'}</dd>
                </div>

                <div>
                  <dt>Cantidad disponible</dt>
                  <dd>{data.medicamento?.cantidad ?? '—'}</dd>
                </div>

                <div>
                  <dt>Dosis indicada</dt>
                  <dd>{data.dosis}</dd>
                </div>

                <div>
                  <dt>Frecuencia</dt>
                  <dd>{data.frecuencia}</dd>
                </div>

                <div>
                  <dt>Horario</dt>
                  <dd>{data.horario ?? '—'}</dd>
                </div>

                <div>
                  <dt>Desde</dt>
                  <dd>{formatFecha(data.desde)}</dd>
                </div>

                <div>
                  <dt>Hasta</dt>
                  <dd>{formatFecha(data.hasta)}</dd>
                </div>

                <div>
                  <dt>Vigencia</dt>
                  <dd>{textoVigencia(data)}</dd>
                </div>
              </dl>

              <div style={{ marginTop: '1rem' }}>
                <Link className="btn btn-secundario" to="/tratamientos">
                  Volver a tratamientos
                </Link>
              </div>
            </>
          )}
        </StateView>
      </div>
    </>
  );
}
