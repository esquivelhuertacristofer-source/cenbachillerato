"use client";
// =============================================================================
// Sistema Solar — el lienzo 3D. Monta una de sus dos escenas:
//   • la VITRINA (Explorador y Periodos): el Sol y los ocho planetas;
//   • la ÓRBITA DE KEPLER (Áreas y Rapidez): una elipse con el Sol en un foco.
// Entre Explorador y Periodos el lienzo NO se rehace (las texturas ya están
// cargadas); entre vitrina y órbita sí (key).
// Celular / táctil: sin postproceso (las texturas ya bajan a 2K).
// =============================================================================

import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { MundoVitrina, type VitrinaProps } from "./sistema-solar-vitrina";
import { MundoElipse, type ElipseProps } from "./sistema-solar-elipse";

export type EscenaSistemaSolarProps =
  | ({ grupo: "vitrina" } & VitrinaProps)
  | ({ grupo: "elipse" } & ElipseProps);

function Post({ ligero }: { ligero: boolean }) {
  const [debil, setDebil] = useState(false);
  return (
    <>
      <PerformanceMonitor onDecline={() => setDebil(true)} />
      {!ligero && !debil && (
        <EffectComposer enableNormalPass={false} multisampling={4}>
          <Bloom mipmapBlur intensity={0.9} luminanceThreshold={1.05} luminanceSmoothing={0.25} />
          <Vignette eskil={false} offset={0.25} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  );
}

export default function EscenaSistemaSolar(props: EscenaSistemaSolarProps) {
  const ligero = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(pointer: coarse)").matches || window.innerWidth < 640;
  }, []);
  return (
    <Canvas
      key={props.grupo}
      dpr={[1, 1.75]}
      camera={{ fov: 42, near: 0.05, far: 4000, position: [0, 140, 220] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ background: "#02040a", touchAction: "none" }}
    >
      <Suspense fallback={null}>
        {props.grupo === "vitrina" ? <MundoVitrina {...props} /> : <MundoElipse {...props} />}
        <Post ligero={ligero} />
      </Suspense>
    </Canvas>
  );
}
