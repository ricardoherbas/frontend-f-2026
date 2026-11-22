import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { formatFecha } from '@/shared/utils/formatFecha';
import { useFamiliar } from '../hooks/useFamiliares';

export default function FamiliarDetallePage() {
  const { id } = useParams();
  const { data, isLoading, error } = useFamiliar(Number(id));

  const nombre = data?.persona
    ? `${data.persona.apellido}, ${data.persona.nombre}`
    : 'Ficha del familiar';

  return (
    <>
      <PageHeader
        titulo={nombre}
        accion={
          data ? (
            <Link
              className="btn btn-secundario"
              to={`/familiares/${data.id}/editar`}
            >
              Editar
            </Link>
          ) : undefined
        }
      />

      <div className="panel">
        <StateView cargando={isLoading} error={error}>
          {data && (
            <dl className="ficha">
              <div>
                <dt>Nombre</dt>
                <dd>{data.persona?.nombre ?? '—'}</dd>
              </div>
              <div>
                <dt>Apellido</dt>
                <dd>{data.persona?.apellido ?? '—'}</dd>
              </div>
              <div>
                <dt>DNI</dt>
                <dd>{data.persona?.dni ?? '—'}</dd>
              </div>
              <div>
                <dt>Fecha de nacimiento</dt>
                <dd>{formatFecha(data.persona?.fecha_nacimiento)}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{data.persona?.telefono ?? '—'}</dd>
              </div>
              <div>
                <dt>ID del familiar</dt>
                <dd>{data.id}</dd>
              </div>
              <div>
                <dt>ID de la persona asociada</dt>
                <dd>{data.persona_id}</dd>
              </div>
            </dl>
          )}
        </StateView>
      </div>
    </>
  );
}
