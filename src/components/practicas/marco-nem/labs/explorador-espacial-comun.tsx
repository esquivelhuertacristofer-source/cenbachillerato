"use client";
/* eslint-disable -- Código portado tal cual de NEM; las reglas de React Compiler de CEN no aplican a escenas three.js. */
// Piezas que comparten las dos vistas del explorador espacial (Tierra y Luna,
// y Sistema Solar): dónde están las texturas, qué resolución bajar, el
// resplandor del Sol y el fondo de estrellas.
import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

export const RUTA = "/media/espacio";

/** 4K en computadora; 2K en tableta y celular (memoria de video y descarga). */
export function resolucion(): "2k" | "4k" {
  if (typeof window === "undefined") return "2k";
  const tactil = window.matchMedia?.("(pointer: coarse)").matches;
  const corta = Math.min(window.screen.width, window.screen.height);
  return tactil || corta < 800 ? "2k" : "4k";
}

export function texturaResplandor() {
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

/** Fondo: fotografía panorámica de la Vía Láctea sobre una esfera enorme. */
export function ViaLactea({ brillo = 0.55 }: { brillo?: number }) {
  const res = useMemo(() => resolucion(), []);
  const mapa = useTexture(`${RUTA}/via-lactea-${res}.webp`);
  useMemo(() => {
    mapa.colorSpace = THREE.SRGBColorSpace;
  }, [mapa]);
  return (
    <mesh raycast={() => null} rotation={[0.35, 0, 0.6]}>
      <sphereGeometry args={[1500, 64, 32]} />
      <meshBasicMaterial map={mapa} side={THREE.BackSide} color={[brillo, brillo, brillo * 1.08]} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
