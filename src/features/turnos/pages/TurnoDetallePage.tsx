import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { tieneRol } from '@/core/permissions/roles';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { useTurno } from '../hooks/useTurnos';
import { hhmm } from '../adapters/turno.adapter';

export default function TurnoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const turnoId = Number(id);

  const { rol } = useAuth();
  const puedeEditar = tieneRol(rol, ['administrador', 'secretaria']);

  const { data: turno, isLoading, error } = useTurno(turnoId);

  const creadoEn = turno?.creado_en
    ? new Date(turno.creado_en).toLocaleString('es-AR')
    : 'No disponible';

  return (
    <>
      <PageHeader
        titulo="Ficha de turno"
        descripcion={turno ? `Información del turno ${turno.id}.` : 'Detalle del turno.'}
        accion={
          puedeEditar && turno
            ? (
              <Button onClick={() => navigate('/turnos', { state: { editarTurnoId: turno.id } })}>
                Volver al listado
              </Button>
            )
            : (
              <Button variante="secundario" onClick={() => navigate('/turnos')}>
                Volver al listado
              </Button>
            )
        }
      />

      <div className="panel">
        <StateView
          cargando={isLoading}
          error={error ?? (Number.isInteger(turnoId) && turnoId > 0 ? undefined : new Error('El identificador del turno no es válido.'))}
          vacio={!isLoading && !error && !turno}
          textoVacio="No se encontró el turno solicitado."
        >
          {turno && (
            <div className="detalle-grid">
              <div className="detalle-item">
                <span>Identificador</span>
                <strong>{turno.id}</strong>
              </div>

              <div className="detalle-item">
                <span>Día de la semana</span>
                <strong>{turno.dia_semana}</strong>
              </div>

              <div className="detalle-item">
                <span>Hora de inicio</span>
                <strong>{hhmm(turno.hora_inicio)}</strong>
              </div>

              <div className="detalle-item">
                <span>Hora de finalización</span>
                <strong>{hhmm(turno.hora_fin)}</strong>
              </div>

              <div className="detalle-item">
                <span>Estado</span>
                <strong>
                  <Badge tono={turno.activo ? 'ok' : 'neutro'}>
                    {turno.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </strong>
              </div>

              <div className="detalle-item">
                <span>Fecha de creación</span>
                <strong>{creadoEn}</strong>
              </div>
            </div>
          )}
        </StateView>
      </div>
    </>
  );
}
