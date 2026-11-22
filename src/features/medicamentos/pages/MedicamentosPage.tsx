import { useState } from 'react';
import { useAuth } from '@/core/auth/useAuth';
import { tieneRol } from '@/core/permissions/roles';
import { obtenerMensajeError } from '@/core/api/errors';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Button } from '@/shared/components/ui/Button';
import {
  useEliminarMedicamento,
  useGuardarMedicamento,
  useMedicamentosPaginado,
} from '../hooks/useMedicamentos';
import { MedicamentoFormModal } from '../components/MedicamentoFormModal';
import type { Medicamento } from '../interfaces/medicamento.interface';

const LIMITE_POR_PAGINA = 10;

function escaparHtml(valor: string | number): string {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function imprimirMedicamentos(
  medicamentos: Medicamento[],
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

  const filas = medicamentos
    .map(
      (medicamento) => `
        <tr>
          <td>${escaparHtml(medicamento.id)}</td>
          <td>${escaparHtml(medicamento.nombre)}</td>
          <td>${escaparHtml(medicamento.presentacion)}</td>
          <td>${escaparHtml(medicamento.cantidad)}</td>
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
        <title>Reporte de medicamentos</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            color: #222;
            margin: 32px;
          }

          h1 {
            margin-bottom: 8px;
          }

          .informacion {
            margin-bottom: 24px;
            color: #555;
            font-size: 14px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f0f0f0;
          }

          @media print {
            body {
              margin: 15mm;
            }

            tr {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body onload="window.print()">
        <h1>Reporte de medicamentos</h1>

        <div class="informacion">
          <p>Fecha de emisión: ${escaparHtml(fecha)}</p>
          <p>Registros incluidos: ${medicamentos.length}</p>
          <p>Total de medicamentos encontrados: ${total}</p>
          <p>Página: ${pagina}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Presentación</th>
              <th>Cantidad</th>
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
}

export default function MedicamentosPage() {
  const { rol } = useAuth();
  const puedeEditar = tieneRol(rol, ['administrador', 'secretaria']);
  const puedeEliminar = tieneRol(rol, ['administrador']);

  const guardar = useGuardarMedicamento();
  const eliminar = useEliminarMedicamento();

  const [busqueda, setBusqueda] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');
  const [pagina, setPagina] = useState(1);

  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Medicamento | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Medicamento | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const { data, isLoading, error } = useMedicamentosPaginado({
    page: pagina,
    limit: LIMITE_POR_PAGINA,
    search: busquedaAplicada || undefined,
    sortBy: 'nombre',
    order: 'ASC',
  });

  const medicamentos = data?.datos ?? [];
  const total = data?.paginacion.total ?? 0;
  const totalPaginas = data?.paginacion.totalPaginas ?? 0;

  const buscar = () => {
    setPagina(1);
    setBusquedaAplicada(busqueda.trim());
  };

  const abrirAlta = () => {
    setEditando(null);
    setErrorForm(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (medicamento: Medicamento) => {
    setEditando(medicamento);
    setErrorForm(null);
    setFormAbierto(true);
  };

  const confirmarEliminar = () => {
    if (!aEliminar) return;

    setErrorEliminar(null);

    eliminar.mutate(aEliminar.id, {
      onSuccess: () => {
        setAEliminar(null);

        // Si eliminamos el único registro de la última página,
        // retrocedemos una página para evitar mostrar una página vacía.
        if (data?.datos.length === 1 && pagina > 1) {
          setPagina((actual) => actual - 1);
        }
      },
      onError: (e) => setErrorEliminar(obtenerMensajeError(e)),
    });
  };

  return (
    <>
      <PageHeader
        titulo="Medicamentos"
        descripcion="Catálogo que se usa al indicar tratamientos."
        accion={
          puedeEditar
            ? <Button onClick={abrirAlta}>Nuevo medicamento</Button>
            : undefined
        }
      />

      <div className="panel">
        <div className="filtros">
          <div className="campo">
            <label htmlFor="buscar-med">
              Buscar por nombre o presentación
            </label>
            <input
              id="buscar-med"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') buscar();
              }}
            />
          </div>

          <Button variante="secundario" onClick={buscar}>
            Buscar
          </Button>

          <Button
            variante="secundario"
            onClick={() =>
              imprimirMedicamentos(medicamentos, pagina, total)
            }
            disabled={isLoading || medicamentos.length === 0}
          >
            Imprimir / guardar PDF
          </Button>
        </div>

        <p>
          {isLoading
            ? 'Cargando medicamentos…'
            : `Se encontraron ${total} medicamento${total === 1 ? '' : 's'}.`}
        </p>

        <StateView
          cargando={isLoading}
          error={error}
          vacio={!isLoading && medicamentos.length === 0}
          textoVacio={
            busquedaAplicada
              ? 'Ningún medicamento coincide con la búsqueda.'
              : 'Todavía no hay medicamentos cargados.'
          }
        >
          <DataTable
            filas={medicamentos}
            clave={(m) => m.id}
            columnas={[
              { titulo: 'Nombre', render: (m) => m.nombre },
              { titulo: 'Presentación', render: (m) => m.presentacion },
              { titulo: 'Cantidad', render: (m) => m.cantidad },
            ]}
            acciones={
              puedeEditar
                ? (m) => (
                    <>
                      <Button
                        variante="texto"
                        chico
                        onClick={() => abrirEdicion(m)}
                      >
                        Editar
                      </Button>

                      {puedeEliminar && (
                        <Button
                          variante="texto"
                          chico
                          onClick={() => setAEliminar(m)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </>
                  )
                : undefined
            }
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

      <MedicamentoFormModal
        abierto={formAbierto}
        medicamento={editando}
        enviando={guardar.isPending}
        error={errorForm}
        onCerrar={() => setFormAbierto(false)}
        onEnviar={(valores) => {
          setErrorForm(null);

          guardar.mutate(
            { id: editando?.id, datos: valores },
            {
              onSuccess: () => setFormAbierto(false),
              onError: (e) => setErrorForm(obtenerMensajeError(e)),
            },
          );
        }}
      />

      <ConfirmDialog
        abierto={aEliminar !== null}
        titulo="Eliminar medicamento"
        mensaje={
          errorEliminar ??
          `¿Eliminar "${aEliminar?.nombre}"? Si tiene tratamientos asociados, puede que no se pueda eliminar.`
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