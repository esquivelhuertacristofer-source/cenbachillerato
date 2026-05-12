import type { Metadata } from "next";
import { Header } from "@/components/shared/Header";
import { HeroBachillerato } from "@/components/landing-bachillerato/Hero";
import { EstructuraMCCEMS } from "@/components/landing-bachillerato/EstructuraMCCEMS";
import { ParaQuien } from "@/components/landing-bachillerato/ParaQuien";
import { Caracteristicas } from "@/components/landing-bachillerato/Caracteristicas";
import { FooterLegal } from "@/components/shared/FooterLegal";

export const metadata: Metadata = {
  title: "CEN Bachillerato — Plataforma alineada al MCCEMS",
  description:
    "Plataforma educativa para bachillerato alineada al Marco Curricular Común de la Educación Media Superior (MCCEMS, Acuerdo 09/08/23). Compatible con DGB, DGETI, DGETA, CONALEP, CECYT, CCH, ENP y bachilleratos con RVOE.",
};

export default function BachilleratoPage() {
  return (
    <>
      <Header variant="bachillerato" />
      <main className="flex-1">
        <HeroBachillerato />
        <EstructuraMCCEMS />
        <ParaQuien />
        <Caracteristicas />
      </main>
      <FooterLegal />
    </>
  );
}
