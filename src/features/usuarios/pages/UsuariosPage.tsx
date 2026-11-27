import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/core/auth/useAuth';
import { obtenerMensajeError } from '@/core/api/errors';
import { ETIQUETA_ROL, type Rol } from '@/core/permissions/roles';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { DataTable } from '@/shared/components/DataTable';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { UsuarioFormModal, type ValoresUsuario } from '../components/UsuarioFormModal';
import { usuarioService } from '../services/usuario.service';
import type { Usuario } from '../interfaces/usuario.interface';

const CLAVE = ['usuarios'];

// la secretaria solo gestiona cuentas de cuidadoras (el backend lo valida también).
// los familiares se dan de alta desde Familiares y crean su cuenta por QR.
const ROLES_SECRETARIA: Rol[] = ['cuidadora'];

const normalizar = (valor: string): string =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();

export default function UsuariosPage() {
  const qc = useQueryClient();
  const { usuario: yo, rol } = useAuth();
  const esSecretaria = rol === 'secretaria';

  const { data, isLoading, error } = useQuery({
    queryKey: CLAVE,
    queryFn: usuarioService.listar,
  });

  const [busqueda, setBusqueda] = useState('');

  // undefined = cerrado, null = alta, Usuario = edición
  const [formulario, setFormulario] = useState<Usuario | null | undefined>(undefined);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const guardar = useMutation({
    mutationFn: async (valores: ValoresUsuario) =>
      formulario
        ? usuarioService.actualizar(formulario.id, valores)
        : usuarioService.crear({ ...valores, password: valores.password ?? '' }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: CLAVE });
      setAviso({ ok: true, texto: r.mensaje });
      setFormulario(undefined);
    },
    onError: (e) => setErrorForm(obtenerMensajeError(e)),
  });

  const cambiarEstado = useMutation({
    mutationFn: (u: Usuario) =>
      u.activo
        ? usuarioService.desactivar(u.id)
        : usuarioService.activar(u.id),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: CLAVE });
      setAviso({ ok: true, texto: r.mensaje });
    },
    onError: (e) => setAviso({ ok: false, texto: obtenerMensajeError(e) }),
  });

  const nombre = (u: Usuario) =>
    u.persona
      ? `${u.persona.apellido}, ${u.persona.nombre}`
      : `Persona #${u.persona_id}`;

  const usuariosFiltrados = useMemo(() => {
    const usuarios = (data ?? []).filter((u) => !esSecretaria || u.rol === 'cuidadora');
    const termino = normalizar(busqueda);

    if (!termino) {
      return usuarios;
    }

    return usuarios.filter((u) => {
      const campos = [
        u.persona?.nombre,
        u.persona?.apellido,
        u.persona?.dni,
        u.email,
        ETIQUETA_ROL[u.rol],
        u.rol,
        String(u.id),
      ];

      return campos.some(
        (campo) => campo && normalizar(String(campo)).includes(termino),
      );
    });
  }, [data, busqueda, esSecretaria]);

  return (
    <>
      <PageHeader
        titulo="Usuarios"
        descripcion={
          esSecretaria
            ? 'Cuentas de cuidadoras. Los pacientes no tienen cuenta: se dan de alta desde su propia ficha.'
            : 'Cuentas del sistema. Cada alta crea también a la persona y su perfil.'
        }
        accion={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {esSecretaria && (
              <Link className="btn btn-secundario" to="/pacientes/nuevo">
                Nuevo paciente
              </Link>
            )}
            <Button
              onClick={() => {
                setErrorForm(null);
                setAviso(null);
                setFormulario(null);
              }}
            >
              {esSecretaria ? 'Nueva cuidadora' : 'Nuevo usuario'}
            </Button>
          </div>
        }
      />

      {aviso && (
        <div
          className={`aviso ${aviso.ok ? 'aviso-ok' : 'aviso-error'}`}
          role="status"
        >
          {aviso.texto}
        </div>
      )}

      <div className="panel">
        <div className="filtros">
          <div className="campo">
            <label htmlFor="buscar-usuarios">Buscar usuarios</label>
            <input
              id="buscar-usuarios"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, apellido, DNI, email o rol..."
            />
          </div>
        </div>

        {!isLoading && !error && (
          <p className="texto-secundario" aria-live="polite">
            {usuariosFiltrados.length === 1
              ? '1 usuario encontrado'
              : `${usuariosFiltrados.length} usuarios encontrados`}
            {busqueda.trim() && data
              ? ` de ${data.length} en total`
              : ''}
          </p>
        )}

        <StateView
          cargando={isLoading}
          error={error}
          vacio={!!data && data.length === 0}
          textoVacio="Todavía no hay usuarios."
        >
          {usuariosFiltrados.length === 0 && data && data.length > 0 ? (
            <p role="status">
              No se encontraron usuarios que coincidan con la búsqueda.
            </p>
          ) : (
            <DataTable
              filas={usuariosFiltrados}
              clave={(u) => u.id}
              columnas={[
                { titulo: 'Nombre', render: nombre },
                { titulo: 'DNI', render: (u) => u.persona?.dni ?? '—' },
                { titulo: 'Email', render: (u) => u.email },
                { titulo: 'Rol', render: (u) => ETIQUETA_ROL[u.rol] },
                {
                  titulo: 'Estado',
                  render: (u) => (
                    <Badge tono={u.activo ? 'ok' : 'neutro'}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  ),
                },
              ]}
              acciones={(u) => {
                const esMiCuenta = u.id === yo?.id;

                return (
                  <>
                    <Button
                      variante="texto"
                      chico
                      onClick={() => {
                        setErrorForm(null);
                        setAviso(null);
                        setFormulario(u);
                      }}
                    >
                      Editar
                    </Button>

                    <Button
                      variante="texto"
                      chico
                      disabled={
                        cambiarEstado.isPending || (esMiCuenta && u.activo)
                      }
                      title={
                        esMiCuenta && u.activo
                          ? 'No podés desactivar tu propia cuenta'
                          : undefined
                      }
                      onClick={() => {
                        setAviso(null);
                        cambiarEstado.mutate(u);
                      }}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </>
                );
              }}
            />
          )}
        </StateView>
      </div>

      <UsuarioFormModal
        abierto={formulario !== undefined}
        usuario={formulario ?? null}
        rolesPermitidos={esSecretaria ? ROLES_SECRETARIA : undefined}
        enviando={guardar.isPending}
        error={errorForm}
        onCerrar={() => setFormulario(undefined)}
        onEnviar={(valores) => {
          setErrorForm(null);
          guardar.mutate(valores);
        }}
      />
    </>
  );
}
