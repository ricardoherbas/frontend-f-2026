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
import { formatFecha } from '@/shared/utils/formatFecha';
import {
  usePacientesPaginado,
  useEliminarPaciente,
} from '../hooks/usePacientes';
import { nombreCompleto } from '../adapters/paciente.adapter';
import type { Paciente } from '../interfaces/paciente.interface';

const LIMITE_POR_PAGINA = 10;

const escaparHtml = (valor: string): string =>
  valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export default function PacientesPage() {
  const { rol } = useAuth();

  // El backend solo permite crear y editar a administrador y secretaria.
  const puedeEditar = tieneRol(rol, ['administrador', 'secretaria']);

  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [obraSocial, setObraSocial] = useState('');
  const [activo, setActivo] = useState('');

  const filtros = {
    page: pagina,
    limit: LIMITE_POR_PAGINA,
    search: busqueda.trim() || undefined,
    obra_social: obraSocial.trim() || undefined,
    activo: activo === '' ? undefined : activo === 'true',
    sortBy: 'creado_en',
    order: 'DESC' as const,
  };

  const { data, isLoading, error } = usePacientesPaginado(filtros);
  const eliminar = useEliminarPaciente();

  const [aEliminar, setAEliminar] = useState<Paciente | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const pacientes = data?.datos ?? [];
  const paginacion = data?.paginacion;

  const confirmarEliminar = () => {
    if (!aEliminar) return;

    setErrorEliminar(null);

    eliminar.mutate(aEliminar.id, {
      onSuccess: () => setAEliminar(null),
      onError: (e) => setErrorEliminar(obtenerMensajeError(e)),
    });
  };

  const cambiarPagina = (nuevaPagina: number) => {
    if (!paginacion) return;

    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPaginas) {
      setPagina(nuevaPagina);
    }
  };

  const imprimirReporte = () => {
    if (pacientes.length === 0) return;

    const filas = pacientes.map((paciente) => `
      <tr>
        <td>${paciente.id}</td>
        <td>${escaparHtml(nombreCompleto(paciente))}</td>
        <td>${escaparHtml(paciente.persona?.dni ?? '—')}</td>
        <td>${escaparHtml(paciente.persona?.telefono ?? '—')}</td>
        <td>${escaparHtml(formatFecha(paciente.persona?.fecha_nacimiento))}</td>
        <td>${escaparHtml(paciente.direccion ?? '—')}</td>
        <td>${escaparHtml(paciente.obra_social ?? '—')}</td>
        <td>${escaparHtml(paciente.observaciones ?? '—')}</td>
        <td>${paciente.activo ? 'Activo' : 'Inactivo'}</td>
      </tr>
    `).join('');

    const ventana = window.open('', '_blank', 'width=1100,height=750');

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
          <title>Reporte de pacientes</title>
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
              font-size: 11px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 7px;
              text-align: left;
              overflow-wrap: anywhere;
            }
            th {
              background: #eee;
            }
            @media print {
              body {
                margin: 10mm;
              }
              thead {
                display: table-header-group;
              }
              tr {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <h1>Reporte de pacientes</h1>
          <p>Registros incluidos en esta página: ${pacientes.length}</p>
          <p>Total de pacientes encontrados: ${paginacion?.total ?? pacientes.length}</p>
          <p>Página: ${pagina}</p>
          <p>Fecha de generación: ${new Date().toLocaleString('es-AR')}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Fecha de nacimiento</th>
                <th>Dirección</th>
                <th>Obra social</th>
                <th>Observaciones</th>
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
        titulo="Pacientes"
        descripcion="Fichas de las personas que reciben cuidados."
        accion={
          puedeEditar ? (
            <Link className="btn btn-primario" to="/pacientes/nuevo">
              Nuevo paciente
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
          <div className="campo" style={{ flex: '1 1 220px' }}>
            <label htmlFor="buscar">Buscar por nombre o DNI</label>
            <input
              id="buscar"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Nombre, apellido o DNI"
            />
          </div>

          <div className="campo" style={{ flex: '1 1 180px' }}>
            <label htmlFor="obra-social">Obra social</label>
            <input
              id="obra-social"
              value={obraSocial}
              onChange={(e) => {
                setObraSocial(e.target.value);
                setPagina(1);
              }}
              placeholder="Filtrar por obra social"
            />
          </div>

          <div className="campo" style={{ flex: '0 1 160px' }}>
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              value={activo}
              onChange={(e) => {
                setActivo(e.target.value);
                setPagina(1);
              }}
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>

        <div className="acciones-listado">
          <p>
            {isLoading
              ? 'Cargando pacientes…'
              : `Se encontraron ${paginacion?.total ?? 0} pacientes.`}
          </p>

          <Button
            variante="secundario"
            chico
            disabled={isLoading || pacientes.length === 0}
            onClick={imprimirReporte}
          >
            Imprimir / guardar PDF
          </Button>
        </div>

        <StateView
          cargando={isLoading}
          error={error}
          vacio={pacientes.length === 0}
          textoVacio="No hay pacientes para mostrar."
        >
          <DataTable
            filas={pacientes}
            clave={(p) => p.id}
            columnas={[
              { titulo: 'Paciente', render: nombreCompleto },
              { titulo: 'DNI', render: (p) => p.persona?.dni ?? '—' },
              { titulo: 'Obra social', render: (p) => p.obra_social ?? '—' },
              {
                titulo: 'Estado',
                render: (p) => (
                  <Badge tono={p.activo ? 'ok' : 'neutro'}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                ),
              },
            ]}
            acciones={(p) => (
              <>
                <Link
                  className="btn btn-texto btn-chico"
                  to={`/pacientes/${p.id}`}
                >
                  Ver ficha
                </Link>

                {puedeEditar && (
                  <Link
                    className="btn btn-texto btn-chico"
                    to={`/pacientes/${p.id}/editar`}
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
              Mostrando {pacientes.length} de {paginacion.total} pacientes
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
        titulo="Eliminar paciente"
        mensaje={
          errorEliminar ??
          `¿Eliminar a ${aEliminar ? nombreCompleto(aEliminar) : ''}? Esta acción no se puede deshacer.`
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
