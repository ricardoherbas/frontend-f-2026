import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { tieneRol } from '@/core/permissions/roles';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { DataTable } from '@/shared/components/DataTable';
import { Button } from '@/shared/components/ui/Button';
import { AltaPersonaModal } from '@/features/personas/components/AltaPersonaModal';
import { formatFecha } from '@/shared/utils/formatFecha';
import { cuidadoraService } from '../services/cuidadora.service';
import { useCuidadorasPaginado } from '../hooks/useCuidadoras';

const LIMITE_POR_PAGINA = 10;

const escaparHtml = (valor: string): string =>
  valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export default function CuidadorasPage() {
  const { rol } = useAuth();
  const puedeCrear = tieneRol(rol, ['administrador', 'secretaria']);

  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState(false);

  const filtros = {
    page: pagina,
    limit: LIMITE_POR_PAGINA,
    search: busqueda.trim() || undefined,
    sortBy: 'id',
    order: 'ASC' as const,
  };

  const { data, isLoading, error } = useCuidadorasPaginado(filtros);

  const cuidadoras = data?.datos ?? [];
  const paginacion = data?.paginacion;

  const cambiarPagina = (nuevaPagina: number) => {
    if (!paginacion) return;

    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPaginas) {
      setPagina(nuevaPagina);
    }
  };

  const imprimirReporte = () => {
    if (cuidadoras.length === 0) return;

    const filas = cuidadoras
      .map(
        (cuidadora) => `
          <tr>
            <td>${cuidadora.id}</td>
            <td>${escaparHtml(cuidadora.persona?.apellido ?? '—')}</td>
            <td>${escaparHtml(cuidadora.persona?.nombre ?? '—')}</td>
            <td>${escaparHtml(cuidadora.persona?.dni ?? '—')}</td>
            <td>${escaparHtml(cuidadora.persona?.telefono ?? '—')}</td>
            <td>${escaparHtml(formatFecha(cuidadora.persona?.fecha_nacimiento))}</td>
          </tr>
        `,
      )
      .join('');

    const ventana = window.open('', '_blank', 'width=1100,height=750');

    if (!ventana) {
      window.alert(
        'El navegador bloqueó la ventana del reporte. Permití las ventanas emergentes para este sitio e intentá nuevamente.',
      );
      return;
    }

    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Reporte de cuidadoras</title>
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
              font-size: 22px;
              margin-bottom: 8px;
            }

            .informacion {
              margin-bottom: 20px;
              font-size: 12px;
              line-height: 1.7;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }

            th,
            td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
              vertical-align: top;
            }

            th {
              background: #eee;
            }

            tr {
              page-break-inside: avoid;
            }

            thead {
              display: table-header-group;
            }

            @media print {
              body {
                margin: 12mm;
              }
            }
          </style>
        </head>
        <body>
          <h1>Reporte de cuidadoras</h1>

          <div class="informacion">
            <div>
              Registros incluidos en esta página: ${cuidadoras.length}
            </div>
            <div>
              Total de cuidadoras encontradas: ${paginacion?.total ?? cuidadoras.length}
            </div>
            <div>
              Página: ${pagina}
            </div>
            <div>
              Fecha de generación: ${escaparHtml(new Date().toLocaleString('es-AR'))}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Apellido</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Fecha de nacimiento</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
            </tbody>
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
        titulo="Cuidadoras"
        descripcion="Personal de cuidado registrado."
        accion={
          puedeCrear ? (
            <Button onClick={() => setAbierto(true)}>
              Nueva cuidadora
            </Button>
          ) : undefined
        }
      />

      <div className="panel">
        <div
          className="campo"
          style={{
            maxWidth: '420px',
            marginBottom: '1rem',
          }}
        >
          <label htmlFor="buscar-cuidadora">
            Buscar por nombre, apellido, DNI o teléfono
          </label>
          <input
            id="buscar-cuidadora"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
            placeholder="Ingresar nombre, DNI o teléfono"
          />
        </div>

        <div className="acciones-listado">
          <p>
            {isLoading
              ? 'Cargando cuidadoras…'
              : `Se encontraron ${paginacion?.total ?? 0} cuidadoras.`}
          </p>

          <Button
            variante="secundario"
            chico
            disabled={isLoading || cuidadoras.length === 0}
            onClick={imprimirReporte}
          >
            Imprimir / guardar PDF
          </Button>
        </div>

        <StateView
          cargando={isLoading}
          error={error}
          vacio={cuidadoras.length === 0}
          textoVacio="No hay cuidadoras para mostrar."
        >
          <DataTable
            filas={cuidadoras}
            clave={(c) => c.id}
            columnas={[
              {
                titulo: 'Nombre',
                render: (c) =>
                  c.persona
                    ? `${c.persona.apellido}, ${c.persona.nombre}`
                    : `Persona #${c.persona_id}`,
              },
              {
                titulo: 'DNI',
                render: (c) => c.persona?.dni ?? '—',
              },
              {
                titulo: 'Teléfono',
                render: (c) => c.persona?.telefono ?? '—',
              },
            ]}
            acciones={(c) => (
              <Link
                className="btn btn-secundario"
                to={`/cuidadoras/${c.id}`}
              >
                Ver ficha
              </Link>
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
              Mostrando {cuidadoras.length} de {paginacion.total} cuidadoras
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

      {puedeCrear && abierto && (
        <AltaPersonaModal
          abierto
          titulo="Nueva cuidadora"
          nombrePerfil="cuidadora"
          claveQuery="cuidadoras"
          crearPerfil={(personaId) =>
            cuidadoraService.crear({ persona_id: personaId })
          }
          onCerrar={() => setAbierto(false)}
        />
      )}
    </>
  );
}
