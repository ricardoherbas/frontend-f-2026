import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { tieneRol } from '@/core/permissions/roles';
import { obtenerMensajeError } from '@/core/api/errors';
import { DIAS_SEMANA } from '@/core/types/dia-semana.type';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import {
  useEliminarTurno,
  useTurnosPaginado,
} from '../hooks/useTurnos';
import { etiquetaTurno, hhmm } from '../adapters/turno.adapter';
import { TurnoFormModal } from '../components/TurnoFormModal';
import type { Turno } from '../interfaces/turno.interface';

const LIMITE_POR_PAGINA = 10;

type EstadoFiltro = 'todos' | 'true' | 'false';

const escaparHtml = (valor: string): string =>
  valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export default function TurnosPage() {
  const navigate = useNavigate();
  const { rol } = useAuth();

  // Permisos: admin y secretaria pueden crear/editar;
  // solamente admin puede eliminar.
  const puedeEditar = tieneRol(rol, ['administrador', 'secretaria']);
  const puedeEliminar = tieneRol(rol, ['administrador']);

  const eliminar = useEliminarTurno();

  const [busqueda, setBusqueda] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');
  const [diaFiltro, setDiaFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('todos');
  const [pagina, setPagina] = useState(1);

  // null = modal cerrado · { turno: null } = alta · { turno } = edición
  const [formulario, setFormulario] = useState<{ turno: Turno | null } | null>(null);
  const [aEliminar, setAEliminar] = useState<Turno | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const filtros = {
    page: pagina,
    limit: LIMITE_POR_PAGINA,
    search: busquedaAplicada || undefined,
    dia_semana: diaFiltro || undefined,
    activo: estadoFiltro === 'todos' ? undefined : estadoFiltro === 'true',
    sortBy: 'hora_inicio',
    order: 'ASC' as const,
  };

  const { data, isLoading, error } = useTurnosPaginado(filtros);

  const turnos = data?.datos ?? [];
  const total = data?.paginacion.total ?? 0;
  const totalPaginas = data?.paginacion.totalPaginas ?? 0;

  const buscar = () => {
    setPagina(1);
    setBusquedaAplicada(busqueda.trim());
  };

  const confirmarEliminar = () => {
    if (!aEliminar) return;

    setErrorEliminar(null);

    eliminar.mutate(aEliminar.id, {
      onSuccess: () => {
        setAEliminar(null);

        // Si se elimina el único registro de la última página,
        // retrocedemos para evitar una página vacía.
        if (turnos.length === 1 && pagina > 1) {
          setPagina((actual) => actual - 1);
        }
      },
      onError: (e) => setErrorEliminar(obtenerMensajeError(e)),
    });
  };

  const imprimirReporte = () => {
    if (turnos.length === 0) return;

    const filas = turnos.map((turno) => `
      <tr>
        <td>${turno.id}</td>
        <td>${escaparHtml(turno.dia_semana)}</td>
        <td>${escaparHtml(hhmm(turno.hora_inicio))}</td>
        <td>${escaparHtml(hhmm(turno.hora_fin))}</td>
        <td>${turno.activo ? 'Activo' : 'Inactivo'}</td>
      </tr>
    `).join('');

    const ventana = window.open('', '_blank', 'width=900,height=700');

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
          <title>Reporte de turnos</title>
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
              padding: 9px;
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
          <h1>Reporte de turnos</h1>
          <p>Registros incluidos: ${turnos.length}</p>
          <p>Fecha de generación: ${new Date().toLocaleString('es-AR')}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Día</th>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Estado</th>
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
        titulo="Turnos"
        descripcion="Franjas horarias de atención."
        accion={
          puedeEditar
            ? <Button onClick={() => setFormulario({ turno: null })}>Nuevo turno</Button>
            : undefined
        }
      />

      <div className="panel">
        <div className="filtros">
          <div className="campo">
            <label htmlFor="buscar-turno">Buscar por día u horario</label>
            <input
              id="buscar-turno"
              value={busqueda}
              placeholder="Ej.: lunes o 08:00"
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') buscar();
              }}
            />
          </div>

          <div className="campo">
            <label htmlFor="filtrar-dia-turno">Día de la semana</label>
            <select
              id="filtrar-dia-turno"
              value={diaFiltro}
              onChange={(e) => {
                setDiaFiltro(e.target.value);
                setPagina(1);
              }}
            >
              <option value="">Todos los días</option>
              {DIAS_SEMANA.map((dia) => (
                <option key={dia} value={dia}>{dia}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="filtrar-estado-turno">Estado</label>
            <select
              id="filtrar-estado-turno"
              value={estadoFiltro}
              onChange={(e) => {
                setEstadoFiltro(e.target.value as EstadoFiltro);
                setPagina(1);
              }}
            >
              <option value="todos">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <Button variante="secundario" onClick={buscar}>
            Buscar
          </Button>
        </div>

        <div className="acciones-listado">
          <p>
            {isLoading
              ? 'Cargando turnos…'
              : `Se encontraron ${total} turno${total === 1 ? '' : 's'}.`}
          </p>

          <Button
            variante="secundario"
            chico
            disabled={isLoading || turnos.length === 0}
            onClick={imprimirReporte}
          >
            Imprimir / guardar PDF
          </Button>
        </div>

        <StateView
          cargando={isLoading}
          error={error}
          vacio={!isLoading && turnos.length === 0}
          textoVacio={
            busquedaAplicada || diaFiltro || estadoFiltro !== 'todos'
              ? 'No hay turnos que coincidan con los filtros aplicados.'
              : 'Todavía no hay turnos cargados.'
          }
        >
          <DataTable
            filas={turnos}
            clave={(t) => t.id}
            columnas={[
              { titulo: 'Día', render: (t) => t.dia_semana },
              { titulo: 'Desde', render: (t) => hhmm(t.hora_inicio) },
              { titulo: 'Hasta', render: (t) => hhmm(t.hora_fin) },
              {
                titulo: 'Estado',
                render: (t) => (
                  <Badge tono={t.activo ? 'ok' : 'neutro'}>
                    {t.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                ),
              },
            ]}
            acciones={(t) => (
              <>
                <Button
                  variante="texto"
                  chico
                  onClick={() => navigate(`/turnos/${t.id}`)}
                >
                  Ver ficha
                </Button>

                {puedeEditar && (
                  <Button
                    variante="texto"
                    chico
                    onClick={() => setFormulario({ turno: t })}
                  >
                    Editar
                  </Button>
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

        {totalPaginas > 1 && (
          <div className="paginacion">
            <Button
              variante="secundario"
              chico
              disabled={pagina <= 1 || isLoading}
              onClick={() => setPagina((actual) => actual - 1)}
            >
              Anterior
            </Button>

            <span>
              Página {pagina} de {totalPaginas}
            </span>

            <Button
              variante="secundario"
              chico
              disabled={pagina >= totalPaginas || isLoading}
              onClick={() => setPagina((actual) => actual + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      {puedeEditar && (
        <TurnoFormModal
          abierto={formulario !== null}
          turno={formulario?.turno ?? null}
          onCerrar={() => setFormulario(null)}
        />
      )}

      <ConfirmDialog
        abierto={aEliminar !== null}
        titulo="Eliminar turno"
        mensaje={
          errorEliminar ??
          `¿Eliminar el turno ${aEliminar ? etiquetaTurno(aEliminar) : ''}? Esta acción no se puede deshacer.`
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
