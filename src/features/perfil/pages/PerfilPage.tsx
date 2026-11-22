import { useQuery } from '@tanstack/react-query';
import { authService } from '@/features/auth/services/auth.service';
import { ETIQUETA_ROL } from '@/core/permissions/roles';
import { PageHeader } from '@/shared/components/PageHeader';
import { StateView } from '@/shared/components/StateView';
import { formatFecha } from '@/shared/utils/formatFecha';

export default function PerfilPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['perfil'],
    queryFn: authService.perfil,
  });

  return (
    <>
      <PageHeader
        titulo="Mi perfil"
        descripcion="Información de tu cuenta y datos personales."
      />

      <div className="panel">
        <StateView cargando={isLoading} error={error}>
          {data && (
            <>
              <h3>Datos personales</h3>
              <dl className="ficha">
                <div>
                  <dt>Nombre</dt>
                  <dd>{data.persona.nombre} {data.persona.apellido}</dd>
                </div>
                <div>
                  <dt>DNI</dt>
                  <dd>{data.persona.dni}</dd>
                </div>
                <div>
                  <dt>Teléfono</dt>
                  <dd>{data.persona.telefono ?? '—'}</dd>
                </div>
                <div>
                  <dt>Fecha de nacimiento</dt>
                  <dd>{formatFecha(data.persona.fecha_nacimiento)}</dd>
                </div>
                <div>
                  <dt>Identificador de persona</dt>
                  <dd>{data.persona_id}</dd>
                </div>
              </dl>

              <h3>Datos de la cuenta</h3>
              <dl className="ficha">
                <div>
                  <dt>Identificador de usuario</dt>
                  <dd>{data.id}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{data.email}</dd>
                </div>
                <div>
                  <dt>Rol</dt>
                  <dd>{ETIQUETA_ROL[data.rol]}</dd>
                </div>
                <div>
                  <dt>Estado</dt>
                  <dd>{data.activo ? 'Activo' : 'Inactivo'}</dd>
                </div>
                <div>
                  <dt>Cuenta creada</dt>
                  <dd>{formatFecha(data.creado_en)}</dd>
                </div>
                <div>
                  <dt>Última actualización</dt>
                  <dd>{formatFecha(data.actualizado_en)}</dd>
                </div>
              </dl>
            </>
          )}
        </StateView>
      </div>
    </>
  );
}
