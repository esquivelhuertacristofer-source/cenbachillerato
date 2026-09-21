"use client";

/**
 * Escena 3D del laboratorio "Archivo de fuentes históricas" (CH-III-P02).
 * Cuatro vistas sobre la misma sala de investigación:
 *
 *  - ficha: el documento en un atril sobre la mesa del archivo, con lámpara y
 *    cajas de expedientes. Se voltea para ver el reverso y la lupa recorre la
 *    zona que el alumno examina (lo que se ve dentro de la lupa es el mismo
 *    documento ampliado).
 *  - tablero: el corcho con las siete fuentes y la afirmación al centro; los
 *    hilos verdes (corrobora) y rojos (contradice) se tienden desde cada
 *    fuente. La carta falsa se trae al frente para revisarla con la lupa.
 *  - foto: la fotografía de 1938 en su atril con la máscara del recorte que usó
 *    la publicación viral, y el teléfono con la publicación (original o
 *    corregida).
 *  - balanza: las evidencias elegidas pesan contra la «carga de la prueba».
 *
 * Los documentos se dibujan en lienzos 2D (CanvasTexture). Toda animación
 * ocurre en useFrame mutando refs. NO se usa <Text> de drei: el texto flotante
 * va en <Html>.
 */

import * as THREE from "three";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  type SoporteId,
  type ZonaId,
  type FuenteId,
  type Hilos,
  type VeredictoId,
  type Documento,
  DOCUMENTOS,
  FUENTES_TABLERO,
  FUENTE_DEF,
  FRAGMENTOS_FALSA,
  AFIRMACIONES,
  VEREDICTOS,
  POST,
  PIE_ORIGINAL,
  SELLO_FOTO,
  PESO_INTERP,
  PESO_MINIMO,
  mulberry32,
} from "./archivo-fuentes-data";

export type VistaArchivo = "ficha" | "tablero" | "foto" | "balanza";

export interface ArchivoSceneProps {
  vista: VistaArchivo;
  modoColor: string;
  resetNonce: number;
  // Ficha
  docId: SoporteId;
  volteado: boolean;
  zona: ZonaId | null;
  zonasVistas: ZonaId[];
  fichaCompleta: boolean;
  // Tablero
  afirmacionId: string;
  hilos: Hilos;
  fuenteSel: FuenteId | null;
  veredicto: VeredictoId | null;
  lupaFalsa: boolean;
  fragSel: number | null;
  examinados: number[];
  // Foto
  sinRecorte: number;
  fotoVolteada: boolean;
  publicado: string | null;
  // Balanza
  tesisOk: boolean | null;
  sostienen: FuenteId[];
  matiz: FuenteId | null;
  peso: number;
  lista: boolean;
}

type Pt = [number, number, number];
type Rect = { x: number; y: number; w: number; h: number };

const suave = (dt: number, porCuadro: number) => 1 - Math.pow(1 - porCuadro, Math.min(dt, 0.25) * 60);
const VERDE = "#22c55e";
const ROJO = "#ef4444";

const MANO = "'Segoe Script', 'Bradley Hand', 'Comic Sans MS', cursive";
const MAQUINA = "'Courier New', Courier, monospace";
const DIARIO = "Georgia, 'Times New Roman', serif";

/* ── Utilidades de lienzo ─────────────────────────────────────────────── */

function lienzo(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
}

function texturaDe(c: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function useLibera(obj: { dispose: () => void }) {
  useEffect(() => () => obj.dispose(), [obj]);
}

function envolver(ctx: CanvasRenderingContext2D, texto: string, maxW: number): string[] {
  const palabras = texto.split(" ");
  const lineas: string[] = [];
  let actual = "";
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (ctx.measureText(prueba).width > maxW && actual) {
      lineas.push(actual);
      actual = p;
    } else actual = prueba;
  }
  if (actual) lineas.push(actual);
  return lineas;
}

/** Escribe un párrafo y devuelve la y siguiente. */
function parrafo(ctx: CanvasRenderingContext2D, texto: string, x: number, y: number, maxW: number, lh: number, max = 99): number {
  const lineas = envolver(ctx, texto, maxW);
  lineas.slice(0, max).forEach((l, i) => {
    const ultima = i === max - 1 && lineas.length > max;
    ctx.fillText(ultima ? `${l.replace(/\s+\S*$/, "")}…` : l, x, y + i * lh);
  });
  return y + Math.min(lineas.length, max) * lh;
}

function norm(x: number, y: number, w: number, h: number, W: number, H: number): Rect {
  return { x: x / W, y: y / H, w: w / W, h: h / H };
}

function grano(ctx: CanvasRenderingContext2D, W: number, H: number, semilla: number, n = 1400, alfa = 0.05) {
  const rnd = mulberry32(semilla);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = `rgba(60,40,20,${alfa * rnd()})`;
    ctx.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 2);
  }
}

function sello(ctx: CanvasRenderingContext2D, lineas: string[], cx: number, cy: number, col: string, giro = -0.12, fs = 26) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(giro);
  ctx.font = `900 ${fs}px ${MAQUINA}`;
  const w = Math.max(...lineas.map((l) => ctx.measureText(l).width)) + 40;
  const h = lineas.length * (fs + 8) + 24;
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.78;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.strokeRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12);
  ctx.fillStyle = col;
  ctx.textAlign = "center";
  lineas.forEach((l, i) => ctx.fillText(l, 0, -h / 2 + 22 + fs * 0.8 + i * (fs + 8)));
  ctx.restore();
}

/* ── Documentos del expediente ────────────────────────────────────────── */

const DW = 900;
const DH = 1200;

interface DocDibujado {
  canvas: HTMLCanvasElement;
  rects: Partial<Record<ZonaId, Rect>>;
}

function dibujarFrente(doc: Documento): DocDibujado {
  const [c, ctx] = lienzo(DW, DH);
  const rects: Partial<Record<ZonaId, Rect>> = {};
  ctx.fillStyle = doc.papel;
  ctx.fillRect(0, 0, DW, DH);
  ctx.textBaseline = "alphabetic";
  const z = doc.zonas;

  if (doc.id === "carta") {
    ctx.strokeStyle = "rgba(90,130,190,0.28)";
    ctx.lineWidth = 2;
    for (let y = 206; y < DH - 40; y += 48) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(DW - 30, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(200,70,70,0.35)";
    ctx.beginPath();
    ctx.moveTo(92, 0);
    ctx.lineTo(92, DH);
    ctx.stroke();
    for (const y of [150, 600, 1050]) {
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.arc(46, y, 14, 0, Math.PI * 2);
      ctx.fill();
    }
    rects.membrete = norm(100, 20, 780, 110, DW, DH);
    ctx.fillStyle = doc.tinta;
    ctx.font = `36px ${MANO}`;
    ctx.textAlign = "right";
    const wf = ctx.measureText(z.fecha).width;
    ctx.fillText(z.fecha, DW - 60, 190);
    rects.fecha = norm(DW - 70 - wf, 140, wf + 20, 70, DW, DH);
    ctx.textAlign = "left";
    ctx.font = `38px ${MANO}`;
    ctx.fillText(z.destinatario, 120, 286);
    rects.destinatario = norm(110, 240, ctx.measureText(z.destinatario).width + 24, 66, DW, DH);
    ctx.font = `30px ${MANO}`;
    const fin = parrafo(ctx, z.cuerpo, 120, 382, DW - 190, 48);
    rects.cuerpo = norm(110, 336, DW - 170, fin - 336, DW, DH);
    ctx.textAlign = "right";
    ctx.font = `30px ${MANO}`;
    ctx.fillText("Tu hermano que te quiere,", DW - 80, fin + 64);
    ctx.font = `44px ${MANO}`;
    ctx.fillText("Anselmo Ruiz", DW - 80, fin + 128);
    ctx.font = `28px ${MANO}`;
    ctx.fillText("obrero de la refinería", DW - 80, fin + 176);
    rects.firma = norm(DW - 520, fin + 20, 460, 180, DW, DH);
  } else if (doc.id === "periodico") {
    ctx.fillStyle = doc.tinta;
    ctx.textAlign = "center";
    let fsM = 84;
    ctx.font = `900 ${fsM}px ${DIARIO}`;
    while (ctx.measureText("EL PUEBLO EN MARCHA").width > DW - 100 && fsM > 40) {
      fsM -= 2;
      ctx.font = `900 ${fsM}px ${DIARIO}`;
    }
    ctx.fillText("EL PUEBLO EN MARCHA", DW / 2, 122);
    ctx.font = `italic 28px ${DIARIO}`;
    ctx.fillText("Diario de la mañana · Año IV, núm. 1203", DW / 2, 168);
    ctx.fillRect(40, 188, DW - 80, 5);
    ctx.fillRect(40, 198, DW - 80, 2);
    rects.membrete = norm(40, 50, DW - 80, 150, DW, DH);
    ctx.font = `24px ${DIARIO}`;
    ctx.textAlign = "left";
    ctx.fillText(z.fecha, 48, 236);
    rects.fecha = norm(40, 206, ctx.measureText(z.fecha).width + 20, 44, DW, DH);
    ctx.textAlign = "right";
    ctx.fillText(z.destinatario, DW - 48, 236);
    const wd = ctx.measureText(z.destinatario).width;
    rects.destinatario = norm(DW - 58 - wd, 206, wd + 20, 44, DW, DH);
    ctx.fillRect(40, 252, DW - 80, 2);
    ctx.textAlign = "center";
    ctx.font = `900 60px ${DIARIO}`;
    const [titular, ...resto] = z.cuerpo.split("! ");
    let y = parrafo(ctx, `${titular}!`, DW / 2, 330, DW - 90, 64);
    ctx.textAlign = "left";
    ctx.font = `30px ${DIARIO}`;
    y = parrafo(ctx, resto.join("! "), 56, y + 30, DW - 112, 42);
    rects.cuerpo = norm(40, 272, DW - 80, y - 272, DW, DH);
    ctx.font = `italic 26px ${DIARIO}`;
    ctx.textAlign = "right";
    ctx.fillText("De nuestra Redacción", DW - 56, y + 24);
    rects.firma = norm(DW - 340, y - 8, 300, 50, DW, DH);
    // Columnas de relleno y un grabado
    ctx.fillStyle = "rgba(20,20,20,0.16)";
    for (let k = 0; k < 3; k++) {
      const x0 = 48 + k * 276;
      for (let l = 0; l < 13; l++) ctx.fillRect(x0, y + 90 + l * 26, 250 - ((l * 37 + k * 11) % 60), 10);
    }
    ctx.fillStyle = "rgba(20,20,20,0.55)";
    ctx.fillRect(48, y + 450, 250, 8);
  } else if (doc.id === "boletin") {
    // Logotipo: torre de perforación
    ctx.strokeStyle = doc.tinta;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(60, 170);
    ctx.lineTo(100, 50);
    ctx.lineTo(140, 170);
    ctx.moveTo(72, 135);
    ctx.lineTo(128, 135);
    ctx.moveTo(84, 98);
    ctx.lineTo(116, 98);
    ctx.moveTo(72, 135);
    ctx.lineTo(116, 98);
    ctx.moveTo(128, 135);
    ctx.lineTo(84, 98);
    ctx.stroke();
    ctx.fillStyle = doc.tinta;
    ctx.textAlign = "left";
    ctx.font = `900 40px ${DIARIO}`;
    ctx.fillText("COMPAÑÍA PETROLERA DEL GOLFO", 170, 108);
    ctx.font = `26px ${DIARIO}`;
    ctx.fillText("Oficina de Relaciones Públicas · Nueva York", 172, 150);
    ctx.fillRect(40, 190, DW - 80, 3);
    rects.membrete = norm(40, 40, DW - 80, 160, DW, DH);
    ctx.font = `800 26px ${MAQUINA}`;
    ctx.strokeStyle = doc.tinta;
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 222, DW - 96, 56);
    ctx.fillText(z.destinatario.toUpperCase(), 66, 260);
    rects.destinatario = norm(40, 214, DW - 80, 72, DW, DH);
    ctx.textAlign = "right";
    ctx.font = `28px ${MAQUINA}`;
    ctx.fillText(z.fecha, DW - 56, 346);
    const wf = ctx.measureText(z.fecha).width;
    rects.fecha = norm(DW - 66 - wf, 312, wf + 20, 50, DW, DH);
    ctx.textAlign = "left";
    ctx.font = `29px ${MAQUINA}`;
    const fin = parrafo(ctx, z.cuerpo, 60, 430, DW - 120, 46);
    rects.cuerpo = norm(48, 390, DW - 96, fin - 390, DW, DH);
    ctx.fillRect(DW - 480, fin + 90, 420, 2);
    ctx.font = `26px ${MAQUINA}`;
    ctx.fillText(z.firma, DW - 480, fin + 128);
    rects.firma = norm(DW - 500, fin + 60, 460, 90, DW, DH);
  } else {
    // Telegrama: formulario con tiras pegadas
    ctx.strokeStyle = "#7c5d2a";
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, DW - 60, DH - 60);
    ctx.fillStyle = "#7c5d2a";
    ctx.textAlign = "center";
    ctx.font = `900 64px ${DIARIO}`;
    ctx.fillText("TELEGRAMA", DW / 2, 112);
    ctx.font = `800 21px ${MAQUINA}`;
    ctx.fillStyle = doc.tinta;
    ctx.fillText(z.membrete, DW / 2, 160);
    ctx.fillStyle = "#b91c1c";
    ctx.fillRect(DW / 2 - 110, 176, 220, 4);
    rects.membrete = norm(40, 56, DW - 80, 134, DW, DH);
    const campo = (etq: string, valor: string, y: number): Rect => {
      ctx.textAlign = "left";
      ctx.fillStyle = "#7c5d2a";
      ctx.font = `700 22px ${DIARIO}`;
      ctx.fillText(etq, 60, y);
      ctx.strokeStyle = "rgba(124,93,42,0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(56, y + 12, DW - 112, 58);
      ctx.fillStyle = doc.tinta;
      ctx.font = `800 27px ${MAQUINA}`;
      ctx.fillText(valor, 74, y + 52);
      return norm(50, y - 24, DW - 100, 100, DW, DH);
    };
    rects.fecha = campo("Lugar, fecha y hora", z.fecha, 240);
    rects.destinatario = campo("Destinatario", z.destinatario, 360);
    ctx.fillStyle = "#7c5d2a";
    ctx.font = `700 22px ${DIARIO}`;
    ctx.fillText("Texto", 60, 480);
    ctx.font = `800 28px ${MAQUINA}`;
    const lineas = envolver(ctx, z.cuerpo, DW - 170);
    lineas.forEach((l, i) => {
      const y = 500 + i * 62;
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(64, y + 4, DW - 124, 48);
      ctx.fillStyle = "#fbfaf3";
      ctx.fillRect(60, y, DW - 124, 48);
      ctx.fillStyle = doc.tinta;
      ctx.fillText(l, 78, y + 35);
    });
    const fin = 500 + lineas.length * 62;
    rects.cuerpo = norm(50, 470, DW - 100, fin - 470, DW, DH);
    ctx.fillStyle = "#7c5d2a";
    ctx.font = `700 22px ${DIARIO}`;
    ctx.fillText("Firma", 60, fin + 60);
    ctx.fillStyle = doc.tinta;
    ctx.font = `800 28px ${MAQUINA}`;
    ctx.fillText(z.firma, 74, fin + 104);
    rects.firma = norm(50, fin + 30, DW - 100, 100, DW, DH);
    sello(ctx, ["CONFIDENCIAL"], DW - 190, fin + 190, "#b91c1c", -0.18, 34);
  }
  grano(ctx, DW, DH, doc.id.length * 97 + 13);
  return { canvas: c, rects };
}

function dibujarReverso(doc: Documento): DocDibujado {
  const [c, ctx] = lienzo(DW, DH);
  const rects: Partial<Record<ZonaId, Rect>> = {};
  ctx.fillStyle = doc.papel;
  ctx.fillRect(0, 0, DW, DH);
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(0, 0, DW, DH);
  ctx.textAlign = "left";

  if (doc.id === "carta") {
    // Sobre
    ctx.fillStyle = "#e2d2ad";
    ctx.fillRect(70, 200, DW - 140, 560);
    ctx.strokeStyle = "rgba(90,60,20,0.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(70, 200);
    ctx.lineTo(DW / 2, 470);
    ctx.lineTo(DW - 70, 200);
    ctx.stroke();
    ctx.fillStyle = "#27325a";
    ctx.font = `40px ${MANO}`;
    ctx.fillText("Sra. Refugio Ruiz", 170, 590);
    ctx.font = `34px ${MANO}`;
    ctx.fillText("San Luis Potosí, S. L. P.", 200, 650);
    // Timbre y matasellos
    ctx.fillStyle = "#9f5f3a";
    ctx.fillRect(DW - 230, 230, 120, 150);
    ctx.fillStyle = "#f3e7c9";
    ctx.font = `800 20px ${DIARIO}`;
    ctx.textAlign = "center";
    ctx.fillText("CORREOS", DW - 170, 290);
    ctx.fillText("MÉXICO", DW - 170, 318);
    ctx.strokeStyle = "rgba(30,30,60,0.8)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(DW - 320, 320, 92, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(30,30,60,0.85)";
    ctx.font = `900 22px ${MAQUINA}`;
    ctx.fillText("MINATITLÁN VER.", DW - 320, 306);
    ctx.font = `900 28px ${MAQUINA}`;
    ctx.fillText("21 MAR 1938", DW - 320, 346);
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      for (let x = 0; x <= 200; x += 10) ctx.lineTo(DW - 520 + x, 280 + k * 22 + Math.sin(x / 18) * 6);
      ctx.stroke();
    }
    rects.reverso = norm(DW - 560, 210, 500, 220, DW, DH);
    // Etiqueta del archivo
    ctx.fillStyle = "#fbfaf5";
    ctx.fillRect(120, 860, DW - 240, 180);
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 2;
    ctx.strokeRect(120, 860, DW - 240, 180);
    ctx.fillStyle = "#1f2937";
    ctx.textAlign = "left";
    ctx.font = `800 26px ${MAQUINA}`;
    ctx.fillText("ARCHIVO · Fondo Correspondencia", 146, 910);
    ctx.font = `26px ${MAQUINA}`;
    ctx.fillText("Donada al archivo por la familia en 1986", 146, 960);
    ctx.fillText("(documento ilustrativo)", 146, 1004);
  } else if (doc.id === "periodico") {
    ctx.fillStyle = "#141414";
    ctx.font = `900 44px ${DIARIO}`;
    ctx.textAlign = "center";
    ctx.fillText("CARTELERA", DW / 2, 110);
    ctx.fillRect(40, 130, DW - 80, 3);
    const anuncios = ["CINE · Función de hoy · 4, 6 y 8 p. m.", "JABÓN DE TOCADOR · El preferido del hogar", "MÁQUINAS DE COSER · Pagos semanales", "SE SOLICITA MECANÓGRAFA · Informes aquí"];
    anuncios.forEach((a, i) => {
      const y = 170 + i * 150;
      ctx.strokeStyle = "#141414";
      ctx.lineWidth = 3;
      ctx.strokeRect(70, y, DW - 140, 120);
      ctx.font = `800 30px ${DIARIO}`;
      ctx.fillText(a, DW / 2, y + 72);
    });
    sello(ctx, ["HEMEROTECA", "EJEMPLAR DE CONSULTA"], DW / 2, 930, "#6d28d9", -0.1, 32);
    rects.reverso = norm(DW / 2 - 290, 820, 580, 220, DW, DH);
  } else if (doc.id === "boletin") {
    ctx.fillStyle = "rgba(60,60,60,0.8)";
    ctx.font = `46px ${MANO}`;
    ctx.fillText("Traducción del inglés", 110, 260);
    ctx.strokeStyle = "rgba(60,60,60,0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(110, 285);
    ctx.lineTo(600, 280);
    ctx.stroke();
    rects.reverso = norm(90, 190, 560, 120, DW, DH);
    sello(ctx, ["COPIA", "COLECCIÓN DE UN", "DESPACHO DE ABOGADOS"], DW / 2 + 40, 640, "#1d4ed8", 0.08, 30);
    ctx.fillStyle = "rgba(60,60,60,0.55)";
    ctx.font = `28px ${MAQUINA}`;
    ctx.textAlign = "left";
    ctx.fillText("(documento ilustrativo)", 110, 1080);
  } else {
    sello(ctx, ["ARCHIVO DIPLOMÁTICO", "DESCLASIFICADO"], DW / 2, 420, "#b91c1c", -0.1, 36);
    ctx.fillStyle = "rgba(60,60,60,0.8)";
    ctx.font = `42px ${MANO}`;
    ctx.textAlign = "left";
    ctx.fillText("Descifrado el 19-III-1938", 150, 690);
    rects.reverso = norm(DW / 2 - 330, 280, 660, 460, DW, DH);
    ctx.font = `28px ${MAQUINA}`;
    ctx.fillStyle = "rgba(60,60,60,0.55)";
    ctx.fillText("(documento ilustrativo)", 150, 1080);
  }
  grano(ctx, DW, DH, doc.id.length * 131 + 7);
  return { canvas: c, rects };
}

/* ── Fotografía de la colecta (recreación ilustrativa) ─────────────────── */

const FW = 1200;
const FH = 800;
/** Recorte que usó la publicación viral (fracciones de la foto). */
const RECORTE: Rect = { x: 0.03, y: 0.3, w: 0.46, h: 0.66 };

function dibujarFoto(): HTMLCanvasElement {
  const [c, ctx] = lienzo(FW, FH);
  const rnd = mulberry32(1938);
  const cielo = ctx.createLinearGradient(0, 0, 0, FH * 0.45);
  cielo.addColorStop(0, "#d8c7a4");
  cielo.addColorStop(1, "#c7b38c");
  ctx.fillStyle = cielo;
  ctx.fillRect(0, 0, FW, FH);
  // Palacio de Bellas Artes (silueta): fachada, arcos y cúpulas
  ctx.fillStyle = "#b9a37c";
  ctx.fillRect(120, 250, FW - 240, 260);
  ctx.fillStyle = "#a88f66";
  for (let k = 0; k < 14; k++) ctx.fillRect(150 + k * 66, 280, 14, 220);
  ctx.fillStyle = "#8a7350";
  ctx.beginPath();
  ctx.ellipse(FW / 2, 250, 170, 150, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(FW / 2 - 12, 80, 24, 40);
  ctx.beginPath();
  ctx.ellipse(FW / 2, 118, 40, 30, 0, Math.PI, 0);
  ctx.fill();
  for (const x of [330, FW - 330]) {
    ctx.beginPath();
    ctx.ellipse(x, 250, 70, 60, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.fillStyle = "#6f5b3d";
  ctx.beginPath();
  ctx.ellipse(FW / 2, 440, 90, 120, 0, Math.PI, 0);
  ctx.fill();
  // Suelo
  ctx.fillStyle = "#9c8762";
  ctx.fillRect(0, 500, FW, FH - 500);
  // Letrero de la colecta
  ctx.fillStyle = "#efe6d0";
  ctx.fillRect(640, 330, 500, 74);
  ctx.strokeStyle = "#4a3b25";
  ctx.lineWidth = 3;
  ctx.strokeRect(640, 330, 500, 74);
  ctx.fillStyle = "#3a2d1a";
  ctx.font = `900 27px ${DIARIO}`;
  ctx.textAlign = "center";
  ctx.fillText("COLECTA PARA LA DEUDA PETROLERA", 890, 377);
  // Señores que reciben los donativos, detrás de la mesa (sombrero, saco y camisa)
  for (const x of [800, 940, 1080]) {
    ctx.fillStyle = "#3a3024";
    ctx.beginPath();
    ctx.moveTo(x - 50, 590);
    ctx.lineTo(x - 44, 462);
    ctx.quadraticCurveTo(x, 440, x + 44, 462);
    ctx.lineTo(x + 50, 590);
    ctx.fill();
    ctx.fillStyle = "#e6dcc6";
    ctx.beginPath();
    ctx.moveTo(x - 12, 452);
    ctx.lineTo(x, 500);
    ctx.lineTo(x + 12, 452);
    ctx.fill();
    ctx.fillStyle = "#c9a97f";
    ctx.beginPath();
    ctx.arc(x, 424, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2a2219";
    ctx.beginPath();
    ctx.ellipse(x, 404, 38, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 20, 380, 40, 24);
  }
  // Mesa de donativos: mantel, canastas, gallinas, cajitas y monedas
  ctx.fillStyle = "#ece3cd";
  ctx.fillRect(690, 572, 480, 28);
  ctx.fillStyle = "#dcd0b3";
  ctx.fillRect(690, 600, 480, 150);
  ctx.strokeStyle = "rgba(90,70,40,0.35)";
  ctx.lineWidth = 3;
  for (let k = 1; k < 8; k++) {
    ctx.beginPath();
    ctx.moveTo(690 + k * 60, 604);
    ctx.lineTo(690 + k * 60 + 6, 748);
    ctx.stroke();
  }
  const gallina = (gx: number, gy: number, esc = 1) => {
    ctx.fillStyle = "#f4efe2";
    ctx.beginPath();
    ctx.ellipse(gx, gy, 30 * esc, 20 * esc, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(gx - 26 * esc, gy - 6 * esc);
    ctx.lineTo(gx - 44 * esc, gy - 26 * esc);
    ctx.lineTo(gx - 34 * esc, gy + 4 * esc);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(gx + 24 * esc, gy - 18 * esc, 11 * esc, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8f2f22";
    ctx.fillRect(gx + 20 * esc, gy - 34 * esc, 10 * esc, 8 * esc);
    ctx.fillStyle = "#b7832d";
    ctx.beginPath();
    ctx.moveTo(gx + 34 * esc, gy - 20 * esc);
    ctx.lineTo(gx + 44 * esc, gy - 16 * esc);
    ctx.lineTo(gx + 34 * esc, gy - 13 * esc);
    ctx.fill();
  };
  const canasta = (bx: number, by: number, esc = 1) => {
    ctx.fillStyle = "#6f5332";
    ctx.beginPath();
    ctx.ellipse(bx, by, 40 * esc, 20 * esc, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = "#8d6c43";
    ctx.beginPath();
    ctx.ellipse(bx, by, 40 * esc, 9 * esc, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6f5332";
    ctx.lineWidth = 4 * esc;
    ctx.beginPath();
    ctx.ellipse(bx, by - 2, 30 * esc, 26 * esc, 0, Math.PI, 0);
    ctx.stroke();
  };
  canasta(740, 572);
  gallina(850, 552);
  canasta(960, 572);
  gallina(1080, 552);
  for (let k = 0; k < 4; k++) {
    ctx.fillStyle = "#2e2418";
    ctx.fillRect(1000 + k * 26, 556, 20, 14);
    ctx.fillStyle = "#e9dcb8";
    ctx.beginPath();
    ctx.ellipse(770 + k * 18, 566, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Fila de mujeres (de atrás hacia adelante)
  const mujer = (x: number, base: number, h: number, i: number, gesto: "gallina" | "caja" | "canasta" | "nada") => {
    const falda = ["#2f261c", "#4a3b2a", "#3a2f22", "#5a4833"][i % 4]!;
    const blusa = ["#cdbb98", "#b8a27c", "#d8c8a8", "#a8906a"][(i + 1) % 4]!;
    ctx.fillStyle = falda;
    ctx.beginPath();
    ctx.moveTo(x - 0.11 * h, base - 0.55 * h);
    ctx.lineTo(x + 0.11 * h, base - 0.55 * h);
    ctx.lineTo(x + 0.18 * h, base);
    ctx.lineTo(x - 0.18 * h, base);
    ctx.fill();
    ctx.fillStyle = blusa;
    ctx.fillRect(x - 0.1 * h, base - 0.82 * h, 0.2 * h, 0.29 * h);
    // Rebozo cruzado
    ctx.fillStyle = "#5e4a33";
    ctx.beginPath();
    ctx.moveTo(x - 0.12 * h, base - 0.84 * h);
    ctx.lineTo(x + 0.12 * h, base - 0.84 * h);
    ctx.lineTo(x + 0.12 * h, base - 0.74 * h);
    ctx.lineTo(x - 0.06 * h, base - 0.5 * h);
    ctx.lineTo(x - 0.13 * h, base - 0.56 * h);
    ctx.fill();
    ctx.strokeStyle = "rgba(230,215,180,0.45)";
    ctx.lineWidth = Math.max(1, 0.008 * h);
    for (let k = 1; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(x - 0.12 * h, base - (0.84 - k * 0.035) * h);
      ctx.lineTo(x + 0.12 * h, base - (0.84 - k * 0.035) * h);
      ctx.stroke();
    }
    const cy = base - 0.9 * h;
    const r = 0.075 * h;
    ctx.fillStyle = "#cfae84";
    ctx.beginPath();
    ctx.arc(x, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1f1811";
    ctx.beginPath();
    ctx.arc(x, cy - 0.2 * r, r * 1.02, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - 0.8 * r, cy - 0.3 * r, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = blusa;
    ctx.lineWidth = 0.05 * h;
    ctx.lineCap = "round";
    if (gesto === "gallina" || gesto === "caja") {
      ctx.beginPath();
      ctx.moveTo(x + 0.09 * h, base - 0.78 * h);
      ctx.lineTo(x + 0.17 * h, base - 1.02 * h);
      ctx.stroke();
      if (gesto === "gallina") gallina(x + 0.19 * h, base - 1.08 * h, h / 260);
      else {
        ctx.fillStyle = "#2e2418";
        ctx.fillRect(x + 0.13 * h, base - 1.12 * h, 0.09 * h, 0.07 * h);
      }
    } else if (gesto === "canasta") {
      ctx.beginPath();
      ctx.moveTo(x + 0.09 * h, base - 0.78 * h);
      ctx.lineTo(x + 0.16 * h, base - 0.56 * h);
      ctx.stroke();
      canasta(x + 0.18 * h, base - 0.52 * h, h / 320);
    }
    ctx.lineCap = "butt";
  };
  const gestos = ["nada", "gallina", "nada", "caja", "canasta", "nada", "gallina", "canasta", "caja"] as const;
  let n = 0;
  for (const [base, h, x0, paso] of [
    [600, 150, 70, 64],
    [680, 190, 40, 76],
    [775, 235, 20, 92],
  ] as const) {
    for (let x = x0 + rnd() * 10; x < 640; x += paso + rnd() * 12) {
      mujer(x, base, h * (0.94 + rnd() * 0.1), n, gestos[n % gestos.length]!);
      n++;
    }
  }
  // Una señora entrega su gallina en la mesa
  mujer(655, 790, 250, 3, "nada");
  gallina(700, 610, 0.9);
  // Tono sepia y viñeta
  ctx.fillStyle = "rgba(112,76,32,0.18)";
  ctx.fillRect(0, 0, FW, FH);
  const vin = ctx.createRadialGradient(FW / 2, FH / 2, FH * 0.35, FW / 2, FH / 2, FH * 0.95);
  vin.addColorStop(0, "rgba(0,0,0,0)");
  vin.addColorStop(1, "rgba(40,25,10,0.5)");
  ctx.fillStyle = vin;
  ctx.fillRect(0, 0, FW, FH);
  grano(ctx, FW, FH, 38, 5000, 0.09);
  return c;
}

function dibujarReversoFoto(): HTMLCanvasElement {
  const [c, ctx] = lienzo(FW, FH);
  ctx.fillStyle = "#efe7d3";
  ctx.fillRect(0, 0, FW, FH);
  ctx.fillStyle = "#2f3a5e";
  ctx.font = `40px ${MANO}`;
  ctx.textAlign = "left";
  parrafo(ctx, PIE_ORIGINAL, 90, 200, FW - 180, 66);
  sello(ctx, SELLO_FOTO.split(" · "), FW - 330, 600, "#7c2d12", -0.08, 28);
  grano(ctx, FW, FH, 77);
  return c;
}

function dibujarTelefono(foto: HTMLCanvasElement, publicado: string | null): HTMLCanvasElement {
  const W = 540;
  const H = 1080;
  const [c, ctx] = lienzo(W, H);
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, W, 70);
  ctx.fillStyle = "#fff";
  ctx.font = `800 26px system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(publicado ? "Publicación corregida" : "Tendencias", 28, 46);
  // Encabezado de la cuenta
  ctx.fillStyle = publicado ? "#7c3aed" : "#f97316";
  ctx.beginPath();
  ctx.arc(60, 128, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.font = `800 26px system-ui, sans-serif`;
  ctx.fillText(publicado ? "Tu cuenta" : POST.cuenta, 108, 122);
  ctx.fillStyle = "#64748b";
  ctx.font = `20px system-ui, sans-serif`;
  ctx.fillText(POST.aviso, 108, 152);
  ctx.fillStyle = "#0f172a";
  ctx.font = `600 25px system-ui, sans-serif`;
  let y = 210;
  if (!publicado) {
    y = parrafo(ctx, POST.texto, 28, y, W - 56, 34);
    const sx = RECORTE.x * FW;
    const sy = RECORTE.y * FH;
    const sw = RECORTE.w * FW;
    const sh = RECORTE.h * FH;
    const dh = ((W - 56) * sh) / sw;
    ctx.drawImage(foto, sx, sy, sw, sh, 28, y + 10, W - 56, dh);
    y += dh + 50;
    ctx.fillStyle = "#64748b";
    ctx.font = `600 22px system-ui, sans-serif`;
    ctx.fillText(`♥ ${POST.reacciones}`, 28, y);
  } else {
    ctx.font = `500 22px system-ui, sans-serif`;
    y = parrafo(ctx, publicado, 28, y, W - 56, 30, 12);
    const dh = ((W - 56) * FH) / FW;
    ctx.drawImage(foto, 0, 0, FW, FH, 28, y + 14, W - 56, dh);
    y += dh + 52;
    ctx.fillStyle = "#15803d";
    ctx.font = `800 22px system-ui, sans-serif`;
    ctx.fillText("Foto completa · con fecha y crédito", 28, y);
  }
  return c;
}

/* ── Tarjetas del tablero ─────────────────────────────────────────────── */

const CW = 512;
const CH = 332;

function dibujarTarjeta(f: FuenteId, foto: HTMLCanvasElement): HTMLCanvasElement {
  const d = FUENTE_DEF[f];
  const [c, ctx] = lienzo(CW, CH);
  ctx.fillStyle = d.color;
  ctx.fillRect(0, 0, CW, CH);
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(0, 0, CW, 58);
  ctx.fillStyle = "#6b4f2a";
  ctx.font = `900 20px ${MAQUINA}`;
  ctx.textAlign = "left";
  ctx.fillText(d.tipo.toUpperCase(), 22, 38);
  ctx.fillStyle = "#1c1917";
  ctx.font = `900 27px ${DIARIO}`;
  let y = parrafo(ctx, d.corta, 22, 96, CW - 44, 32, 2);
  if (f === "foto") {
    ctx.drawImage(foto, 0, 0, FW, FH, 22, y - 6, 250, 166);
    ctx.fillStyle = "#44403c";
    ctx.font = `italic 19px ${DIARIO}`;
    parrafo(ctx, "Bellas Artes, abril de 1938", 290, y + 30, CW - 310, 26, 4);
  } else if (f === "oral") {
    ctx.strokeStyle = "#166534";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < CW - 44; x += 4) ctx.lineTo(22 + x, y + 14 + Math.sin(x / 7) * Math.sin(x / 41) * 16);
    ctx.stroke();
    ctx.fillStyle = "#292524";
    ctx.font = `italic 20px ${DIARIO}`;
    parrafo(ctx, d.resumen, 22, y + 62, CW - 44, 26, 5);
  } else {
    ctx.fillStyle = "#292524";
    ctx.font = f === "carta" || f === "falsa" ? `21px ${MANO}` : f === "telegrama" || f === "boletin" ? `19px ${MAQUINA}` : `italic 21px ${DIARIO}`;
    y = parrafo(ctx, d.resumen, 22, y + 6, CW - 44, 27, 6);
  }
  if (f === "falsa") sello(ctx, ["¿PROCEDENCIA?"], CW - 120, CH - 50, "#b91c1c", -0.2, 22);
  grano(ctx, CW, CH, f.length * 71, 500, 0.05);
  return c;
}

function dibujarAfirmacion(texto: string): HTMLCanvasElement {
  const W = 720;
  const H = 400;
  const [c, ctx] = lienzo(W, H);
  ctx.fillStyle = "#fefce8";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(220,38,38,0.4)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 86);
  ctx.lineTo(W, 86);
  ctx.stroke();
  ctx.strokeStyle = "rgba(59,130,246,0.25)";
  ctx.lineWidth = 2;
  for (let y = 134; y < H; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.fillStyle = "#991b1b";
  ctx.font = `900 26px ${MAQUINA}`;
  ctx.fillText("AFIRMACIÓN A PONER A PRUEBA", 30, 58);
  ctx.fillStyle = "#111827";
  ctx.font = `800 36px ${DIARIO}`;
  parrafo(ctx, texto, 30, 132, W - 60, 48, 5);
  return c;
}

function dibujarFalsa(examinados: number[]): { canvas: HTMLCanvasElement; rects: Rect[] } {
  const [c, ctx] = lienzo(DW, DH);
  ctx.fillStyle = "#e7dcc0";
  ctx.fillRect(0, 0, DW, DH);
  ctx.fillStyle = "#2a2a4a";
  ctx.font = `38px ${MANO}`;
  ctx.textAlign = "left";
  const rects: Rect[] = [];
  let y = 150;
  FRAGMENTOS_FALSA.forEach((fr, i) => {
    const lineas = envolver(ctx, fr.texto, DW - 200);
    const alto = lineas.length * 58;
    lineas.forEach((l, k) => ctx.fillText(l, 100, y + k * 58));
    const r = norm(80, y - 46, DW - 160, alto + 20, DW, DH);
    rects.push(r);
    if (examinados.includes(i)) {
      ctx.save();
      if (fr.anacronismo) {
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(DW / 2, y - 46 + (alto + 20) / 2, (DW - 140) / 2, (alto + 40) / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#dc2626";
        ctx.font = `900 26px ${MAQUINA}`;
        ctx.fillText("ANACRONISMO", DW - 300, y + alto + 4);
      } else {
        ctx.strokeStyle = "rgba(22,101,52,0.7)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(40, y - 20);
        ctx.lineTo(56, y - 4);
        ctx.lineTo(80, y - 36);
        ctx.stroke();
      }
      ctx.restore();
    }
    y += alto + 64;
  });
  ctx.fillStyle = "rgba(60,60,60,0.7)";
  ctx.font = `26px ${MAQUINA}`;
  ctx.fillText("Adquirida en una venta en línea, sin procedencia (ilustrativo)", 60, DH - 60);
  grano(ctx, DW, DH, 404);
  return { canvas: c, rects };
}

/* ── Piezas comunes ───────────────────────────────────────────────────── */

function Etiqueta({ pos, children, df = 10, col, fs = 12 }: { pos: Pt; children: ReactNode; df?: number; col?: string; fs?: number }) {
  return (
    <Html position={pos} center distanceFactor={df} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 11px",
          borderRadius: 999,
          background: "rgba(12,8,4,0.86)",
          border: `1px solid ${col ?? "rgba(255,255,255,0.22)"}`,
          color: "#fff",
          fontSize: fs,
          fontWeight: 800,
          whiteSpace: "nowrap",
          boxShadow: "0 6px 18px -8px #000",
        }}
      >
        {children}
      </div>
    </Html>
  );
}

const MADERA = "#5b3a22";

/** Mesa de trabajo del archivo con lámpara de banquero, repisas y cajas. */
function SalaArchivo({ lampara = true }: { lampara?: boolean }) {
  const cajas = useMemo(() => {
    const rnd = mulberry32(21);
    return Array.from({ length: 16 }, (_, i) => ({
      x: -6.2 + (i % 8) * 1.62 + rnd() * 0.1,
      y: i < 8 ? 1.2 : 2.95,
      h: 0.95 + rnd() * 0.25,
      col: ["#8b6b45", "#a0805a", "#7a5a3a", "#b08d62"][i % 4]!,
    }));
  }, []);
  return (
    <group>
      {/* Pared y repisas */}
      <mesh position={[0, 2.6, -3.4]} receiveShadow>
        <planeGeometry args={[18, 9]} />
        <meshStandardMaterial color="#1f1712" roughness={1} />
      </mesh>
      {[0.7, 2.45].map((y) => (
        <mesh key={y} position={[0, y, -3.0]} receiveShadow castShadow>
          <boxGeometry args={[13.6, 0.08, 0.8]} />
          <meshStandardMaterial color="#3b2a1c" roughness={0.8} />
        </mesh>
      ))}
      {cajas.map((b, i) => (
        <group key={i} position={[b.x, b.y - 0.46 + b.h / 2 - 0.02, -3.0]}>
          <mesh castShadow>
            <boxGeometry args={[1.45, b.h, 0.7]} />
            <meshStandardMaterial color={b.col} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.05, 0.36]}>
            <planeGeometry args={[0.7, 0.28]} />
            <meshStandardMaterial color="#efe6d0" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Mesa */}
      <mesh position={[0, -0.16, 0]} receiveShadow castShadow>
        <boxGeometry args={[13, 0.3, 5.2]} />
        <meshStandardMaterial color={MADERA} roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.005, 0.2]} receiveShadow>
        <boxGeometry args={[7.6, 0.02, 4.2]} />
        <meshStandardMaterial color="#25432f" roughness={0.95} />
      </mesh>
      {lampara && (
        <group position={[-4.6, 0, -0.9]}>
          <mesh position={[0, 0.07, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.55, 0.14, 32]} />
            <meshStandardMaterial color="#b08d3a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 1.6, 12]} />
            <meshStandardMaterial color="#b08d3a" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0.35, 1.7, 0.1]} rotation={[0, 0, Math.PI / 2 - 0.25]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 1.5, 28, 1, true, 0, Math.PI]} />
            <meshStandardMaterial color="#166534" metalness={0.2} roughness={0.25} side={THREE.DoubleSide} emissive="#14532d" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0.35, 1.58, 0.1]} rotation={[0, 0, -0.25]}>
            <boxGeometry args={[1.3, 0.03, 0.5]} />
            <meshBasicMaterial color="#fde68a" />
          </mesh>
          <pointLight position={[0.7, 1.3, 0.5]} intensity={9} distance={9} decay={1.6} color="#ffd8a0" />
        </group>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 1. FICHA DE PROCEDENCIA
 * ════════════════════════════════════════════════════════════════════════ */

const PW = 3;
const PH = 4;
const R_LUPA = 0.62;
const AUMENTO = 1.9;

function aLocal(r: Rect): { cx: number; cy: number; x: number; y: number; w: number; h: number } {
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  return { cx, cy, x: (cx - 0.5) * PW, y: (0.5 - cy) * PH, w: r.w * PW, h: r.h * PH };
}

function ZonaResaltada({ r, col, actual }: { r: Rect; col: string; actual: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const l = aLocal(r);
  useFrame(({ clock }) => {
    const m = ref.current?.material as THREE.MeshBasicMaterial | undefined;
    if (m) m.opacity = actual ? 0.16 + 0.1 * Math.sin(clock.elapsedTime * 4) : 0.0;
  });
  return (
    <group position={[l.x, l.y, 0.014]}>
      <mesh ref={ref}>
        <planeGeometry args={[l.w, l.h]} />
        <meshBasicMaterial color={col} transparent opacity={0} depthWrite={false} />
      </mesh>
      {actual &&
        (
          [
            [0, l.h / 2, l.w, 0.018],
            [0, -l.h / 2, l.w, 0.018],
            [-l.w / 2, 0, 0.018, l.h],
            [l.w / 2, 0, 0.018, l.h],
          ] as const
        ).map(([x, y, w, h], k) => (
          <mesh key={k} position={[x, y, 0.002]}>
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial color={col} />
          </mesh>
        ))}
    </group>
  );
}

function Lupa({ zoom, destino, visible, escanea }: { zoom: THREE.Texture; destino: Rect | null; visible: boolean; escanea: boolean }) {
  const grupo = useRef<THREE.Group>(null);
  const pos = useRef(new THREE.Vector3(2.4, -1.4, 0.5));
  useFrame(({ clock }, dt) => {
    const g = grupo.current;
    if (!g) return;
    let tx = 2.3;
    let ty = -1.7;
    let tz = 0.18;
    let cx = 0.5;
    let cy = 0.5;
    if (destino && visible) {
      const l = aLocal(destino);
      const t = clock.elapsedTime;
      const dx = escanea ? Math.sin(t * 0.55) * Math.min(0.26, Math.max(0, destino.w / 2 - 0.14)) : 0;
      const dy = escanea ? Math.sin(t * 0.23) * Math.min(0.2, Math.max(0, destino.h / 2 - 0.06)) : 0;
      cx = l.cx + dx;
      cy = l.cy + dy;
      tx = (cx - 0.5) * PW;
      ty = (0.5 - cy) * PH;
      tz = 0.16;
    }
    const k = suave(dt, 0.08);
    pos.current.x += (tx - pos.current.x) * k;
    pos.current.y += (ty - pos.current.y) * k;
    pos.current.z += (tz - pos.current.z) * k;
    g.position.copy(pos.current);
    // Lo que se ve dentro de la lupa: la zona bajo su centro, ampliada.
    const ux = (2 * R_LUPA) / AUMENTO / PW;
    const uy = (2 * R_LUPA) / AUMENTO / PH;
    const pcx = pos.current.x / PW + 0.5;
    const pcy = pos.current.y / PH + 0.5;
    zoom.repeat.set(ux, uy);
    zoom.offset.set(pcx - ux / 2, pcy - uy / 2);
  });
  return (
    <group ref={grupo}>
      {destino && visible ? (
        <mesh>
          <circleGeometry args={[R_LUPA, 48]} />
          <meshBasicMaterial map={zoom} toneMapped={false} />
        </mesh>
      ) : (
        <mesh>
          <circleGeometry args={[R_LUPA, 48]} />
          <meshStandardMaterial color="#dbeafe" transparent opacity={0.22} roughness={0.05} metalness={0.1} />
        </mesh>
      )}
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[R_LUPA * 0.86, R_LUPA, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>
      <mesh>
        <torusGeometry args={[R_LUPA + 0.03, 0.055, 12, 48]} />
        <meshStandardMaterial color="#b08d3a" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0.62, -0.62, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.07, 0.09, 0.9, 16]} />
        <meshStandardMaterial color="#2b1a10" roughness={0.5} />
      </mesh>
    </group>
  );
}

function EscenaFicha({ docId, volteado, zona, zonasVistas, fichaCompleta, modoColor }: { docId: SoporteId; volteado: boolean; zona: ZonaId | null; zonasVistas: ZonaId[]; fichaCompleta: boolean; modoColor: string }) {
  const doc = DOCUMENTOS.find((d) => d.id === docId) ?? DOCUMENTOS[0]!;
  const frente = useMemo(() => dibujarFrente(doc), [doc]);
  const reverso = useMemo(() => dibujarReverso(doc), [doc]);
  const texF = useMemo(() => texturaDe(frente.canvas), [frente]);
  const texR = useMemo(() => texturaDe(reverso.canvas), [reverso]);
  const zoomF = useMemo(() => {
    const t = texF.clone();
    t.needsUpdate = true;
    return t;
  }, [texF]);
  const zoomR = useMemo(() => {
    const t = texR.clone();
    t.needsUpdate = true;
    return t;
  }, [texR]);
  useLibera(texF);
  useLibera(texR);
  useLibera(zoomF);
  useLibera(zoomR);

  const hoja = useRef<THREE.Group>(null);
  const giro = useRef(volteado ? Math.PI : 0);
  const asentado = useRef(true);
  const lupaVisible = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const destino = volteado ? Math.PI : 0;
    giro.current += (destino - giro.current) * suave(dt, 0.07);
    asentado.current = Math.abs(destino - giro.current) < 0.08;
    if (hoja.current) {
      hoja.current.rotation.y = giro.current;
      hoja.current.position.z = Math.sin(giro.current) * 0.5;
    }
    if (lupaVisible.current) lupaVisible.current.visible = asentado.current || zona === null;
  });

  const enReverso = zona === "reverso";
  const rectZona = zona ? (enReverso ? reverso.rects.reverso : frente.rects[zona]) ?? null : null;
  const escanea = !!rectZona && (rectZona.w > 0.5 || rectZona.h > 0.25);

  return (
    <group>
      <SalaArchivo />
      {/* Atril */}
      <group position={[0, 0, 0.1]}>
        <mesh position={[0, 0.12, 0.55]} castShadow>
          <boxGeometry args={[3.6, 0.12, 0.5]} />
          <meshStandardMaterial color="#3b2616" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.2, -0.72]} rotation={[-0.33, 0, 0]} castShadow>
          <boxGeometry args={[3.5, 4.3, 0.08]} />
          <meshStandardMaterial color="#4a2f1b" roughness={0.6} />
        </mesh>
      </group>
      <group position={[0, 2.18, -0.22]} rotation={[-0.33, 0, 0]}>
        <group ref={hoja}>
          <mesh position={[0, 0, 0.006]} castShadow>
            <planeGeometry args={[PW, PH]} />
            <meshStandardMaterial map={texF} roughness={0.85} />
          </mesh>
          <group rotation={[0, Math.PI, 0]}>
            <mesh position={[0, 0, 0.006]}>
              <planeGeometry args={[PW, PH]} />
              <meshStandardMaterial map={texR} roughness={0.85} />
            </mesh>
            {reverso.rects.reverso && <ZonaResaltada r={reverso.rects.reverso} col={modoColor} actual={enReverso} />}
          </group>
          {(Object.keys(frente.rects) as ZonaId[]).map((zid) => (
            <ZonaResaltada key={zid} r={frente.rects[zid]!} col={modoColor} actual={zona === zid} />
          ))}
        </group>
        <group ref={lupaVisible}>
          <Lupa zoom={enReverso ? zoomR : zoomF} destino={rectZona} visible={!!zona} escanea={escanea} />
        </group>
      </group>
      <Etiqueta pos={[3.2, 0.35, 1.5]} df={10} fs={11} col={fichaCompleta ? `${VERDE}aa` : undefined}>
        <i className={`fa-solid ${fichaCompleta ? "fa-circle-check" : "fa-magnifying-glass"}`} style={{ color: fichaCompleta ? VERDE : modoColor }} />
        {fichaCompleta ? "Ficha completa" : `Zonas examinadas: ${zonasVistas.length} de 6`}
      </Etiqueta>
      {/* Los otros documentos del expediente, en pila */}
      {DOCUMENTOS.filter((d) => d.id !== docId).map((d, i) => (
        <mesh key={d.id} position={[3.5 + i * 0.08, 0.03 + i * 0.03, 0.2 - i * 0.1]} rotation={[-Math.PI / 2, 0, 0.25 - i * 0.2]} castShadow>
          <boxGeometry args={[1.5, 2, 0.02]} />
          <meshStandardMaterial color={d.papel} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 2. TABLERO DE CORCHO
 * ════════════════════════════════════════════════════════════════════════ */

const TW = 2.5;
const TH = (TW * CH) / CW;
const POS_TARJETA: Record<FuenteId, Pt> = {
  carta: [-3.9, 1.95, 0.12],
  periodico: [-3.9, 0, 0.12],
  telegrama: [-3.9, -1.95, 0.12],
  boletin: [3.9, 1.95, 0.12],
  foto: [3.9, 0, 0.12],
  oral: [3.9, -1.95, 0.12],
  falsa: [0, -2.05, 0.12],
};
const AF_POS: Pt = [0, 0.6, 0.12];
const AF_W = 3.4;
const AF_H = (AF_W * 400) / 720;

function anclaFuente(f: FuenteId): THREE.Vector3 {
  const [x, y, z] = POS_TARJETA[f];
  if (f === "falsa") return new THREE.Vector3(x, y + TH / 2 - 0.08, z + 0.06);
  return new THREE.Vector3(x + (x < 0 ? TW / 2 - 0.1 : -TW / 2 + 0.1), y, z + 0.06);
}
function anclaAfirmacion(f: FuenteId): THREE.Vector3 {
  const [x, y, z] = AF_POS;
  if (f === "falsa") return new THREE.Vector3(x, y - AF_H / 2 + 0.08, z + 0.06);
  const [, fy] = POS_TARJETA[f];
  const dy = fy > 0.5 ? 0.55 : fy < -0.5 ? -0.55 : 0;
  return new THREE.Vector3(x + (POS_TARJETA[f][0] < 0 ? -AF_W / 2 + 0.1 : AF_W / 2 - 0.1), y + dy, z + 0.06);
}

function Hilo({ desde, hasta, col }: { desde: THREE.Vector3; hasta: THREE.Vector3; col: string }) {
  const geo = useMemo(() => {
    const medio = desde.clone().lerp(hasta, 0.5);
    medio.y -= 0.35;
    medio.z += 0.18;
    const curva = new THREE.QuadraticBezierCurve3(desde, medio, hasta);
    return new THREE.TubeGeometry(curva, 48, 0.028, 6, false);
  }, [desde, hasta]);
  useLibera(geo);
  const p = useRef(0);
  useFrame((_, dt) => {
    p.current = Math.min(1, p.current + dt * 1.8);
    const total = geo.index ? geo.index.count : 0;
    geo.setDrawRange(0, Math.floor((total * (1 - Math.pow(1 - p.current, 3))) / 6) * 6);
  });
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.45} roughness={0.6} />
    </mesh>
  );
}

function Chincheta({ pos, col }: { pos: THREE.Vector3; col: string }) {
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.075, 14, 10]} />
      <meshStandardMaterial color={col} roughness={0.35} metalness={0.2} />
    </mesh>
  );
}

function Tarjeta({ f, tex, sel, modoColor }: { f: FuenteId; tex: THREE.Texture; sel: boolean; modoColor: string }) {
  const marco = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const m = marco.current?.material as THREE.MeshBasicMaterial | undefined;
    if (m) m.opacity = sel ? 0.55 + 0.35 * Math.sin(clock.elapsedTime * 5) : 0;
  });
  const [x, y, z] = POS_TARJETA[f];
  const giro = ((f.length * 7) % 5) * 0.012 - 0.024;
  return (
    <group position={[x, y, z]} rotation={[0, 0, giro]}>
      <mesh ref={marco} position={[0, 0, -0.01]}>
        <planeGeometry args={[TW + 0.18, TH + 0.18]} />
        <meshBasicMaterial color={modoColor} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh castShadow>
        <planeGeometry args={[TW, TH]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      <mesh position={[0, TH / 2 - 0.12, 0.05]}>
        <sphereGeometry args={[0.07, 12, 10]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.4} />
      </mesh>
    </group>
  );
}

function CartaFalsaGrande({ examinados, fragSel }: { examinados: number[]; fragSel: number | null }) {
  const falsa = useMemo(() => dibujarFalsa(examinados), [examinados]);
  const tex = useMemo(() => texturaDe(falsa.canvas), [falsa]);
  const zoom = useMemo(() => {
    const t = tex.clone();
    t.needsUpdate = true;
    return t;
  }, [tex]);
  useLibera(tex);
  useLibera(zoom);
  const grupo = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current = Math.min(1, t.current + dt * 2.2);
    const e = 1 - Math.pow(1 - t.current, 3);
    if (grupo.current) {
      grupo.current.position.set(0, -2.05 + e * 2.05, 0.2 + e * 1.4);
      grupo.current.scale.setScalar(0.45 + e * 0.55);
    }
  });
  const destino = fragSel !== null ? (falsa.rects[fragSel] ?? null) : null;
  return (
    <group ref={grupo}>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[PW + 0.12, PH + 0.12]} />
        <meshBasicMaterial color="#0c0a08" transparent opacity={0.4} />
      </mesh>
      <mesh castShadow>
        <planeGeometry args={[PW, PH]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      <Lupa zoom={zoom} destino={destino} visible={destino !== null} escanea={false} />
    </group>
  );
}

function EscenaTablero(p: { afirmacionId: string; hilos: Hilos; fuenteSel: FuenteId | null; veredicto: VeredictoId | null; lupaFalsa: boolean; fragSel: number | null; examinados: number[]; modoColor: string }) {
  const af = AFIRMACIONES.find((a) => a.id === p.afirmacionId) ?? AFIRMACIONES[0]!;
  const foto = useMemo(() => dibujarFoto(), []);
  const texturas = useMemo(() => {
    const out = {} as Record<FuenteId, THREE.CanvasTexture>;
    FUENTES_TABLERO.forEach((f) => {
      out[f] = texturaDe(dibujarTarjeta(f, foto));
    });
    return out;
  }, [foto]);
  useEffect(() => () => Object.values(texturas).forEach((t) => t.dispose()), [texturas]);
  const texAf = useMemo(() => texturaDe(dibujarAfirmacion(af.texto)), [af]);
  useLibera(texAf);
  const anclas = useMemo(() => {
    const out = {} as Record<FuenteId, { a: THREE.Vector3; b: THREE.Vector3 }>;
    FUENTES_TABLERO.forEach((f) => {
      out[f] = { a: anclaFuente(f), b: anclaAfirmacion(f) };
    });
    return out;
  }, []);
  const ver = VEREDICTOS.find((v) => v.id === p.veredicto);
  const colVer = !ver ? p.modoColor : ver.id === af.veredicto ? VERDE : "#fb923c";

  return (
    <group>
      <mesh position={[0, 0, -0.3]} receiveShadow>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color="#1c1410" roughness={1} />
      </mesh>
      <mesh position={[0, 0, -0.06]} receiveShadow>
        <boxGeometry args={[10.8, 6.6, 0.12]} />
        <meshStandardMaterial color="#b3845a" roughness={1} />
      </mesh>
      {(
        [
          [0, 3.36, 11.2, 0.22],
          [0, -3.36, 11.2, 0.22],
          [-5.5, 0, 0.22, 6.9],
          [5.5, 0, 0.22, 6.9],
        ] as const
      ).map(([x, y, w, h], k) => (
        <mesh key={k} position={[x, y, 0.02]} castShadow>
          <boxGeometry args={[w, h, 0.2]} />
          <meshStandardMaterial color="#4a2e17" roughness={0.6} />
        </mesh>
      ))}
      {FUENTES_TABLERO.map((f) => (f === "falsa" && p.lupaFalsa ? null : <Tarjeta key={f} f={f} tex={texturas[f]} sel={p.fuenteSel === f && !p.lupaFalsa} modoColor={p.modoColor} />))}
      <group position={AF_POS}>
        <mesh castShadow>
          <planeGeometry args={[AF_W, AF_H]} />
          <meshStandardMaterial map={texAf} roughness={0.9} emissive={colVer} emissiveIntensity={0.04} />
        </mesh>
      </group>
      {FUENTES_TABLERO.map((f) => {
        const rel = p.hilos[f];
        if (!rel || (f === "falsa" && p.lupaFalsa)) return null;
        const col = rel === "corrobora" ? VERDE : ROJO;
        return (
          <group key={`${af.id}-${f}-${rel}`}>
            <Hilo desde={anclas[f].a} hasta={anclas[f].b} col={col} />
            <Chincheta pos={anclas[f].a} col={col} />
            <Chincheta pos={anclas[f].b} col={col} />
          </group>
        );
      })}
      {ver && !p.lupaFalsa && (
        <Etiqueta pos={[0, AF_POS[1] + AF_H / 2 + 0.32, 0.3]} df={10} col={`${colVer}cc`} fs={13}>
          <i className={`fa-solid ${ver.icono}`} style={{ color: colVer }} />
          Dictamen: {ver.etq}
        </Etiqueta>
      )}
      {p.lupaFalsa && (
        <>
          <mesh position={[0, 0, 0.7]}>
            <planeGeometry args={[30, 16]} />
            <meshBasicMaterial color="#000" transparent opacity={0.55} depthWrite={false} />
          </mesh>
          <CartaFalsaGrande examinados={p.examinados} fragSel={p.fragSel} />
        </>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3. USO ÉTICO — la foto y la publicación
 * ════════════════════════════════════════════════════════════════════════ */

const IW = 4.2;
const IH = (IW * FH) / FW;

function EscenaFoto({ sinRecorte, fotoVolteada, publicado, modoColor }: { sinRecorte: number; fotoVolteada: boolean; publicado: string | null; modoColor: string }) {
  const foto = useMemo(() => dibujarFoto(), []);
  const texFoto = useMemo(() => texturaDe(foto), [foto]);
  const texRev = useMemo(() => texturaDe(dibujarReversoFoto()), []);
  const texTel = useMemo(() => texturaDe(dibujarTelefono(foto, publicado)), [foto, publicado]);
  useLibera(texFoto);
  useLibera(texRev);
  useLibera(texTel);

  const hoja = useRef<THREE.Group>(null);
  const giro = useRef(0);
  const s = useRef(0);
  const mascaras = useRef<THREE.Group>(null);
  const marco = useRef<THREE.Group>(null);
  const tel = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    giro.current += ((fotoVolteada ? Math.PI : 0) - giro.current) * suave(dt, 0.07);
    if (hoja.current) {
      hoja.current.rotation.y = giro.current;
      hoja.current.position.z = Math.sin(giro.current) * 0.6;
    }
    s.current += (sinRecorte / 100 - s.current) * suave(dt, 0.1);
    const e = s.current;
    // Rectángulo visible en fracciones de la foto (0..1, y desde arriba).
    const x0 = RECORTE.x * (1 - e);
    const y0 = RECORTE.y * (1 - e);
    const x1 = (RECORTE.x + RECORTE.w) * (1 - e) + e;
    const y1 = (RECORTE.y + RECORTE.h) * (1 - e) + e;
    const set = (m: THREE.Mesh | null, fx0: number, fy0: number, fx1: number, fy1: number) => {
      if (!m) return;
      const w = Math.max(0.0001, (fx1 - fx0) * IW);
      const h = Math.max(0.0001, (fy1 - fy0) * IH);
      m.scale.set(w, h, 1);
      m.position.set(((fx0 + fx1) / 2 - 0.5) * IW, (0.5 - (fy0 + fy1) / 2) * IH, 0.012);
    };
    const ms = (mascaras.current?.children ?? []) as THREE.Mesh[];
    set(ms[0] ?? null, 0, 0, 1, y0);
    set(ms[1] ?? null, 0, y1, 1, 1);
    set(ms[2] ?? null, 0, y0, x0, y1);
    set(ms[3] ?? null, x1, y0, 1, y1);
    if (marco.current) {
      marco.current.visible = e < 0.97;
      const [a, b, c, d] = marco.current.children as THREE.Mesh[];
      const w = (x1 - x0) * IW;
      const h = (y1 - y0) * IH;
      const cx = ((x0 + x1) / 2 - 0.5) * IW;
      const cy = (0.5 - (y0 + y1) / 2) * IH;
      a?.position.set(cx, cy + h / 2, 0.02);
      a?.scale.set(w, 1, 1);
      b?.position.set(cx, cy - h / 2, 0.02);
      b?.scale.set(w, 1, 1);
      c?.position.set(cx - w / 2, cy, 0.02);
      c?.scale.set(1, h, 1);
      d?.position.set(cx + w / 2, cy, 0.02);
      d?.scale.set(1, h, 1);
    }
    if (tel.current) tel.current.position.y = 2.0 + Math.sin(clock.elapsedTime * 1.2) * 0.03;
  });

  return (
    <group>
      <SalaArchivo />
      {/* Atril de la fotografía */}
      <mesh position={[-1.2, 0.1, 0.35]} castShadow receiveShadow>
        <boxGeometry args={[4.9, 0.12, 0.5]} />
        <meshStandardMaterial color="#3b2616" roughness={0.6} />
      </mesh>
      <group position={[-1.2, 1.78, 0]} rotation={[-0.2, 0.12, 0]}>
        <mesh position={[0, 0, -0.08]} castShadow>
          <boxGeometry args={[IW + 0.3, IH + 0.3, 0.08]} />
          <meshStandardMaterial color="#3b2616" roughness={0.6} />
        </mesh>
        <group ref={hoja}>
          <mesh castShadow>
            <planeGeometry args={[IW, IH]} />
            <meshStandardMaterial map={texFoto} roughness={0.7} emissive="#ffffff" emissiveMap={texFoto} emissiveIntensity={0.35} />
          </mesh>
          <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.004]}>
            <planeGeometry args={[IW, IH]} />
            <meshStandardMaterial map={texRev} roughness={0.8} />
          </mesh>
          <group ref={mascaras}>
            {[0, 1, 2, 3].map((k) => (
              <mesh key={k}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial color="#05070c" transparent opacity={0.86} depthWrite={false} />
              </mesh>
            ))}
          </group>
          <group ref={marco}>
            {[0, 1, 2, 3].map((k) => (
              <mesh key={k}>
                <planeGeometry args={k < 2 ? [1, 0.03] : [0.03, 1]} />
                <meshBasicMaterial color={modoColor} />
              </mesh>
            ))}
          </group>
        </group>
        <Etiqueta pos={[0, IH / 2 + 0.42, 0]} df={10} col={`${modoColor}aa`} fs={12}>
          <i className={`fa-solid ${fotoVolteada ? "fa-stamp" : sinRecorte >= 100 ? "fa-expand" : "fa-crop-simple"}`} style={{ color: modoColor }} />
          {fotoVolteada ? "Reverso: pie original y sello" : sinRecorte >= 100 ? "Foto completa (recreación ilustrativa)" : `Recorte de la publicación · ${sinRecorte} % recuperado`}
        </Etiqueta>
      </group>
      {/* Teléfono */}
      <group ref={tel} position={[3.3, 2.0, 0.3]} rotation={[-0.12, -0.32, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.86, 3.56, 0.12]} />
          <meshStandardMaterial color="#0b0f19" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.065]}>
          <planeGeometry args={[1.7, 3.4]} />
          <meshBasicMaterial map={texTel} toneMapped={false} />
        </mesh>
      </group>
      <Etiqueta pos={[3.3, 4.1, 0.2]} df={10} col={publicado ? `${VERDE}aa` : "#f97316aa"} fs={12}>
        <i className={`fa-solid ${publicado ? "fa-circle-check" : "fa-fire"}`} style={{ color: publicado ? VERDE : "#f97316" }} />
        {publicado ? "Publicación corregida" : "Publicación viral (ficticia)"}
      </Etiqueta>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3b. BALANZA DE LA EVIDENCIA
 * ════════════════════════════════════════════════════════════════════════ */

const BRAZO = 2.1;

function EscenaBalanza({ tesisOk, sostienen, matiz, peso, lista, modoColor }: { tesisOk: boolean | null; sostienen: FuenteId[]; matiz: FuenteId | null; peso: number; lista: boolean; modoColor: string }) {
  const foto = useMemo(() => dibujarFoto(), []);
  const texturas = useMemo(() => {
    const out = {} as Record<FuenteId, THREE.CanvasTexture>;
    FUENTES_TABLERO.forEach((f) => {
      out[f] = texturaDe(dibujarTarjeta(f, foto));
    });
    return out;
  }, [foto]);
  useEffect(() => () => Object.values(texturas).forEach((t) => t.dispose()), [texturas]);
  const viga = useRef<THREE.Group>(null);
  const izq = useRef<THREE.Group>(null);
  const der = useRef<THREE.Group>(null);
  const ang = useRef(0);
  const validas = sostienen.filter((f) => PESO_INTERP[f] > 0 && f !== "boletin");
  const rechazadas = sostienen.filter((f) => !validas.includes(f));
  const destino = Math.max(-1, Math.min(1, (peso - PESO_MINIMO) / 3)) * 0.28;
  useFrame((_, dt) => {
    ang.current += (destino - ang.current) * suave(dt, 0.05);
    const a = ang.current;
    if (viga.current) viga.current.rotation.z = a;
    if (izq.current) izq.current.position.set(-Math.cos(a) * BRAZO, 2.5 - Math.sin(a) * BRAZO, 0);
    if (der.current) der.current.position.set(Math.cos(a) * BRAZO, 2.5 + Math.sin(a) * BRAZO, 0);
  });
  const ficha = (f: FuenteId, pos: Pt, rot = 0, key?: string) => (
    <group key={key ?? f} position={pos} rotation={[0, rot, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.3, 0.06, 0.84]} />
        <meshStandardMaterial color={FUENTE_DEF[f].color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.28, 0.83]} />
        <meshStandardMaterial map={texturas[f]} roughness={0.9} />
      </mesh>
    </group>
  );
  return (
    <group>
      <SalaArchivo />
      {/* Balanza */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.75, 0.9, 0.2, 32]} />
        <meshStandardMaterial color="#6b4a1f" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.11, 2.4, 16]} />
        <meshStandardMaterial color="#b08d3a" metalness={0.8} roughness={0.25} />
      </mesh>
      <group ref={viga} position={[0, 2.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[BRAZO * 2 + 0.2, 0.1, 0.12]} />
          <meshStandardMaterial color="#d4a73c" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.06, 0.5, 12]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.25} />
        </mesh>
      </group>
      {(["izq", "der"] as const).map((lado) => (
        <group key={lado} ref={lado === "izq" ? izq : der} position={[lado === "izq" ? -BRAZO : BRAZO, 2.5, 0]}>
          {[-0.5, 0.5].map((x) => (
            <mesh key={x} position={[x * 0.9, -0.55, 0]} rotation={[0, 0, x * 0.75]}>
              <cylinderGeometry args={[0.012, 0.012, 1.25, 6]} />
              <meshStandardMaterial color="#e5e7eb" />
            </mesh>
          ))}
          <group position={[0, -1.1, 0]}>
            <mesh receiveShadow>
              <cylinderGeometry args={[0.9, 0.75, 0.08, 32]} />
              <meshStandardMaterial color="#b08d3a" metalness={0.7} roughness={0.3} />
            </mesh>
            {lado === "izq"
              ? validas.map((f, k) => ficha(f, [0, 0.08 + k * 0.08, 0], (k - 1) * 0.18))
              : Array.from({ length: PESO_MINIMO }, (_, k) => (
                  <mesh key={k} position={[0, 0.1 + k * 0.13, 0]} castShadow>
                    <cylinderGeometry args={[0.42 - k * 0.03, 0.44 - k * 0.03, 0.12, 28]} />
                    <meshStandardMaterial color="#8a6d2f" metalness={0.8} roughness={0.35} />
                  </mesh>
                ))}
          </group>
        </group>
      ))}
      <Etiqueta pos={[-1.3, 3.4, 0]} df={10} col={`${modoColor}aa`} fs={11}>
        <i className="fa-solid fa-folder-open" style={{ color: modoColor }} />
        {validas.length ? validas.map((f) => FUENTE_DEF[f].corta).join(" + ") : "Evidencias que sostienen"} · peso {peso}
      </Etiqueta>
      <Etiqueta pos={[BRAZO, 3.4, 0]} df={10} fs={11}>
        <i className="fa-solid fa-weight-hanging" style={{ color: "#d4a73c" }} />
        Carga de la prueba · {PESO_MINIMO}
      </Etiqueta>
      {/* Matiz y descartadas */}
      <group position={[-2.55, 0.02, 2.0]}>
        {matiz && ficha(matiz, [0, 0.05, 0], 0.3, `m-${matiz}`)}
        <Etiqueta pos={[0, 0.7, 0]} df={10} fs={11} col={matiz ? "#fbbf24aa" : undefined}>
          <i className="fa-solid fa-circle-half-stroke" style={{ color: "#fbbf24" }} />
          Matiz: {matiz ? FUENTE_DEF[matiz].corta : "sin elegir"}
        </Etiqueta>
      </group>
      <group position={[2.55, 0.02, 2.0]}>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[1.8, 0.08, 1.3]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.7} />
        </mesh>
        {rechazadas.map((f, k) => ficha(f, [0, 0.12 + k * 0.08, 0], -0.3 + k * 0.4, `r-${f}`))}
        <Etiqueta pos={[0, 0.72, 0]} df={10} fs={11} col={`${ROJO}aa`}>
          <i className="fa-solid fa-ban" style={{ color: ROJO }} />
          No sostienen la tesis: {rechazadas.length}
        </Etiqueta>
      </group>
      {lista ? (
        <Etiqueta pos={[0, 0.3, 2.4]} df={10} fs={13} col={`${VERDE}cc`}>
          <i className="fa-solid fa-circle-check" style={{ color: VERDE }} />
          Interpretación argumentada y matizada
        </Etiqueta>
      ) : (
        <Etiqueta pos={[0, 0.3, 2.4]} df={10} fs={12} col={tesisOk === null ? undefined : tesisOk ? `${VERDE}aa` : "#fb923caa"}>
          <i className="fa-solid fa-feather-pointed" style={{ color: tesisOk ? VERDE : tesisOk === false ? "#fb923c" : "#cbd5e1" }} />
          {tesisOk === null ? "Elige una tesis" : tesisOk ? "Tesis interpretativa y debatible" : "Eso no es una tesis sólida"}
        </Etiqueta>
      )}
    </group>
  );
}

/* ── Escena ───────────────────────────────────────────────────────────── */

export default function ArchivoFuentesScene(p: ArchivoSceneProps) {
  const { vista, modoColor, resetNonce } = p;
  const cam = useMemo((): { pos: Pt; target: Pt; min: number; max: number } => {
    if (vista === "ficha") return { pos: [0.4, 3.3, 7.0], target: [0, 2.05, -0.3], min: 3, max: 12 };
    if (vista === "tablero") return { pos: [0, -0.3, 10.8], target: [0, -0.45, 0], min: 4, max: 16 };
    if (vista === "foto") return { pos: [0.8, 3.4, 8.6], target: [0.6, 1.9, 0], min: 3.5, max: 14 };
    return { pos: [0, 3.4, 7.6], target: [0, 1.5, 0.4], min: 3.5, max: 14 };
  }, [vista]);

  return (
    <Canvas key={`${vista}-${resetNonce}`} shadows dpr={[1, 1.75]} camera={{ position: cam.pos, fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={["#0c0906"]} />
      <fog attach="fog" args={["#0c0906", 16, 34]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 8, 7]} intensity={1.05} castShadow shadow-mapSize={[1024, 1024]} color="#fff1dc" />
      <pointLight position={[5, 3, 5]} intensity={0.35} color={modoColor} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.2} position={[0, 5, 6]} scale={[10, 6, 1]} color="#ffe7c2" />
        <Lightformer form="rect" intensity={0.5} position={[-6, 1, 3]} scale={[6, 6, 1]} color={modoColor} />
      </Environment>

      {vista === "ficha" && <EscenaFicha docId={p.docId} volteado={p.volteado} zona={p.zona} zonasVistas={p.zonasVistas} fichaCompleta={p.fichaCompleta} modoColor={modoColor} />}
      {vista === "tablero" && (
        <EscenaTablero afirmacionId={p.afirmacionId} hilos={p.hilos} fuenteSel={p.fuenteSel} veredicto={p.veredicto} lupaFalsa={p.lupaFalsa} fragSel={p.fragSel} examinados={p.examinados} modoColor={modoColor} />
      )}
      {vista === "foto" && <EscenaFoto sinRecorte={p.sinRecorte} fotoVolteada={p.fotoVolteada} publicado={p.publicado} modoColor={modoColor} />}
      {vista === "balanza" && <EscenaBalanza tesisOk={p.tesisOk} sostienen={p.sostienen} matiz={p.matiz} peso={p.peso} lista={p.lista} modoColor={modoColor} />}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={cam.min}
        maxDistance={cam.max}
        maxPolarAngle={Math.PI * 0.55}
        minPolarAngle={Math.PI * 0.15}
        minAzimuthAngle={-Math.PI * 0.35}
        maxAzimuthAngle={Math.PI * 0.35}
        target={cam.target}
      />
      <EffectComposer>
        <Bloom intensity={0.25} luminanceThreshold={0.72} luminanceSmoothing={0.85} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
