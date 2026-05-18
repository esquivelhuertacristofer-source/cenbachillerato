"use client";

import { useRouter } from "next/navigation";
import ProgresionCard from "./ProgresionCard";

interface Actividad {
  orden: number;
  tipo: string;
  estado: "no_iniciada" | "en_progreso" | "completada";
}

interface Progresion {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string | null;
  ejes_articuladores: string[] | null;
  estado: "no_iniciada" | "en_progreso" | "completada";
  actividades: Actividad[];
}

interface ProgresionTimelineProps {
  progresiones: Progresion[];
  codigoUAC: string;
  accentColor: string;
  accentRgb: string;
  uacEmoji: string;
}

export default function ProgresionTimeline({
  progresiones,
  codigoUAC,
  accentColor,
  accentRgb,
  uacEmoji,
}: ProgresionTimelineProps) {
  const router = useRouter();

  function getStatus(prog: Progresion, index: number): "locked" | "available" | "completed" {
    if (prog.estado === "completada") return "completed";
    if (index > 0 && progresiones[index - 1]!.estado === "no_iniciada") return "locked";
    return "available";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {progresiones.map((prog, i) => (
        <ProgresionCard
          key={prog.id}
          numero={prog.numero}
          titulo={prog.titulo}
          descripcion={prog.descripcion}
          ejesArticuladores={prog.ejes_articuladores}
          actividades={prog.actividades}
          status={getStatus(prog, i)}
          isLast={i === progresiones.length - 1}
          accentColor={accentColor}
          accentRgb={accentRgb}
          uacEmoji={uacEmoji}
          onClick={() => router.push(`/hub/uac/${codigoUAC}/progresion/${prog.numero}`)}
        />
      ))}
    </div>
  );
}
