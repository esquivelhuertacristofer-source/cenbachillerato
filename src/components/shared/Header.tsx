import Link from "next/link";

interface HeaderProps {
  variant?: "cen" | "bachillerato";
}

export function Header({ variant = "cen" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-700">CEN</span>
          {variant === "bachillerato" && (
            <span className="hidden text-sm font-medium text-gray-500 sm:block">
              Bachillerato
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {variant === "bachillerato" ? (
            <>
              <Link
                href="/bachillerato#estructura"
                className="text-sm text-gray-600 hover:text-indigo-700"
              >
                Estructura MCCEMS
              </Link>
              <Link
                href="/bachillerato#para-quien"
                className="text-sm text-gray-600 hover:text-indigo-700"
              >
                Para quién
              </Link>
            </>
          ) : (
            <Link
              href="/#productos"
              className="text-sm text-gray-600 hover:text-indigo-700"
            >
              Productos
            </Link>
          )}
        </nav>

        <Link
          href="/log-in"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Acceder
        </Link>
      </div>
    </header>
  );
}
