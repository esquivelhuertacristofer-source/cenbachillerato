import Link from "next/link";

export function FooterLegal() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-gray-900">
              CEN — Campaña Educativa Nacional
            </p>
            <p className="mt-1 text-xs text-gray-500">
              © {year} CEN. Todos los derechos reservados. Plataforma alineada al
              MCCEMS (Acuerdo 09/08/23) y compatible con el Modelo Educativo 2025 de la SEP.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link
              href="/privacidad"
              className="text-xs text-gray-500 hover:text-indigo-600"
            >
              Aviso de Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-xs text-gray-500 hover:text-indigo-600"
            >
              Términos de Uso
            </Link>
            <a
              href="mailto:contacto@cen.edu.mx"
              className="text-xs text-gray-500 hover:text-indigo-600"
            >
              Contacto
            </a>
          </nav>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Protección de datos personales conforme a la LFPDPPP y lineamientos del INAI.
        </p>
      </div>
    </footer>
  );
}
