
import { useAuth } from '@/core/auth/useAuth';
import { ETIQUETA_ROL } from '@/core/permissions/roles';

interface HeaderProps {
  menuAbierto?: boolean;
  onToggleMenu?: () => void;
}

export function Header({
  menuAbierto = false,
  onToggleMenu,
}: HeaderProps) {
  const { usuario, rol } = useAuth();

  return (
    <header className="header">
      <div className="header-marca">
        {onToggleMenu && (
          <button
            type="button"
            className="header-menu"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            onClick={onToggleMenu}
          >
            {menuAbierto ? 'Cerrar' : 'Menú'}
          </button>
        )}

        <span>Gestión de cuidados</span>
      </div>

      {usuario && (
        <div className="header-usuario">
          <span>{usuario.email}</span>
          {rol && <small>{ETIQUETA_ROL[rol]}</small>}
        </div>
      )}
    </header>
  );
}
