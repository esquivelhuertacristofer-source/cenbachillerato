"use client";

/**
 * EL ÁTOMO DE BOHR (1913): hidrógeno con órbitas de radio r = n²·a₀.
 *
 * El electrón SALTA de una órbita a otra (no recorre el camino intermedio) y
 * en cada salto entra o sale un fotón cuya energía es exactamente la
 * diferencia entre niveles: ΔE = hc/λ. El fotón se dibuja como un paquete de
 * onda con su color real (si es visible) y su número de oscilaciones crece al
 * acortarse λ. Las órbitas no son líneas: son anillos con volumen y brillo.
 */
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Etiqueta, Halo, ELECTRON_COLOR, PROTON_COLOR } from "./modelos-atomicos-kit3d";
import { texturaDestello } from "./modelos-atomicos-texturas";
import { N_MAX_BOHR, colorDeLongitud, energiaBohr, longitudOndaNm, regionEspectral, serieEspectral } from "./modelos-atomicos-fisica";

export interface TransicionBohr {
  de: number;
  a: number;
  id: number;
}

/** Radio de la órbita n en unidades de escena (proporcional a n²). */
export const radioOrbita = (n: number): number => 0.14 * n * n;

/** Curva de un paquete de onda: seno bajo una envolvente gaussiana. */
class CurvaPaquete extends THREE.Curve<THREE.Vector3> {
  constructor(private largo: number, private amp: number, private ciclos: number) {
    super();
  }
  override getPoint(t: number, opt = new THREE.Vector3()): THREE.Vector3 {
    const env = Math.exp(-Math.pow((t - 0.5) / 0.28, 2));
    return opt.set((t - 0.5) * this.largo, this.amp * env * Math.sin(2 * Math.PI * this.ciclos * t), 0);
  }
}

function fmtE(e: number) {
  return e.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AtomoBohr({ nivel, transicion, ligero }: { nivel: number; transicion: TransicionBohr | null; ligero: boolean }) {
  const electron = useRef<THREE.Group>(null);
  const foton = useRef<THREE.Group>(null);
  const destello = useRef<THREE.Sprite>(null);
  const anillos = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const st = useRef({ nivel, ang: 0.6, fase: "nada" as "nada" | "llega" | "sale", t0: 0, ox: 0, oz: 0, dx: 0, dz: 0, flash: 0, pendiente: false, ultimo: -1 });

  const nm = transicion ? longitudOndaNm(transicion.de, transicion.a) : 0;
  const colorFoton = transicion ? colorDeLongitud(nm) : "#ffffff";

  const geoFoton = useMemo(() => {
    if (!transicion) return null;
    const ciclos = Math.min(16, 3 + 2600 / nm);
    return new THREE.TubeGeometry(new CurvaPaquete(1.5, 0.13, ciclos), 220, 0.022, 8, false);
  }, [transicion, nm]);
  useEffect(() => () => geoFoton?.dispose(), [geoFoton]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const s = st.current;
    const t = state.clock.elapsedTime;
    // Un salto nuevo: emisión (baja) → el electrón ya está abajo y sale el fotón;
    // absorción (sube) → llega el fotón y, al tocarlo, el electrón salta.
    if (transicion && transicion.id !== s.ultimo) {
      s.ultimo = transicion.id;
      s.t0 = -1;
      if (transicion.a < transicion.de) {
        s.nivel = transicion.a;
        s.fase = "sale";
        s.flash = 1;
        s.pendiente = false;
      } else {
        s.fase = "llega";
        s.pendiente = true;
      }
    }
    if (s.fase === "nada" && s.nivel !== nivel && !s.pendiente) s.nivel = nivel; // cambio directo (reinicio)
    // El electrón: más lento cuanto más lejos (ω ∝ 1/n² aquí, para que se vea)
    s.ang += dt * (2.6 / (s.nivel * s.nivel) + 0.18);
    const r = radioOrbita(s.nivel);
    const ex = r * Math.cos(s.ang), ez = -r * Math.sin(s.ang);
    if (electron.current) electron.current.position.set(ex, 0, ez);

    // Anillos: el actual brilla
    anillos.current.forEach((m, i) => {
      if (!m) return;
      const objetivo = i + 1 === s.nivel ? 1.6 : 0.35;
      m.emissiveIntensity += (objetivo - m.emissiveIntensity) * Math.min(1, dt * 6);
      m.opacity += ((i + 1 === s.nivel ? 0.95 : 0.5) - m.opacity) * Math.min(1, dt * 6);
    });

    // Fotón
    const f = foton.current;
    if (f) {
      if (s.fase === "nada") f.visible = false;
      else {
        if (s.t0 < 0) {
          s.t0 = t;
          // dirección: hacia afuera desde el electrón, un poco hacia la cámara
          const rr = Math.hypot(ex, ez) || 1;
          s.dx = ex / rr; s.dz = ez / rr;
          s.ox = ex; s.oz = ez;
        }
        const u = (t - s.t0) / 1.5;
        f.visible = true;
        if (s.fase === "sale") {
          const dist = u * 5.5;
          f.position.set(s.ox + s.dx * dist, u * 1.2, s.oz + s.dz * dist);
          f.rotation.set(0, Math.atan2(-s.dz, s.dx), 0);
          if (u >= 1) { s.fase = "nada"; f.visible = false; }
        } else {
          // llega desde lejos y persigue al electrón
          const lejos = 6.5;
          const sx = s.ox + s.dx * lejos, sy = 1.6, sz = s.oz + s.dz * lejos;
          const k = Math.min(1, u * 1.15);
          f.position.set(sx + (ex - sx) * k, sy * (1 - k), sz + (ez - sz) * k);
          f.rotation.set(0, Math.atan2(-(ez - sz), ex - sx), 0);
          if (k >= 1) {
            s.fase = "nada";
            f.visible = false;
            s.pendiente = false;
            s.nivel = nivel;
            s.flash = 1;
          }
        }
      }
    }
    // Destello del salto
    s.flash = Math.max(0, s.flash - dt * 1.6);
    const d = destello.current;
    if (d) {
      d.visible = s.flash > 0.01;
      const rr = radioOrbita(s.nivel);
      d.position.set(rr * Math.cos(s.ang), 0, -rr * Math.sin(s.ang));
      const e = 0.25 + (1 - s.flash) * 1.4;
      d.scale.set(e, e, e);
      (d.material as THREE.SpriteMaterial).opacity = s.flash;
    }
  });

  const texDestello = useMemo(() => texturaDestello(), []);
  const orbitas = useMemo(() => Array.from({ length: N_MAX_BOHR }, (_, i) => i + 1), []);
  const region = transicion ? regionEspectral(nm) : "visible";
  const textoFoton = transicion
    ? `${transicion.a < transicion.de ? "Emite" : "Absorbe"} ${Math.round(nm).toLocaleString("es-MX")} nm · ${region === "visible" ? serieEspectral(Math.min(transicion.de, transicion.a)) : region}`
    : "";

  return (
    <group>
      {/* Núcleo: un protón */}
      <mesh castShadow>
        <sphereGeometry args={[0.05, 32, 24]} />
        <meshPhysicalMaterial color={PROTON_COLOR} emissive="#ff3b2a" emissiveIntensity={1.2} roughness={0.3} clearcoat={1} />
      </mesh>
      <Halo color="#ff6b5a" escala={0.5} opacidad={0.55} />

      {/* Órbitas permitidas, r ∝ n² */}
      {orbitas.map((n) => (
        <mesh key={n} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radioOrbita(n), 0.008 + 0.0035 * n, 10, ligero ? 128 : 220]} />
          <meshStandardMaterial
            ref={(m) => { anillos.current[n - 1] = m; }}
            color="#bfe6ff"
            emissive="#4cb6ff"
            emissiveIntensity={0.35}
            roughness={0.4}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}

      {/* Electrón */}
      <group ref={electron}>
        <mesh>
          <sphereGeometry args={[0.055, 24, 18]} />
          <meshPhysicalMaterial color={ELECTRON_COLOR} emissive="#2aa8ff" emissiveIntensity={1.6} roughness={0.2} clearcoat={1} />
        </mesh>
        <Halo color="#6fd0ff" escala={0.42} opacidad={0.7} />
      </group>
      <sprite ref={destello} visible={false}>
        <spriteMaterial map={texDestello} color="#e8f6ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      {/* Fotón: paquete de onda con el color de su longitud de onda */}
      <group ref={foton} visible={false}>
        {geoFoton && (
          <mesh geometry={geoFoton}>
            <meshStandardMaterial color="#000000" emissive={colorFoton} emissiveIntensity={region === "visible" ? 3.2 : 1.6} />
          </mesh>
        )}
        {geoFoton && <Halo color={colorFoton} escala={1.1} opacidad={0.35} />}
      </group>

      <Etiqueta pos={[radioOrbita(nivel), 0, 0]} color="#5BC8FF" lado="right">
        n = {nivel} · E = {fmtE(energiaBohr(nivel))} eV
      </Etiqueta>
      {transicion && (
        <Etiqueta pos={[0, radioOrbita(Math.max(transicion.de, transicion.a)) * 0.45 + 0.35, 0]} color={colorFoton}>
          {textoFoton}
        </Etiqueta>
      )}
    </group>
  );
}
