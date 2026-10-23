"use client";
// =============================================================================
// Lienzo 3D del EXPLORADOR ESPACIAL: monta una de sus dos vistas
//   • «sistema»: el Sol y los ocho planetas (ExploradorSistemaSolar);
//   • «tierra»: la Tierra, la Luna y el Sol de cerca (ExploradorTierraLuna).
// El brillo (bloom) y el tono de color son los mismos para las dos.
// =============================================================================

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { MundoSistema, type SistemaProps } from "./ExploradorSistemaSolar";
import { MundoTierra, type TierraProps } from "./ExploradorTierraLuna";

export type ModoEspacio = "sistema" | "tierra";

export type ExploradorEspacialSceneProps = { modo: ModoEspacio } & SistemaProps & Omit<TierraProps, keyof SistemaProps>;

export function ExploradorEspacialScene(p: ExploradorEspacialSceneProps) {
  return (
    <Canvas
      key={p.modo}
      dpr={[1, 2]}
      camera={{ fov: 42, near: 0.01, far: 4000, position: [14, 6, 26] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ background: "#02040a", touchAction: "none" }}
    >
      <Suspense fallback={null}>
        {p.modo === "sistema" ? <MundoSistema {...p} /> : <MundoTierra {...p} />}
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur intensity={0.9} luminanceThreshold={1.0} luminanceSmoothing={0.2} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
