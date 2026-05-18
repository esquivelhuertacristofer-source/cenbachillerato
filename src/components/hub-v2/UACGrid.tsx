"use client";

import UACCard from "./UACCard";

interface UACItem {
  codigo: string;
  nombre: string;
  done: number;
  total: number;
  pct: number;
}

interface UACGridProps {
  items: UACItem[];
}

export default function UACGrid({ items }: UACGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "20px",
      }}
    >
      {items.map((item) => (
        <UACCard
          key={item.codigo}
          codigo={item.codigo}
          nombre={item.nombre}
          done={item.done}
          total={item.total}
          pct={item.pct}
        />
      ))}
    </div>
  );
}
