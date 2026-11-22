import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { tieneRol } from '@/core/permissions/roles';
import { obtenerMensajeError } from '@/core/api/errors';
import type { EstadoPago } from '@/core/types/estado-pago.type';
import type { MedioPago } from '@/core/types/medio-pago.type';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { usePacienteOpciones } from '@/shared/hooks/usePacienteOpciones';
import { formatFecha } from '@/shared/utils/formatFecha';
import { formatMoneda } from '@/shared/utils/formatMoneda';
import {
  useEliminarPago,
  useGuardarPago,
  usePagosPaginados,
} from '../hooks/usePagos';
import { RegistrarCobroModal } from '../components/RegistrarCobroModal';
import {
  ETIQUETA_ESTADO_PAGO,
  ETIQUETA_MEDIO_PAGO,
  TONO_ESTADO_PAGO,
  formatPeriodo,
  pagoAPayload,
} from '../adapters/pago.adapter';
import { ESTADOS_PAGO, MEDIOS_PAGO } from '../validators/pago.validator';
import type { Pago } from '../interfaces/pago.interface';

const LIMITE_POR_PAGINA = 10;
const PAGOS_VACIOS: Pago[] = [];

const escaparHtml = (valor: string): string =>
  valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

type FiltroEstado = '' | EstadoPago;
type FiltroMedio = '' | MedioPago;

export default function PagosPage() {
  const { rol } = useAuth();

  const puedeEditar = tieneRol(rol, ['administrador', 'secretaria']);
  const puedeEliminar = tieneRol(rol, ['administrador']);

  const { nombreDe } = usePacienteOpciones();

  const guardar = useGuardarPago();
  const eliminar = useEliminarPago();

  const [busqueda, setBusqueda] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');
  const [estado, setEstado] = useState<FiltroEstado>('');
  const [medioPago, setMedioPago] = useState<FiltroMedio>('');
  const [periodoDesde, setPeriodoDesde] = useState('');
  const [periodoHasta, setPeriodoHasta] = useState('');
  const [pagina, setPagina] = useState(1);

  const [aCobrar, setACobrar] = useState<Pago | null>(null);
  const [errorCobro, setErrorCobro] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Pago | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const filtros = {
    page: pagina,
    limit: LIMITE_POR_PAGINA,
    search: busquedaAplicada || undefined,
    estado: estado || undefined,
    medio_pago: medioPago || undefined,
    periodoDesde: periodoDesde || undefined,
    periodoHasta: periodoHasta || undefined,
    sortBy: 'periodo',
    order: 'DESC' as const,
  };

  const { data, isLoading, error } = usePagosPaginados(filtros);

  const pagos = data?.datos ?? PAGOS_VACIOS;
  const total = data?.paginacion.total ?? 0;
  const totalPaginas = data?.paginacion.totalPaginas ?? 0;

  const totales = useMemo(() => {
    const suma = (e: EstadoPago) =>
      pagos
        .filter((p) => p.estado === e)
        .reduce((acc, p) => acc + Number(p.monto), 0);

    return {
      pendiente: suma('pendiente'),
      vencido: suma('vencido'),
      pagado: suma('pagado'),
    };
  }, [pagos]);

  const buscar = () => {
    setPagina(1);
    setBusquedaAplicada(busqueda.trim());
  };

  const nombrePaciente = (pago: Pago): string => {
    const persona = pago.paciente?.persona;

    if (persona?.nombre || persona?.apellido) {
      return `${persona.nombre ?? ''} ${persona.apellido ?? ''}`.trim();
    }

    return nombreDe(pago.paciente_id);
  };

  const confirmarEliminar = () => {
    if (!aEliminar) return;

    setErrorEliminar(null);

    eliminar.mutate(aEliminar.id, {
      onSuccess: () => {
        setAEliminar(null);

        if (pagos.length === 1 && pagina > 1) {
          setPagina((actual) => actual - 1);
        }
      },
      onError: (e) => setErrorEliminar(obtenerMensajeError(e)),
    });
  };

  const imprimirReporte = () => {
    if (pagos.length === 0) return;

    const filas = pagos.map((pago) => `
      <tr>
        <td>${pago.id}</td>
        <td>${escaparHtml(formatPeriodo(pago.periodo))}</td>
        <td>${escaparHtml(nombrePaciente(pago))}</td>
        <td>${escaparHtml(formatMoneda(pago.monto))}</td>
        <td>${escaparHtml(ETIQUETA_ESTADO_PAGO[pago.estado])}</td>
        <td>${escaparHtml(pago.medio_pago ? ETIQUETA_MEDIO_PAGO[pago.medio_pago] : '—')}</td>
        <td>${escaparHtml(pago.fecha_pago ? formatFecha(pago.fecha_pago) : '—')}</td>
      </tr>
    `).join('');

    const ventana = window.open('', '_blank', 'width=1000,height=700');

    if (!ventana) {
      window.alert(
        'El navegador bloqueó la ventana del reporte. Permití las ventanas emergentes e intentá nuevamente.',
      );
      return;
    }

    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Reporte de pagos</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 32px;
              color: #222;
            }
            h1 {
              font-size: 22px;
              margin-bottom: 8px;
            }
            p {
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 24px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
            th {
              background: #eee;
            }
            @media print {
              body {
                margin: 15mm;
              }
            }
          </style>
        </head>
        <body>
          <h1>Reporte de pagos</h1>
          <p>Registros incluidos: ${pagos.length}</p>
          <p>Fecha de generación: ${new Date().toLocaleString('es-AR')}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Período</th>
                <th>Paciente</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Medio</th>
                <th>Fecha de pago</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
        </body>
      </html>
    `);

    ventana.document.close();
    ventana.focus();
    ventana.print();
  };

  return (
    <>
      <PageHeader
        titulo="Pagos"
        descripcion="Seguimiento mensual de cobros por paciente."
        accion={
          puedeEditar
            ? <Link className="btn btn-primario" to="/pagos/nuevo">Nuevo pago</Link>
            : undefined
        }
      />

      <dl className="resumen">
        <div>
          <dt>Pendiente en esta página</dt>
          <dd>{formatMoneda(totales.pendiente)}</dd>
        </div>
        <div>
          <dt>Vencido en esta página</dt>
          <dd>{formatMoneda(totales.vencido)}</dd>
        </div>
        <div>
          <dt>Cobrado en esta página</dt>
          <dd>{formatMoneda(totales.pagado)}</dd>
        </div>
      </dl>

      <div className="panel">
        <div className="filtros">
          <div className="campo">
            <label htmlFor="buscar-pago">Buscar por paciente, DNI u observaciones</label>
            <input
              id="buscar-pago"
              value={busqueda}
              placeholder="Nombre, apellido, DNI..."
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') buscar();
              }}
            />
          </div>

          <div className="campo">
            <label htmlFor="estado-pago">Estado</label>
            <select
              id="estado-pago"
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value as FiltroEstado);
                setPagina(1);
              }}
            >
              <option value="">Todos</option>
              {ESTADOS_PAGO.map((e) => (
                <option key={e} value={e}>
                  {ETIQUETA_ESTADO_PAGO[e]}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="medio-pago">Medio de pago</label>
            <select
              id="medio-pago"
              value={medioPago}
              onChange={(e) => {
                setMedioPago(e.target.value as FiltroMedio);
                setPagina(1);
              }}
            >
              <option value="">Todos</option>
              {MEDIOS_PAGO.map((medio) => (
                <option key={medio} value={medio}>
                  {ETIQUETA_MEDIO_PAGO[medio]}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="periodo-desde">Período desde</label>
            <input
              id="periodo-desde"
              type="date"
              value={periodoDesde}
              onChange={(e) => {
                setPeriodoDesde(e.target.value);
                setPagina(1);
              }}
            />
          </div>

          <div className="campo">
            <label htmlFor="periodo-hasta">Período hasta</label>
            <input
              id="periodo-hasta"
              type="date"
              value={periodoHasta}
              onChange={(e) => {
                setPeriodoHasta(e.target.value);
                setPagina(1);
              }}
            />
          </div>

          <div className="campo">
            <label aria-hidden="true">&nbsp;</label>
            <Button onClick={buscar}>Buscar</Button>
          </div>
        </div>

        <div className="acciones-listado">
          <Button variante="secundario" onClick={imprimirReporte} disabled={pagos.length === 0}>
            Imprimir / guardar PDF
          </Button>
        </div>

        <StateView
          cargando={isLoading}
          error={error}
          vacio={pagos.length === 0}
          textoVacio="No hay pagos para mostrar con estos filtros."
        >
          <DataTable
            filas={pagos}
            clave={(p) => p.id}
            columnas={[
              { titulo: 'Período', render: (p) => formatPeriodo(p.periodo) },
              { titulo: 'Paciente', render: (p) => nombrePaciente(p) },
              { titulo: 'Monto', render: (p) => formatMoneda(p.monto) },
              {
                titulo: 'Estado',
                render: (p) => (
                  <Badge tono={TONO_ESTADO_PAGO[p.estado]}>
                    {ETIQUETA_ESTADO_PAGO[p.estado]}
                  </Badge>
                ),
              },
              {
                titulo: 'Medio',
                render: (p) => p.medio_pago ? ETIQUETA_MEDIO_PAGO[p.medio_pago] : '—',
              },
              { titulo: 'Fecha de pago', render: (p) => formatFecha(p.fecha_pago) },
            ]}
            acciones={(p) => (
              <>
                <Link className="btn btn-texto btn-chico" to={`/pagos/${p.id}`}>
                  Ver ficha
                </Link>

                {puedeEditar && (
                  <>
                    {p.estado !== 'pagado' && (
                      <Button
                        variante="texto"
                        chico
                        onClick={() => {
                          setErrorCobro(null);
                          setACobrar(p);
                        }}
                      >
                        Registrar cobro
                      </Button>
                    )}

                    <Link className="btn btn-texto btn-chico" to={`/pagos/${p.id}/editar`}>
                      Editar
                    </Link>
                  </>
                )}

                {puedeEliminar && (
                  <Button variante="texto" chico onClick={() => setAEliminar(p)}>
                    Eliminar
                  </Button>
                )}
              </>
            )}
          />
        </StateView>

        {total > 0 && (
          <div className="paginacion">
            <span>
              Mostrando {pagos.length} de {total} pagos
              {' · '}
              Página {totalPaginas === 0 ? 0 : pagina} de {totalPaginas}
            </span>

            <div>
              <Button
                variante="secundario"
                chico
                disabled={pagina <= 1 || isLoading}
                onClick={() => setPagina((actual) => actual - 1)}
              >
                Anterior
              </Button>

              <Button
                variante="secundario"
                chico
                disabled={pagina >= totalPaginas || isLoading}
                onClick={() => setPagina((actual) => actual + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {puedeEditar && (
        <RegistrarCobroModal
          pago={aCobrar}
          nombrePaciente={aCobrar ? nombrePaciente(aCobrar) : ''}
          enviando={guardar.isPending}
          error={errorCobro}
          onCerrar={() => setACobrar(null)}
          onEnviar={({ medio_pago, fecha_pago }) => {
            if (!aCobrar) return;

            setErrorCobro(null);

            guardar.mutate(
              {
                id: aCobrar.id,
                datos: {
                  ...pagoAPayload(aCobrar),
                  estado: 'pagado',
                  medio_pago,
                  fecha_pago,
                },
              },
              {
                onSuccess: () => setACobrar(null),
                onError: (e) => setErrorCobro(obtenerMensajeError(e)),
              },
            );
          }}
        />
      )}

      <ConfirmDialog
        abierto={aEliminar !== null}
        titulo="Eliminar pago"
        mensaje={
          errorEliminar ??
          `¿Eliminar el pago de ${aEliminar ? nombrePaciente(aEliminar) : ''} (${aEliminar ? formatPeriodo(aEliminar.periodo) : ''})? Esta acción no se puede deshacer.`
        }
        cargando={eliminar.isPending}
        onConfirmar={confirmarEliminar}
        onCancelar={() => {
          setAEliminar(null);
          setErrorEliminar(null);
        }}
      />
    </>
  );
}
