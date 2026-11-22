import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { tieneRol } from '@/core/permissions/roles';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { formatFecha } from '@/shared/utils/formatFecha';
import { formatMoneda } from '@/shared/utils/formatMoneda';
import { usePacienteOpciones } from '@/shared/hooks/usePacienteOpciones';
import { usePago } from '../hooks/usePagos';
import {
  ETIQUETA_ESTADO_PAGO,
  ETIQUETA_MEDIO_PAGO,
  TONO_ESTADO_PAGO,
  formatPeriodo,
} from '../adapters/pago.adapter';

export default function PagoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pagoId = Number(id);

  const { rol } = useAuth();
  const puedeEditar = tieneRol(rol, ['administrador', 'secretaria']);

  const { data: pago, isLoading, error } = usePago(pagoId);
  const { nombreDe } = usePacienteOpciones();

  const persona = pago?.paciente?.persona;

  const nombrePaciente = persona
    ? `${persona.nombre ?? ''} ${persona.apellido ?? ''}`.trim()
    : pago
      ? nombreDe(pago.paciente_id)
      : '';

  return (
    <>
      <PageHeader
        titulo="Ficha de pago"
        descripcion={pago ? `Información del pago ${pago.id}.` : 'Detalle del pago.'}
        accion={
          <Button variante="secundario" onClick={() => navigate('/pagos')}>
            Volver al listado
          </Button>
        }
      />

      <div className="panel">
        <StateView
          cargando={isLoading}
          error={error ?? (
            Number.isInteger(pagoId) && pagoId > 0
              ? undefined
              : new Error('El identificador del pago no es válido.')
          )}
          vacio={!isLoading && !error && !pago}
          textoVacio="No se encontró el pago solicitado."
        >
          {pago && (
            <>
              <div className="detalle-grid">
                <div className="detalle-item">
                  <span>Identificador</span>
                  <strong>{pago.id}</strong>
                </div>

                <div className="detalle-item">
                  <span>Período</span>
                  <strong>{formatPeriodo(pago.periodo)}</strong>
                </div>

                <div className="detalle-item">
                  <span>Monto</span>
                  <strong>{formatMoneda(pago.monto)}</strong>
                </div>

                <div className="detalle-item">
                  <span>Estado</span>
                  <strong>
                    <Badge tono={TONO_ESTADO_PAGO[pago.estado]}>
                      {ETIQUETA_ESTADO_PAGO[pago.estado]}
                    </Badge>
                  </strong>
                </div>

                <div className="detalle-item">
                  <span>Medio de pago</span>
                  <strong>
                    {pago.medio_pago
                      ? ETIQUETA_MEDIO_PAGO[pago.medio_pago]
                      : 'No registrado'}
                  </strong>
                </div>

                <div className="detalle-item">
                  <span>Fecha de pago</span>
                  <strong>
                    {pago.fecha_pago ? formatFecha(pago.fecha_pago) : 'No registrada'}
                  </strong>
                </div>

                <div className="detalle-item">
                  <span>Identificador del paciente</span>
                  <strong>{pago.paciente_id}</strong>
                </div>

                <div className="detalle-item">
                  <span>Paciente</span>
                  <strong>{nombrePaciente}</strong>
                </div>

                <div className="detalle-item">
                  <span>DNI del paciente</span>
                  <strong>{persona?.dni ?? 'No disponible'}</strong>
                </div>

                <div className="detalle-item">
                  <span>Observaciones</span>
                  <strong>{pago.observaciones || 'Sin observaciones'}</strong>
                </div>
              </div>

              {puedeEditar && (
                <div className="acciones-listado">
                  <Button onClick={() => navigate(`/pagos/${pago.id}/editar`)}>
                    Editar pago
                  </Button>
                </div>
              )}
            </>
          )}
        </StateView>
      </div>
    </>
  );
}
