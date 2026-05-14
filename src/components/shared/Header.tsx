"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/MagneticButton";

interface HeaderProps {
  variant?: "cen" | "bachillerato";
}

export function Header({ variant = "cen" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-[0_2px_20px_rgba(11,37,69,0.08)]"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo mark + wordmark */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cen-navy">
            <span className="text-sm font-black text-white">C</span>
          </div>
          <div className="flex flex-col leading-none">
            <span
              className={[
                "text-[11px] font-black uppercase tracking-[0.25em] transition-colors",
                scrolled ? "text-cen-navy" : "text-white",
              ].join(" ")}
            >
              CEN
            </span>
            {variant === "bachillerato" && (
              <span
                className={[
                  "text-[9px] font-black uppercase tracking-[0.3em] transition-colors",
                  scrolled ? "text-cen-blue" : "text-cen-sky/80",
                ].join(" ")}
              >
                BACHILLERATO
              </span>
            )}
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-8 sm:flex">
          {variant === "bachillerato" ? (
            <>
              <Link
                href="/bachillerato#estructura"
                className={[
                  "text-[10px] font-bold uppercase tracking-[0.3em] transition-colors",
                  scrolled
                    ? "text-ink-60 hover:text-cen-navy"
                    : "text-white/70 hover:text-white",
                ].join(" ")}
              >
                Estructura MCCEMS
              </Link>
              <Link
                href="/bachillerato#para-quien"
                className={[
                  "text-[10px] font-bold uppercase tracking-[0.3em] transition-colors",
                  scrolled
                    ? "text-ink-60 hover:text-cen-navy"
                    : "text-white/70 hover:text-white",
                ].join(" ")}
              >
                Para quién
              </Link>
            </>
          ) : (
            <Link
              href="/#productos"
              className={[
                "text-[10px] font-bold uppercase tracking-[0.3em] transition-colors",
                scrolled
                  ? "text-ink-60 hover:text-cen-navy"
                  : "text-white/70 hover:text-white",
              ].join(" ")}
            >
              Productos
            </Link>
          )}
        </nav>

        {/* CTA */}
        <MagneticButton strength={30}>
          <Link
            href="/log-in"
            className={[
              "rounded-2xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest",
              "transition-all duration-300",
              scrolled
                ? "bg-cen-navy text-white hover:bg-cen-blue shadow-[0_10px_25px_rgba(11,37,69,0.15)] hover:-translate-y-0.5"
                : "border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
            ].join(" ")}
          >
            Acceder
          </Link>
        </MagneticButton>
      </div>
    </header>
  );
}
