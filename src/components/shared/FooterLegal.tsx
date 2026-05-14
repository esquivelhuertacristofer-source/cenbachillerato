import Link from "next/link";

export function FooterLegal() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-10 bg-cen-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-cen-navy">
              CEN — Campaña Educativa Nacional
            </p>
            <p className="mt-1 text-xs text-ink-40">
              © {year} CEN. Todos los derechos reservados. Plataforma alineada al
              MCCEMS (Acuerdo 09/08/23) y compatible con el Modelo Educativo 2025 de la SEP.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link
              href="/privacidad"
              className="text-xs text-ink-40 transition-colors hover:text-cen-blue"
            >
              Aviso de Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-xs text-ink-40 transition-colors hover:text-cen-blue"
            >
              Términos de Uso
            </Link>
            <a
              href="mailto:contacto@cen.edu.mx"
              className="text-xs text-ink-40 transition-colors hover:text-cen-blue"
            >
              Contacto
            </a>
          </nav>
        </div>

        <p className="mt-4 text-center text-xs text-ink-40">
          Protección de datos personales conforme a la LFPDPPP y lineamientos del INAI.
        </p>
      </div>
    </footer>
  );
}
