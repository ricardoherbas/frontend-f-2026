import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { tieneRol } from '@/core/permissions/roles';
import { obtenerMensajeError } from '@/core/api/errors';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import {
  useEliminarTratamiento,
  useTratamientosPaginado,
} from '../hooks/useTratamientos';
import { textoVigencia } from '../adapters/tratamiento.adapter';
import type { Tratamiento } from '../interfaces/tratamiento.interface';

type FiltroEstado = 'todos' | 'activos' | 'finalizados';

const LIMITE_POR_PAGINA = 10;

function escaparHtml(valor: string | number): string {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return '—';

  const valor = new Date(`${fecha.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(valor.getTime())) return fecha;

  return valor.toLocaleDateString('es-AR');
}

function obtenerNombrePaciente(tratamiento: Tratamiento): string {
  const persona = tratamiento.paciente?.persona;

  return persona
    ? `${persona.apellido}, ${persona.nombre}`
    : `Paciente #${tratamiento.paciente_id}`;
}

function obtenerNombreMedicamento(tratamiento: Tratamiento): string {
  const medicamento = tratamiento.medicamento;

  return medicamento
    ? `${medicamento.nombre} · ${medicamento.presentacion}`
    : `Medicamento #${tratamiento.medicamento_id}`;
}

function imprimirTratamientos(
  tratamientos: Tratamiento[],
  pagina: number,
  total: number,
) {
  const ventana = window.open('', '_blank');

  if (!ventana) {
    window.alert(
      'No se pudo abrir la ventana del reporte. Permití las ventanas emergentes para este sitio e intentá nuevamente.',
    );
    return;
  }

  const filas = tratamientos
    .map(
      (tratamiento) => `
        <tr>
          <td>${escaparHtml(tratamiento.id)}</td>
          <td>${escaparHtml(obtenerNombrePaciente(tratamiento))}</td>
          <td>${escaparHtml(tratamiento.paciente_id)}</td>
          <td>${escaparHtml(tratamiento.paciente?.persona?.dni ?? '—')}</td>
          <td>${escaparHtml(obtenerNombreMedicamento(tratamiento))}</td>
          <td>${escaparHtml(tratamiento.medicamento_id)}</td>
          <td>${escaparHtml(tratamiento.dosis)}</td>
          <td>${escaparHtml(tratamiento.frecuencia)}</td>
          <td>${escaparHtml(tratamiento.horario ?? '—')}</td>
          <td>${escaparHtml(formatearFecha(tratamiento.desde))}</td>
          <td>${escaparHtml(formatearFecha(tratamiento.hasta))}</td>
          <td>${escaparHtml(textoVigencia(tratamiento))}</td>
          <td>${tratamiento.activa ? 'En curso' : 'Finalizado'}</td>
        </tr>
      `,
    )
    .join('');

  const fecha = new Date().toLocaleString('es-AR');

  ventana.document.open();
  ventana.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de tratamientos</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            color: #222;
            margin: 24px;
          }

          h1 {
            margin-bottom: 8px;
          }

          .informacion {
            margin-bottom: 20px;
            color: #555;
            font-size: 13px;
          }

          .tabla-contenedor {
            overflow-x: auto;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }

          th,
          td {
            border: 1px solid #ccc;
            padding: 7px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #f0f0f0;
          }

          @media print {
            body {
              margin: 10mm;
            }

            tr {
              page-break-inside: avoid;
            }

            @page {
              size: landscape;
            }
          }
        </style>
      </head>
      <body onload="window.print()">
        <h1>Reporte de tratamientos</h1>

        <div class="informacion">
          <p>Fecha de emisión: ${escaparHtml(fecha)}</p>
          <p>Registros incluidos: ${tratamientos.length}</p>
          <p>Total de tratamientos encontrados: ${total}</p>
          <p>Página: ${pagina}</p>
        </div>

        <div class="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>ID paciente</th>
                <th>DNI paciente</th>
                <th>Medicamento</th>
                <th>ID medicamento</th>
                <th>Dosis</th>
                <th>Frecuencia</th>
                <th>Horario</th>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Vigencia</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `);
  ventana.document.close();
}

export default function TratamientosPage() {
  const { rol } = useAuth();
  const puedeEditar = tieneRol(rol, ['administrador', 'secretaria']);
  const puedeEliminar = tieneRol(rol, ['administrador']);

  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState<FiltroEstado>('todos');
  const [aEliminar, setAEliminar] = useState<Tratamiento | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const filtros = {
    page: pagina,
    limit: LIMITE_POR_PAGINA,
    search: busqueda.trim() || undefined,
    activa: estado === 'todos' ? undefined : estado === 'activos',
    sortBy: 'id',
    order: 'ASC' as const,
  };

  const { data, isLoading, error } = useTratamientosPaginado(filtros);
  const eliminar = useEliminarTratamiento();

  const tratamientos = data?.datos ?? [];
  const paginacion = data?.paginacion;

  const confirmarEliminar = () => {
    if (!aEliminar) return;

    setErrorEliminar(null);

    eliminar.mutate(aEliminar.id, {
      onSuccess: () => {
        setAEliminar(null);

        if (tratamientos.length === 1 && pagina > 1) {
          setPagina((actual) => actual - 1);
        }
      },
      onError: (e) => setErrorEliminar(obtenerMensajeError(e)),
    });
  };

  const cambiarPagina = (nuevaPagina: number) => {
    if (!paginacion) return;

    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPaginas) {
      setPagina(nuevaPagina);
    }
  };

  return (
    <>
      <PageHeader
        titulo="Tratamientos"
        descripcion="Medicación indicada a cada paciente."
        accion={
          puedeEditar ? (
            <Link className="btn btn-primario" to="/tratamientos/nuevo">
              Nuevo tratamiento
            </Link>
          ) : undefined
        }
      />

      <div className="panel">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'end',
            marginBottom: '1rem',
          }}
        >
          <div className="campo" style={{ flex: '1 1 240px' }}>
            <label htmlFor="buscar-trat">
              Buscar por paciente, DNI, medicamento o indicación
            </label>
            <input
              id="buscar-trat"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Nombre, DNI, medicamento, dosis..."
            />
          </div>

          <div className="campo" style={{ flex: '0 1 180px' }}>
            <label htmlFor="estado-trat">Estado</label>
            <select
              id="estado-trat"
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value as FiltroEstado);
                setPagina(1);
              }}
            >
              <option value="todos">Todos</option>
              <option value="activos">En curso</option>
              <option value="finalizados">Finalizados</option>
            </select>
          </div>

          <Button
            variante="secundario"
            disabled={isLoading || tratamientos.length === 0}
            onClick={() =>
              imprimirTratamientos(
                tratamientos,
                pagina,
                paginacion?.total ?? tratamientos.length,
              )
            }
          >
            Imprimir / guardar PDF
          </Button>
        </div>

        <StateView
          cargando={isLoading}
          error={error}
          vacio={!isLoading && tratamientos.length === 0}
          textoVacio="No hay tratamientos para mostrar con estos filtros."
        >
          <DataTable
            filas={tratamientos}
            clave={(t) => t.id}
            columnas={[
              {
                titulo: 'Paciente',
                render: (t) => obtenerNombrePaciente(t),
              },
              {
                titulo: 'Medicamento',
                render: (t) => obtenerNombreMedicamento(t),
              },
              { titulo: 'Dosis', render: (t) => t.dosis },
              { titulo: 'Frecuencia', render: (t) => t.frecuencia },
              { titulo: 'Horario', render: (t) => t.horario ?? '—' },
              { titulo: 'Vigencia', render: (t) => textoVigencia(t) },
              {
                titulo: 'Estado',
                render: (t) => (
                  <Badge tono={t.activa ? 'ok' : 'neutro'}>
                    {t.activa ? 'En curso' : 'Finalizado'}
                  </Badge>
                ),
              },
            ]}
            acciones={(t) => (
              <>
                <Link
                  className="btn btn-texto btn-chico"
                  to={`/tratamientos/${t.id}`}
                >
                  Ver ficha
                </Link>

                {puedeEditar && (
                  <Link
                    className="btn btn-texto btn-chico"
                    to={`/tratamientos/${t.id}/editar`}
                  >
                    Editar
                  </Link>
                )}

                {puedeEliminar && (
                  <Button
                    variante="texto"
                    chico
                    onClick={() => setAEliminar(t)}
                  >
                    Eliminar
                  </Button>
                )}
              </>
            )}
          />
        </StateView>

        {paginacion && paginacion.total > 0 && (
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
              Mostrando {tratamientos.length} de {paginacion.total} tratamientos
              {' · '}
              Página {paginacion.pagina} de {paginacion.totalPaginas}
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
                disabled={pagina >= paginacion.totalPaginas || isLoading}
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
        titulo="Eliminar tratamiento"
        mensaje={
          errorEliminar ??
          `¿Eliminar el tratamiento de ${
            aEliminar?.paciente?.persona
              ? `${aEliminar.paciente.persona.nombre} ${aEliminar.paciente.persona.apellido}`
              : `Paciente #${aEliminar?.paciente_id ?? ''}`
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
