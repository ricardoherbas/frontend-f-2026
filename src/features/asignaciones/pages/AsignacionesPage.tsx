import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { tieneRol } from '@/core/permissions/roles';
import { obtenerMensajeError } from '@/core/api/errors';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { etiquetaTurno } from '@/features/turnos/adapters/turno.adapter';
import {
  useAsignacionesPaginadas,
  useEliminarAsignacion,
} from '../hooks/useAsignaciones';
import { useNombres } from '../hooks/useNombres';
import { etiquetaAsignacion } from '../adapters/asignacion.adapter';
import { AsignacionFormModal } from '../components/AsignacionFormModal';
import type { Asignacion } from '../interfaces/asignacion.interface';

const LIMITE = 10;

function escaparHtml(valor: string): string {
  return valor
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export default function AsignacionesPage() {
  const navigate = useNavigate();
  const { rol } = useAuth();

  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todos');

  const filtros = {
    page: pagina,
    limit: LIMITE,
    search: busqueda.trim() || undefined,
    activo: filtroActivo === 'todos' ? undefined : filtroActivo === 'true',
  };

  const { data, isLoading, error } = useAsignacionesPaginadas(filtros);
  const nombres = useNombres();
  const eliminar = useEliminarAsignacion();

  const puedeEditar = tieneRol(rol, ['administrador', 'secretaria']);
  const puedeEliminar = tieneRol(rol, ['administrador']);

  const [formulario, setFormulario] = useState<{
    asignacion: Asignacion | null;
  } | null>(null);
  const [aEliminar, setAEliminar] = useState<Asignacion | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const asignaciones = data?.datos ?? [];
  const total = data?.paginacion.total ?? 0;
  const totalPaginas = Math.max(data?.paginacion.totalPaginas ?? 1, 1);

  const confirmarEliminar = () => {
    if (!aEliminar) return;

    setErrorEliminar(null);

    eliminar.mutate(aEliminar.id, {
      onSuccess: () => {
        setAEliminar(null);

        if (asignaciones.length === 1 && pagina > 1) {
          setPagina((actual) => actual - 1);
        }
      },
      onError: (e) => setErrorEliminar(obtenerMensajeError(e)),
    });
  };

  const imprimirReporte = () => {
    const filas = asignaciones
      .map((asignacion) => {
        const paciente = nombres.paciente(
          asignacion.paciente_id,
          asignacion.paciente?.persona,
        );
        const cuidadora = nombres.cuidadora(
          asignacion.cuidador_id,
          asignacion.cuidadora?.persona,
        );
        const turno = asignacion.turno
          ? etiquetaTurno(asignacion.turno)
          : `Turno #${asignacion.turno_id}`;

        return `
          <tr>
            <td>${escaparHtml(paciente)}</td>
            <td>${escaparHtml(cuidadora)}</td>
            <td>${escaparHtml(turno)}</td>
            <td>${asignacion.activo ? 'Activa' : 'Inactiva'}</td>
            <td>${asignacion.id}</td>
          </tr>
        `;
      })
      .join('');

    const ventana = window.open('', '_blank', 'width=1000,height=700');

    if (!ventana) return;

    ventana.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Reporte de asignaciones</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
            h1 { margin-bottom: 8px; }
            p { color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { border: 1px solid #ccc; padding: 9px; text-align: left; }
            th { background: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Reporte de asignaciones</h1>
          <p>Registros de la página ${pagina}. Total de asignaciones: ${total}.</p>
          <table>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Cuidadora</th>
                <th>Turno</th>
                <th>Estado</th>
                <th>ID</th>
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
        titulo="Asignaciones"
        descripcion="Qué cuidadora atiende a qué paciente en cada turno."
        accion={
          puedeEditar ? (
            <Button onClick={() => setFormulario({ asignacion: null })}>
              Nueva asignación
            </Button>
          ) : undefined
        }
      />

      <div className="panel">
        <div className="filtros">
          <label className="campo">
            Buscar por paciente, cuidadora o DNI
            <input
              type="search"
              value={busqueda}
              placeholder="Nombre, apellido o DNI..."
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </label>

          <label className="campo">
            Estado
            <select
              value={filtroActivo}
              onChange={(e) => {
                setFiltroActivo(e.target.value);
                setPagina(1);
              }}
            >
              <option value="todos">Todos</option>
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
          </label>

          <Button variante="secundario" onClick={imprimirReporte}>
            Imprimir / PDF
          </Button>
        </div>

        <p>
          Se encontraron <strong>{total}</strong> asignaciones.
        </p>

        <StateView
          cargando={isLoading}
          error={error}
          vacio={!!data && asignaciones.length === 0}
          textoVacio="No se encontraron asignaciones con los filtros indicados."
        >
          <DataTable
            filas={asignaciones}
            clave={(a) => a.id}
            columnas={[
              {
                titulo: 'Paciente',
                render: (a) =>
                  nombres.paciente(a.paciente_id, a.paciente?.persona),
              },
              {
                titulo: 'Cuidadora',
                render: (a) =>
                  nombres.cuidadora(a.cuidador_id, a.cuidadora?.persona),
              },
              {
                titulo: 'Turno',
                render: (a) =>
                  a.turno ? etiquetaTurno(a.turno) : `Turno #${a.turno_id}`,
              },
              {
                titulo: 'Estado',
                render: (a) => (
                  <Badge tono={a.activo ? 'ok' : 'neutro'}>
                    {a.activo ? 'Activa' : 'Inactiva'}
                  </Badge>
                ),
              },
            ]}
            acciones={(a) => (
              <>
                <Button
                  variante="texto"
                  chico
                  onClick={() => navigate(`/asignaciones/${a.id}`)}
                >
                  Ver ficha
                </Button>

                {puedeEditar && (
                  <Button
                    variante="texto"
                    chico
                    onClick={() => setFormulario({ asignacion: a })}
                  >
                    Editar
                  </Button>
                )}

                {puedeEliminar && (
                  <Button
                    variante="texto"
                    chico
                    onClick={() => setAEliminar(a)}
                  >
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
              Página {pagina} de {totalPaginas}
            </span>

            <div>
              <Button
                variante="secundario"
                chico
                disabled={pagina <= 1}
                onClick={() => setPagina((actual) => actual - 1)}
              >
                Anterior
              </Button>

              <Button
                variante="secundario"
                chico
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina((actual) => actual + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {puedeEditar && (
        <AsignacionFormModal
          abierto={formulario !== null}
          asignacion={formulario?.asignacion ?? null}
          onCerrar={() => setFormulario(null)}
        />
      )}

      <ConfirmDialog
        abierto={aEliminar !== null}
        titulo="Eliminar asignación"
        mensaje={
          errorEliminar ??
          `¿Eliminar la asignación ${
            aEliminar ? etiquetaAsignacion(aEliminar, nombres) : ''
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