"use client";
// Kit del espacio: texturas fotográficas de planetas, Sol, Luna y Vía Láctea,
// las mismas del Sistema Solar de NEM básica. Lo usan los labs que muestran la
// Tierra o el cielo (gravitación, subsistemas terrestres, el viaje de un
// paquete por Internet).
//
// LAS TEXTURAS: Solar System Scope (CC BY 4.0), hechas con datos de la NASA.
// La licencia pide el crédito: cada lab que las use debe mostrar CREDITO_ESPACIO
// en su pestaña «Teoría».
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

export const RUTA_ESPACIO = "/media/espacio";

export const CREDITO_ESPACIO =
  "Imágenes de planetas: Solar System Scope (CC BY 4.0), con datos de la NASA.";

/** Archivos disponibles (sin extensión). Los que tienen versión 4K la indican. */
export const TEXTURAS_ESPACIO = {
  tierraDia: { base: "tierra-dia", cuatroK: true },
  tierraNoche: { base: "tierra-noche", cuatroK: true },
  tierraNubes: { base: "tierra-nubes", cuatroK: false },
  tierraOceanos: { base: "tierra-oceanos", cuatroK: false }, // máscara de agua: úsala como roughnessMap/specular
  luna: { base: "luna", cuatroK: false },
  sol: { base: "sol", cuatroK: false },
  viaLactea: { base: "via-lactea", cuatroK: true },
  marte: { base: "marte", cuatroK: false },
  jupiter: { base: "jupiter", cuatroK: false },
  saturno: { base: "saturno", cuatroK: false },
  mercurio: { base: "mercurio", cuatroK: false },
  venus: { base: "venus", cuatroK: false },
  urano: { base: "urano", cuatroK: false },
  neptuno: { base: "neptuno", cuatroK: false },
} as const;

export type TexturaEspacio = keyof typeof TEXTURAS_ESPACIO;

/** 4K en computadora; 2K en tableta y celular (memoria de video y descarga). */
export function resolucionEspacio(): "2k" | "4k" {
  if (typeof window === "undefined") return "2k";
  const tactil = window.matchMedia?.("(pointer: coarse)").matches;
  const corta = Math.min(window.screen.width, window.screen.height);
  return tactil || corta < 800 ? "2k" : "4k";
}

/** Ruta del archivo de una textura, con la mejor resolución que convenga aquí. */
export function rutaTextura(nombre: TexturaEspacio): string {
  const t = TEXTURAS_ESPACIO[nombre];
  const res = t.cuatroK ? resolucionEspacio() : "2k";
  return `${RUTA_ESPACIO}/${t.base}-${res}.webp`;
}

/** Carga una textura de color (sRGB) con anisotropía alta. */
export function useTexturaEspacio(nombre: TexturaEspacio): THREE.Texture {
  return useTexture(rutaTextura(nombre), (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });
}

/** Halo cálido para el Sol (sprite). */
export function texturaResplandor(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, "rgba(255,240,200,1)");
  r.addColorStop(0.18, "rgba(255,200,110,0.55)");
  r.addColorStop(0.45, "rgba(255,150,60,0.12)");
  r.addColorStop(1, "rgba(255,120,40,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Fondo: fotografía panorámica de la Vía Láctea sobre una esfera enorme.
 * Solo en escenas que de verdad están en el espacio (ver «síntomas de gráfico
 * viejo»: nada de estrellas donde no hay espacio).
 */
export function ViaLactea({ brillo = 0.55, radio = 1500 }: { brillo?: number; radio?: number }) {
  const mapa = useTexturaEspacio("viaLactea");
  return (
    <mesh raycast={() => null} rotation={[0.35, 0, 0.6]}>
      <sphereGeometry args={[radio, 64, 32]} />
      <meshBasicMaterial map={mapa} side={THREE.BackSide} color={[brillo, brillo, brillo * 1.08]} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
