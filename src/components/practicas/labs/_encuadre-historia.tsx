"use client";

/**
 * Encuadre responsivo para las escenas 3D de historia y civismo.
 * Dentro del <Canvas>: en pantallas verticales aleja la cámara según la relación
 * de aspecto y desplaza la imagen unos píxeles hacia arriba, para que el contenido
 * quede ENTRE la barra superior (~64 px) y la misión inferior (~150 px) del shell.
 */

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

type V3 = readonly [number, number, number];

export function Encuadre({ pos, target }: { pos: V3; target: V3 }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const w = useThree((s) => s.size.width);
  const h = useThree((s) => s.size.height);

  useEffect(() => {
    if (w <= 0 || h <= 0) return undefined;
    const aspect = w / h;
    const k = aspect < 1.15 ? Math.min(1.9, 1.15 / aspect) : 1;
    camera.position.set(
      target[0] + (pos[0] - target[0]) * k,
      target[1] + (pos[1] - target[1]) * k,
      target[2] + (pos[2] - target[2]) * k,
    );
    if (camera.setViewOffset) {
      camera.setViewOffset(w, h, 0, 43, w, h);
      camera.updateProjectionMatrix();
    }
    return () => {
      if (camera.clearViewOffset) {
        camera.clearViewOffset();
        camera.updateProjectionMatrix();
      }
    };
  }, [camera, w, h, pos, target]);

  return null;
}
