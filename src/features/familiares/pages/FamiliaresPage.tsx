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
import { familiarService } from '../services/familiar.service';
import { useFamiliaresPaginado } from '../hooks/useFamiliares';

const LIMITE_POR_PAGINA = 10;

const escaparHtml = (valor: string): string =>
  valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export default function FamiliaresPage() {
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

  const { data, isLoading, error } = useFamiliaresPaginado(filtros);

  const familiares = data?.datos ?? [];
  const paginacion = data?.paginacion;

  const cambiarPagina = (nuevaPagina: number) => {
    if (!paginacion) return;

    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPaginas) {
      setPagina(nuevaPagina);
    }
  };

  const imprimirReporte = () => {
    if (familiares.length === 0) return;

    const filas = familiares
      .map(
        (familiar) => `
          <tr>
            <td>${familiar.id}</td>
            <td>${escaparHtml(familiar.persona?.apellido ?? '—')}</td>
            <td>${escaparHtml(familiar.persona?.nombre ?? '—')}</td>
            <td>${escaparHtml(familiar.persona?.dni ?? '—')}</td>
            <td>${escaparHtml(familiar.persona?.telefono ?? '—')}</td>
            <td>${escaparHtml(formatFecha(familiar.persona?.fecha_nacimiento))}</td>
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
          <title>Reporte de familiares</title>
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
          <h1>Reporte de familiares</h1>

          <div class="informacion">
            <div>
              Registros incluidos en esta página: ${familiares.length}
            </div>
            <div>
              Total de familiares encontrados: ${paginacion?.total ?? familiares.length}
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
        titulo="Familiares"
        descripcion="Familiares registrados en el sistema."
        accion={
          puedeCrear ? (
            <Button onClick={() => setAbierto(true)}>
              Nuevo familiar
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
          <label htmlFor="buscar-familiar">
            Buscar por nombre, apellido, DNI o teléfono
          </label>
          <input
            id="buscar-familiar"
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
              ? 'Cargando familiares…'
              : `Se encontraron ${paginacion?.total ?? 0} familiares.`}
          </p>

          <Button
            variante="secundario"
            chico
            disabled={isLoading || familiares.length === 0}
            onClick={imprimirReporte}
          >
            Imprimir / guardar PDF
          </Button>
        </div>

        <StateView
          cargando={isLoading}
          error={error}
          vacio={familiares.length === 0}
          textoVacio="No hay familiares para mostrar."
        >
          <DataTable
            filas={familiares}
            clave={(f) => f.id}
            columnas={[
              {
                titulo: 'Nombre',
                render: (f) =>
                  f.persona
                    ? `${f.persona.apellido}, ${f.persona.nombre}`
                    : `Persona #${f.persona_id}`,
              },
              {
                titulo: 'DNI',
                render: (f) => f.persona?.dni ?? '—',
              },
              {
                titulo: 'Teléfono',
                render: (f) => f.persona?.telefono ?? '—',
              },
            ]}
            acciones={(f) => (
              <Link
                className="btn btn-secundario"
                to={`/familiares/${f.id}`}
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
              Mostrando {familiares.length} de {paginacion.total} familiares
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
          titulo="Nuevo familiar"
          nombrePerfil="familiar"
          claveQuery="familiares"
          crearPerfil={(personaId) =>
            familiarService.crear({ persona_id: personaId })
          }
          onCerrar={() => setAbierto(false)}
        />
      )}
    </>
  );
}
