"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getRSCColor } from "@/components/hub/hub-colors";
import { rscDeUac, type Infografia } from "@/lib/mccems/infografias";
import "./InfografiasCarousel.css";

export function InfografiasCarousel({ infografias }: { infografias: Infografia[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Navegación con teclado dentro del lightbox.
  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
      else if (e.key === "ArrowRight")
        setOpenIndex((i) => (i === null ? i : (i + 1) % infografias.length));
      else if (e.key === "ArrowLeft")
        setOpenIndex((i) => (i === null ? i : (i - 1 + infografias.length) % infografias.length));
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, infografias.length]);

  if (infografias.length === 0) return null;

  function scrollBy(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

  const open = openIndex !== null ? infografias[openIndex] : null;
  const openColor = open ? getRSCColor(rscDeUac(open.uac)) : null;

  return (
    <section className="infg-carousel-wrap" aria-label="Infografías de estudio">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: "rgba(244,114,182,0.12)",
            border: "1.5px solid rgba(244,114,182,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: "#F472B6",
          }}>
            <i className="fa-solid fa-images" />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.03em" }}>
              Infografías de estudio
            </h2>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, fontWeight: 600 }}>
              {infografias.length} láminas visuales · desliza para explorar
            </p>
          </div>
        </div>
      </div>

      {/* Carrusel */}
      <div style={{ position: "relative" }}>
        <button className="infg-nav infg-nav-prev" onClick={() => scrollBy(-1)} aria-label="Anterior">
          <i className="fa-solid fa-chevron-left" />
        </button>

        <div className="infg-track" ref={trackRef}>
          {infografias.map((ig, idx) => {
            const color = getRSCColor(rscDeUac(ig.uac));
            return (
              <button
                key={ig.num}
                className="infg-card"
                style={{
                  "--infg-accent": color.hex,
                  "--infg-accent-border": `rgba(${color.rgba},0.45)`,
                } as CSSProperties}
                onClick={() => setOpenIndex(idx)}
                aria-label={`Abrir infografía: ${ig.titulo}`}
              >
                <div className="infg-thumb">
                  <img src={ig.archivo} alt={ig.titulo} loading="lazy" decoding="async" />
                  <span className="infg-zoom"><i className="fa-solid fa-expand" /></span>
                </div>
                <div className="infg-meta">
                  <span
                    className="infg-badge"
                    style={{ background: `rgba(${color.rgba},0.14)`, color: color.hex }}
                  >
                    {ig.uac}
                  </span>
                  <p className="infg-title">{ig.titulo}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button className="infg-nav infg-nav-next" onClick={() => scrollBy(1)} aria-label="Siguiente">
          <i className="fa-solid fa-chevron-right" />
        </button>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {open && openColor && (
          <motion.div
            className="infg-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpenIndex(null)}
          >
            <button className="infg-lb-close" onClick={() => setOpenIndex(null)} aria-label="Cerrar">
              <i className="fa-solid fa-xmark" />
            </button>

            {infografias.length > 1 && (
              <>
                <button
                  className="infg-lb-nav infg-lb-prev"
                  onClick={(e) => { e.stopPropagation(); setOpenIndex((i) => (i === null ? i : (i - 1 + infografias.length) % infografias.length)); }}
                  aria-label="Anterior"
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <button
                  className="infg-lb-nav infg-lb-next"
                  onClick={(e) => { e.stopPropagation(); setOpenIndex((i) => (i === null ? i : (i + 1) % infografias.length)); }}
                  aria-label="Siguiente"
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </>
            )}

            <motion.img
              key={open.num}
              className="infg-lb-img"
              src={open.archivo}
              alt={open.titulo}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            />

            <div className="infg-lb-caption" onClick={(e) => e.stopPropagation()}>
              <span
                className="infg-lb-badge"
                style={{ background: `rgba(${openColor.rgba},0.18)`, color: openColor.hex }}
              >
                {open.uac}
              </span>
              <p className="infg-lb-title">{open.titulo}</p>
            </div>

            <div className="infg-lb-counter">
              {(openIndex ?? 0) + 1} / {infografias.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
