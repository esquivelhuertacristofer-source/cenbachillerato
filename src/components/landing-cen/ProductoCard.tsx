"use client";

import Link from "next/link";

export interface ProductoCEN {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  estado: "disponible" | "proximamente";
  href: string;
}

interface ProductoCardProps {
  producto: ProductoCEN;
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const content = (
    <div
      className={[
        "flex h-full flex-col rounded-2xl border-2 p-6 transition-all duration-200",
        producto.estado === "disponible"
          ? "cursor-pointer border-transparent bg-white shadow-sm hover:border-indigo-200 hover:shadow-md"
          : "border-dashed border-gray-200 bg-gray-50",
      ].join(" ")}
    >
      <div
        className={[
          "mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-2xl",
          producto.estado === "disponible" ? producto.color : "bg-gray-100",
        ].join(" ")}
      >
        {producto.icono}
      </div>

      <h3
        className={[
          "text-base font-semibold",
          producto.estado === "disponible" ? "text-gray-900" : "text-gray-400",
        ].join(" ")}
      >
        {producto.nombre}
      </h3>

      <p
        className={[
          "mt-2 flex-1 text-sm",
          producto.estado === "disponible" ? "text-gray-600" : "text-gray-400",
        ].join(" ")}
      >
        {producto.descripcion}
      </p>

      <div className="mt-4">
        {producto.estado === "disponible" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Disponible
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
            Próximamente
          </span>
        )}
      </div>
    </div>
  );

  if (producto.estado === "disponible") {
    return <Link href={producto.href}>{content}</Link>;
  }

  return <div>{content}</div>;
}
