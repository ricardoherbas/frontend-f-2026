import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { tieneRol } from '@/core/permissions/roles';
import { obtenerMensajeError } from '@/core/api/errors';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Button } from '@/shared/components/ui/Button';
import { formatFecha } from '@/shared/utils/formatFecha';
import { useNombres } from '@/features/asignaciones/hooks/useNombres';
import {
  useEliminarParteDiario,
  usePartesDiariosPaginado,
} from '../hooks/usePartesDiarios';
import type { ParteDiario } from '../interfaces/parteDiario.interface';

const LIMITE_POR_PAGINA = 10;

const nombrePersona = (
  persona?: { nombre: string; apellido: string } | null,
): string | null =>
  persona ? `${persona.apellido}, ${persona.nombre}` : null;

const escaparHtml = (valor: unknown): string =>
  String(valor ?? '—').replace(/[&<>"']/g, (caracter) => {
    const entidades: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entidades[caracter];
  });

export default function PartesDiariosPage() {
  const { rol } = useAuth();
  const puedeEscribir = tieneRol(rol, [
    'administrador',
    'secretaria',
    'cuidadora',
  ]);

  const nombres = useNombres();
  const eliminar = useEliminarParteDiario();

  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [animo, setAnimo] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [aEliminar, setAEliminar] = useState<ParteDiario | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const filtros = {
    page: pagina,
    limit: LIMITE_POR_PAGINA,
    search: busqueda.trim() || undefined,
    animo: animo.trim() || undefined,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
    sortBy: 'fecha',
    order: 'DESC' as const,
  };

  const { data, isLoading, error } = usePartesDiariosPaginado(filtros);

  const partes = data?.datos ?? [];
  const paginacion = data?.paginacion;

  const obtenerNombrePaciente = (parte: ParteDiario): string =>
    nombrePersona(parte.asignacion?.paciente?.persona) ??
    (parte.asignacion
      ? nombres.paciente(parte.asignacion.paciente_id)
      : `Asignación #${parte.asignacion_id}`);

  const obtenerNombreCuidadora = (parte: ParteDiario): string =>
    nombrePersona(parte.asignacion?.cuidadora?.persona) ??
    (parte.asignacion
      ? nombres.cuidadora(parte.asignacion.cuidador_id)
      : '—');

  const imprimirPartesDiarios = () => {
    if (partes.length === 0) return;

    const ventana = window.open('', '_blank');

    if (!ventana) {
      window.alert(
        'No se pudo abrir el reporte. Permití las ventanas emergentes para este sitio.',
      );
      return;
    }

    const filas = partes
      .map(
        (parte) => `
          <tr>
            <td>${escaparHtml(parte.id)}</td>
            <td>${escaparHtml(formatFecha(parte.fecha))}</td>
            <td>${escaparHtml(obtenerNombrePaciente(parte))}</td>
            <td>${escaparHtml(obtenerNombreCuidadora(parte))}</td>
            <td>${escaparHtml(parte.asignacion_id)}</td>
            <td>${escaparHtml(parte.animo)}</td>
            <td>${escaparHtml(parte.alimentacion)}</td>
            <td>${escaparHtml(parte.descanso)}</td>
            <td>${escaparHtml(parte.higiene)}</td>
            <td>${escaparHtml(parte.novedades)}</td>
            <td>${escaparHtml(parte.observaciones)}</td>
          </tr>
        `,
      )
      .join('');

    const fechaEmision = new Date().toLocaleString('es-AR');

    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Reporte de partes diarios</title>
          <style>
            @page {
              size: landscape;
              margin: 12mm;
            }

            body {
              font-family: Arial, sans-serif;
              color: #222;
              font-size: 10px;
            }

            h1 {
              font-size: 20px;
              margin-bottom: 6px;
            }

            .metadata {
              margin-bottom: 14px;
              color: #555;
              line-height: 1.6;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th, td {
              border: 1px solid #ccc;
              padding: 6px;
              text-align: left;
              vertical-align: top;
              overflow-wrap: anywhere;
            }

            th {
              background: #eee;
              font-weight: bold;
            }

            tr {
              page-break-inside: avoid;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <h1>Reporte de partes diarios</h1>

          <div class="metadata">
            <div>Fecha de emisión: ${escaparHtml(fechaEmision)}</div>
            <div>Registros incluidos: ${partes.length}</div>
            <div>Página del listado: ${pagina}</div>
            <div>
              Filtros:
              búsqueda "${escaparHtml(busqueda.trim() || 'Sin filtro')}",
              ánimo "${escaparHtml(animo.trim() || 'Sin filtro')}",
              desde "${escaparHtml(fechaDesde || 'Sin límite')}",
              hasta "${escaparHtml(fechaHasta || 'Sin límite')}"
            </div>
            <div>
              Total de registros encontrados: ${escaparHtml(paginacion?.total ?? partes.length)}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Cuidadora</th>
                <th>Asignación</th>
                <th>Ánimo</th>
                <th>Alimentación</th>
                <th>Descanso</th>
                <th>Higiene</th>
                <th>Novedades</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
            </tbody>
          </table>

          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    ventana.document.close();
  };

  const cambiarPagina = (nuevaPagina: number) => {
    if (
      paginacion &&
      nuevaPagina >= 1 &&
      nuevaPagina <= paginacion.totalPaginas
    ) {
      setPagina(nuevaPagina);
    }
  };

  const confirmarEliminar = () => {
    if (!aEliminar) return;

    setErrorEliminar(null);

    eliminar.mutate(aEliminar.id, {
      onSuccess: () => {
        setAEliminar(null);

        // Si eliminamos el único registro de una página, volvemos a la anterior.
        if (partes.length === 1 && pagina > 1) {
          setPagina((actual) => actual - 1);
        }
      },
      onError: (e) => setErrorEliminar(obtenerMensajeError(e)),
    });
  };

  return (
    <>
      <PageHeader
        titulo="Partes diarios"
        descripcion="Registro diario de cada paciente."
        accion={
          puedeEscribir ? (
            <Link className="btn btn-primario" to="/partes-diarios/nuevo">
              Nuevo parte
            </Link>
          ) : undefined
        }
      />

      <div className="panel">
        <div
          className="campo"
          style={{ maxWidth: '520px', marginBottom: '1rem' }}
        >
          <label htmlFor="buscar-parte">
            Buscar en los datos del parte diario
          </label>
          <input
            id="buscar-parte"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
            placeholder="Ánimo, alimentación, novedades, observaciones..."
          />
        </div>

        <div
          className="form-grid dos"
          style={{ marginBottom: '1rem' }}
        >
          <div className="campo">
            <label htmlFor="filtro-animo">Ánimo</label>
            <input
              id="filtro-animo"
              value={animo}
              onChange={(e) => {
                setAnimo(e.target.value);
                setPagina(1);
              }}
              placeholder="Filtrar por ánimo"
            />
          </div>

          <div className="campo">
            <label htmlFor="fecha-desde">Fecha desde</label>
            <input
              id="fecha-desde"
              type="date"
              value={fechaDesde}
              max={fechaHasta || undefined}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                setPagina(1);
              }}
            />
          </div>

          <div className="campo">
            <label htmlFor="fecha-hasta">Fecha hasta</label>
            <input
              id="fecha-hasta"
              type="date"
              value={fechaHasta}
              min={fechaDesde || undefined}
              onChange={(e) => {
                setFechaHasta(e.target.value);
                setPagina(1);
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          <Button
            variante="secundario"
            chico
            onClick={() => {
              setBusqueda('');
              setAnimo('');
              setFechaDesde('');
              setFechaHasta('');
              setPagina(1);
            }}
          >
            Limpiar filtros
          </Button>

          <Button
            variante="secundario"
            chico
            disabled={isLoading || partes.length === 0}
            onClick={imprimirPartesDiarios}
          >
            Exportar PDF
          </Button>
        </div>

        <StateView
          cargando={isLoading}
          error={error}
          vacio={partes.length === 0}
          textoVacio="No hay partes diarios para los filtros seleccionados."
        >
          <DataTable
            filas={partes}
            clave={(p) => p.id}
            columnas={[
              {
                titulo: 'Fecha',
                render: (p) => formatFecha(p.fecha),
              },
              {
                titulo: 'Paciente',
                render: (p) => obtenerNombrePaciente(p),
              },
              {
                titulo: 'Cuidadora',
                render: (p) => obtenerNombreCuidadora(p),
              },
              {
                titulo: 'Ánimo',
                render: (p) => p.animo ?? '—',
              },
              {
                titulo: 'Novedades',
                render: (p) => p.novedades ?? '—',
              },
            ]}
            acciones={(p) => (
              <>
                <Link
                  className="btn btn-secundario btn-chico"
                  to={`/partes-diarios/${p.id}`}
                >
                  Ver ficha
                </Link>

                {puedeEscribir && (
                  <Link
                    className="btn btn-texto btn-chico"
                    to={`/partes-diarios/${p.id}/editar`}
                  >
                    Editar
                  </Link>
                )}

                {tieneRol(rol, ['administrador']) && (
                  <Button
                    variante="texto"
                    chico
                    onClick={() => setAEliminar(p)}
                  >
                    Eliminar
                  </Button>
                )}
              </>
            )}
          />
        </StateView>

        {paginacion && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <span>
              Mostrando {partes.length} de {paginacion.total} partes diarios
              {' · '}
              Página {paginacion.totalPaginas === 0 ? 0 : pagina} de{' '}
              {paginacion.totalPaginas}
            </span>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variante="secundario"
                chico
                disabled={pagina <= 1 || isLoading}
                onClick={() => cambiarPagina(pagina - 1)}
              >
                Anterior
              </Button>

              <Button
                variante="secundario"
                chico
                disabled={
                  !paginacion.totalPaginas ||
                  pagina >= paginacion.totalPaginas ||
                  isLoading
                }
                onClick={() => cambiarPagina(pagina + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        abierto={aEliminar !== null}
        titulo="Eliminar parte diario"
        mensaje={
          errorEliminar ??
          `¿Eliminar el parte del ${
            aEliminar ? formatFecha(aEliminar.fecha) : ''
          }? Esta acción no se puede deshacer.`
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
