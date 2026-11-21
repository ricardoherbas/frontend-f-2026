
export function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-contenido">
        <div>
          <strong>Gestión de cuidados</strong>
          <p>Sistema de gestión y seguimiento de cuidados.</p>
        </div>

        <small>
          © {anioActual} Gestión de cuidados. Todos los derechos reservados.
        </small>
      </div>
    </footer>
  );
}
