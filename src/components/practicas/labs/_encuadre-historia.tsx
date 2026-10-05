"use client";

/**
 * Encuadre responsivo para las escenas 3D de historia y civismo.
 * Dentro del <Canvas>: en pantallas verticales aleja la cámara según la relación
 * de aspecto y desplaza la imagen unos píxeles hacia arriba, para que el contenido
 * quede ENTRE la barra superior (~64 px) y la misión inferior (~150 px) del shell.
 */

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
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

/**
 * Rótulo en 3D con textura de canvas (sprite): legible (≥ 14 px a la distancia
 * normal de cámara), barato y sin <Text> ni <Html>. Parte el texto en dos líneas
 * si es largo. No cuenta como etiqueta HTML.
 */
export function Sello({ pos, texto, col, resalta = false }: { pos: V3; texto: string; col: string; resalta?: boolean }) {
  const { tex, ancho, alto } = useMemo(() => {
    const palabras = texto.split(" ");
    let lineas = [texto];
    if (texto.length > 22 && palabras.length > 1) {
      let mejor = 1;
      let dif = Infinity;
      for (let i = 1; i < palabras.length; i++) {
        const d = Math.abs(palabras.slice(0, i).join(" ").length - palabras.slice(i).join(" ").length);
        if (d < dif) {
          dif = d;
          mejor = i;
        }
      }
      lineas = [palabras.slice(0, mejor).join(" "), palabras.slice(mejor).join(" ")];
    }
    const fuente = "800 56px system-ui, sans-serif";
    const medidor = document.createElement("canvas").getContext("2d");
    let w = 220;
    if (medidor) {
      medidor.font = fuente;
      w = Math.ceil(Math.max(...lineas.map((l) => medidor.measureText(l).width))) + 44;
    }
    const h = 48 + lineas.length * 66;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    if (g) {
      g.font = fuente;
      g.fillStyle = "rgba(4,10,22,0.9)";
      g.strokeStyle = col;
      g.lineWidth = resalta ? 7 : 4;
      g.beginPath();
      g.roundRect(4, 4, w - 8, h - 8, 44);
      g.fill();
      g.stroke();
      g.fillStyle = "#ffffff";
      g.textAlign = "center";
      g.textBaseline = "middle";
      lineas.forEach((l, i) => g.fillText(l, w / 2, 24 + 33 + i * 66 + 4));
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return { tex: t, ancho: w * 0.0042, alto: h * 0.0042 };
  }, [texto, col, resalta]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <sprite position={[pos[0], pos[1], pos[2]]} scale={[ancho, alto, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} />
    </sprite>
  );
}
