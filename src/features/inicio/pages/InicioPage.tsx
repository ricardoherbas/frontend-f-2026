import { Link } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { ETIQUETA_ROL, tieneRol } from '@/core/permissions/roles';
import { RUTAS_PRIVADAS, rutasDelMenu } from '@/app/router/routes.config';
import { PageHeader } from '@/shared/components/PageHeader';
import { ACCIONES_RAPIDAS, DESCRIPCION_ACCESO, ESTADISTICAS } from '../estadisticas.config';
import { TarjetaEstadistica } from '../components/TarjetaEstadistica';
import { PanelPartesRecientes } from '../components/PanelPartesRecientes';
import { PanelPagosPorCobrar } from '../components/PanelPagosPorCobrar';

export default function InicioPage() {
  const { usuario, rol } = useAuth();

  const estadisticas = ESTADISTICAS.filter((e) => tieneRol(rol, e.roles));
  const acciones = ACCIONES_RAPIDAS.filter((a) => tieneRol(rol, a.roles));
  // Mismas pantallas que el menú lateral (ya filtradas por rol), sin el propio inicio.
  const accesos = rutasDelMenu(rol).filter((r) => r.path !== '/inicio');
  const veParteDiario = RUTAS_PRIVADAS.some((r) => r.path === '/partes-diarios' && tieneRol(rol, r.roles));
  const vePagos = RUTAS_PRIVADAS.some((r) => r.path === '/pagos' && tieneRol(rol, r.roles));

  return (
    <>
      <PageHeader
        titulo="Inicio"
        descripcion={`${usuario?.email ?? ''}${rol ? ` · ${ETIQUETA_ROL[rol]}` : ''}`}
      />

      {acciones.length > 0 && (
        <section aria-labelledby="titulo-acciones" className="seccion-inicio">
          <h2 id="titulo-acciones">Acciones rápidas</h2>
          <div className="acciones-rapidas">
            {acciones.map((a) => (
              <Link key={a.ruta} to={a.ruta} className="btn btn-primario">
                {a.etiqueta}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="titulo-resumen" className="seccion-inicio">
        <h2 id="titulo-resumen">Resumen</h2>
        <div className="estadisticas">
          {estadisticas.map((e) => (
            <TarjetaEstadistica key={e.clave} estadistica={e} />
          ))}
        </div>
      </section>

      {(veParteDiario || vePagos) && (
        <div className="dashboard seccion-inicio">
          {veParteDiario && <PanelPartesRecientes />}
          {vePagos && <PanelPagosPorCobrar />}
        </div>
      )}

      <section aria-labelledby="titulo-accesos" className="seccion-inicio">
        <h2 id="titulo-accesos">Accesos rápidos</h2>
        <div className="accesos">
          {accesos.map((r) => (
            <Link key={r.path} to={r.path} className="acceso-tarjeta">
              <strong>{r.etiqueta}</strong>
              {DESCRIPCION_ACCESO[r.path] && <span>{DESCRIPCION_ACCESO[r.path]}</span>}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
