"use client";

/**
 * Encuadre de las escenas de plano cartesiano (rectas, funciones, TFC).
 *
 * El contenido llena ~58 % del alto y queda entre la barra de arriba y la
 * misión de abajo; en pantallas angostas la cámara se aleja para que quepa a
 * lo ancho. Se desplaza la imagen (view offset) en vez de mover el objetivo de
 * OrbitControls, así los límites de órbita no cambian.
 */

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

export function EncuadreMate({ ancho, alto, relleno = 0.58, nonce = 0 }: { ancho: number; alto: number; relleno?: number; nonce?: number }) {
  const camera = useThree((s) => s.camera);
  const w = useThree((s) => s.size.width);
  const h = useThree((s) => s.size.height);
  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    const t = Math.tan((cam.fov * Math.PI) / 360);
    const aspect = w / Math.max(1, h);
    const z = Math.max(alto / relleno / (2 * t), ancho / 0.9 / (2 * t * aspect));
    cam.position.set(0, 0, z);
    cam.lookAt(0, 0, 0);
    // sube el dibujo ~7 % del alto: la barra de arriba es más baja que la misión de abajo
    cam.setViewOffset(w, h, 0, Math.round(h * 0.07), w, h);
    return () => cam.clearViewOffset();
  }, [camera, w, h, ancho, alto, relleno, nonce]);
  return null;
}
