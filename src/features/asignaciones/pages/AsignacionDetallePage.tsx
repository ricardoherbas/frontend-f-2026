import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { tieneRol } from '@/core/permissions/roles';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { etiquetaTurno } from '@/features/turnos/adapters/turno.adapter';
import { useAsignacion } from '../hooks/useAsignaciones';
import { AsignacionFormModal } from '../components/AsignacionFormModal';

function mostrarFecha(fecha: string | undefined): string {
  if (!fecha) return 'No disponible';

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) return fecha;

  return valor.toLocaleString('es-AR');
}

export default function AsignacionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rol } = useAuth();

  const idAsignacion = Number(id);
  const idValido = Number.isInteger(idAsignacion) && idAsignacion > 0;

  const { data, isLoading, error } = useAsignacion(idAsignacion);

  const puedeEditar = tieneRol(rol, ['administrador', 'secretaria']);
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <>
      <PageHeader
        titulo="Ficha de asignación"
        descripcion={`Detalle de la asignación #${id ?? ''}.`}
        accion={
          puedeEditar && data ? (
            <Button onClick={() => setModalAbierto(true)}>Editar</Button>
          ) : undefined
        }
      />

      <div className="panel">
        {!idValido ? (
          <StateView
            cargando={false}
            error={null}
            vacio
            textoVacio="El identificador de la asignación no es válido."
          >
            <></>
          </StateView>
        ) : (
          <StateView
            cargando={isLoading}
            error={error}
            vacio={!data && !isLoading && !error}
            textoVacio="No se encontró la asignación."
          >
            {data && (
              <>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <strong>ID de asignación</strong>
                    <span>{data.id}</span>
                  </div>

                  <div className="detalle-item">
                    <strong>Estado</strong>
                    <span>
                      <Badge tono={data.activo ? 'ok' : 'neutro'}>
                        {data.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </span>
                  </div>

                  <div className="detalle-item">
                    <strong>Paciente</strong>
                    <span>
                      {data.paciente?.persona
                        ? `${data.paciente.persona.apellido}, ${data.paciente.persona.nombre}`
                        : `Paciente #${data.paciente_id}`}
                    </span>
                  </div>

                  <div className="detalle-item">
                    <strong>ID de paciente</strong>
                    <span>{data.paciente_id}</span>
                  </div>

                  <div className="detalle-item">
                    <strong>DNI del paciente</strong>
                    <span>{data.paciente?.persona?.dni ?? 'No disponible'}</span>
                  </div>

                  <div className="detalle-item">
                    <strong>Teléfono del paciente</strong>
                    <span>
                      {data.paciente?.persona?.telefono ?? 'No disponible'}
                    </span>
                  </div>

                  <div className="detalle-item">
                    <strong>Cuidadora</strong>
                    <span>
                      {data.cuidadora?.persona
                        ? `${data.cuidadora.persona.apellido}, ${data.cuidadora.persona.nombre}`
                        : `Cuidadora #${data.cuidador_id}`}
                    </span>
                  </div>

                  <div className="detalle-item">
                    <strong>ID de cuidadora</strong>
                    <span>{data.cuidador_id}</span>
                  </div>

                  <div className="detalle-item">
                    <strong>DNI de la cuidadora</strong>
                    <span>
                      {data.cuidadora?.persona?.dni ?? 'No disponible'}
                    </span>
                  </div>

                  <div className="detalle-item">
                    <strong>Teléfono de la cuidadora</strong>
                    <span>
                      {data.cuidadora?.persona?.telefono ?? 'No disponible'}
                    </span>
                  </div>

                  <div className="detalle-item">
                    <strong>Turno asignado</strong>
                    <span>
                      {data.turno
                        ? etiquetaTurno(data.turno)
                        : `Turno #${data.turno_id}`}
                    </span>
                  </div>

                  <div className="detalle-item">
                    <strong>ID de turno</strong>
                    <span>{data.turno_id}</span>
                  </div>

                  <div className="detalle-item">
                    <strong>Fecha de creación</strong>
                    <span>{mostrarFecha(data.creado_en)}</span>
                  </div>
                </div>

                <div className="acciones-listado">
                  <Button
                    variante="secundario"
                    onClick={() => navigate('/asignaciones')}
                  >
                    Volver al listado
                  </Button>
                </div>
              </>
            )}
          </StateView>
        )}
      </div>

      {puedeEditar && data && (
        <AsignacionFormModal
          abierto={modalAbierto}
          asignacion={data}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </>
  );
}
