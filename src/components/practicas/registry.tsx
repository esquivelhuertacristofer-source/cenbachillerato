"use client";

/**
 * Registro de Prácticas experimentales (laboratorios como componentes React).
 *
 * Cada práctica se identifica con un `slug` único, que se guarda en la columna
 * `actividades.practica_slug`. Cuando una actividad tiene ese campo, la app
 * muestra el botón "Práctica experimental" y la sección /actividad/[orden]/practica
 * monta el componente registrado aquí bajo ese slug.
 *
 * Para agregar un laboratorio nuevo:
 *   1. Crea el componente en src/components/practicas/labs/MiLaboratorio.tsx
 *      (recibe PracticaLabProps). Usa PlantillaPractica.tsx como base.
 *   2. Impórtalo aquí y añádelo a PRACTICAS con un slug único.
 *   3. Asócialo a una actividad: npx tsx scripts/set-practica.ts <CODIGO> <slug>
 */

import type { ComponentType } from "react";
import type { AreaColor } from "@/components/hub/hub-colors";
import dynamic from "next/dynamic";
import { PRACTICAS_META } from "./registry-meta";

/**
 * Fallback mientras se carga el chunk del laboratorio.
 * Los labs se importan con `dynamic(..., { ssr: false })` para mantenerlos
 * FUERA del bundle del Worker (límite 3 MiB gzip): así el three.js y los
 * datos verbatim de cada práctica viajan en chunks de cliente, no en SSR.
 */
function LabCargando() {
  return (
    <div
      style={{
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        color: "rgba(255,255,255,0.45)",
        fontFamily: "var(--font-epilogue), 'Plus Jakarta Sans', sans-serif",
      }}
    >
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: 28 }} />
      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>
        Cargando laboratorio 3D…
      </span>
    </div>
  );
}

const LabDensidad = dynamic(() => import("./labs/LabDensidad").then((m) => m.LabDensidad), { ssr: false, loading: LabCargando });
const LabEstadosMateria = dynamic(() => import("./labs/LabEstadosMateria").then((m) => m.LabEstadosMateria), { ssr: false, loading: LabCargando });
const LabModelosAtomicos = dynamic(() => import("./labs/LabModelosAtomicos").then((m) => m.LabModelosAtomicos), { ssr: false, loading: LabCargando });
const LabEnlacesQuimicos = dynamic(() => import("./labs/LabEnlacesQuimicos").then((m) => m.LabEnlacesQuimicos), { ssr: false, loading: LabCargando });
const LabConservacionMateria = dynamic(() => import("./labs/LabConservacionMateria").then((m) => m.LabConservacionMateria), { ssr: false, loading: LabCargando });
const LabEnergiaElectricidad = dynamic(() => import("./labs/LabEnergiaElectricidad").then((m) => m.LabEnergiaElectricidad), { ssr: false, loading: LabCargando });
const LabSeparacionMezclas = dynamic(() => import("./labs/LabSeparacionMezclas").then((m) => m.LabSeparacionMezclas), { ssr: false, loading: LabCargando });
const LabPropiedadesMateria = dynamic(() => import("./labs/LabPropiedadesMateria").then((m) => m.LabPropiedadesMateria), { ssr: false, loading: LabCargando });
const LabFracciones = dynamic(() => import("./labs/LabFracciones").then((m) => m.LabFracciones), { ssr: false, loading: LabCargando });
const LabPotencias = dynamic(() => import("./labs/LabPotencias").then((m) => m.LabPotencias), { ssr: false, loading: LabCargando });
const LabConcentracion = dynamic(() => import("./labs/LabConcentracion").then((m) => m.LabConcentracion), { ssr: false, loading: LabCargando });
const LabProporcion = dynamic(() => import("./labs/LabProporcion").then((m) => m.LabProporcion), { ssr: false, loading: LabCargando });
const LabRectaNumerica = dynamic(() => import("./labs/LabRectaNumerica").then((m) => m.LabRectaNumerica), { ssr: false, loading: LabCargando });
const LabNotacionCientifica = dynamic(() => import("./labs/LabNotacionCientifica").then((m) => m.LabNotacionCientifica), { ssr: false, loading: LabCargando });
const LabValorPosicional = dynamic(() => import("./labs/LabValorPosicional").then((m) => m.LabValorPosicional), { ssr: false, loading: LabCargando });
const LabSistemas = dynamic(() => import("./labs/LabSistemas").then((m) => m.LabSistemas), { ssr: false, loading: LabCargando });
const LabBalanza = dynamic(() => import("./labs/LabBalanza").then((m) => m.LabBalanza), { ssr: false, loading: LabCargando });
const LabPitagoras = dynamic(() => import("./labs/LabPitagoras").then((m) => m.LabPitagoras), { ssr: false, loading: LabCargando });
const LabCilindro = dynamic(() => import("./labs/LabCilindro").then((m) => m.LabCilindro), { ssr: false, loading: LabCargando });
const LabFactorizacion = dynamic(() => import("./labs/LabFactorizacion").then((m) => m.LabFactorizacion), { ssr: false, loading: LabCargando });
const LabEcuaciones = dynamic(() => import("./labs/LabEcuaciones").then((m) => m.LabEcuaciones), { ssr: false, loading: LabCargando });
const LabProductos = dynamic(() => import("./labs/LabProductos").then((m) => m.LabProductos), { ssr: false, loading: LabCargando });
const LabConservacion = dynamic(() => import("./labs/LabConservacion").then((m) => m.LabConservacion), { ssr: false, loading: LabCargando });
const LabGasIdeal = dynamic(() => import("./labs/LabGasIdeal").then((m) => m.LabGasIdeal), { ssr: false, loading: LabCargando });
const LabTransferenciaCalor = dynamic(() => import("./labs/LabTransferenciaCalor").then((m) => m.LabTransferenciaCalor), { ssr: false, loading: LabCargando });
const LabEntropia = dynamic(() => import("./labs/LabEntropia").then((m) => m.LabEntropia), { ssr: false, loading: LabCargando });
const LabMaquinaTermica = dynamic(() => import("./labs/LabMaquinaTermica").then((m) => m.LabMaquinaTermica), { ssr: false, loading: LabCargando });
const LabTrabajoPotencia = dynamic(() => import("./labs/LabTrabajoPotencia").then((m) => m.LabTrabajoPotencia), { ssr: false, loading: LabCargando });
const LabInecuaciones = dynamic(() => import("./labs/LabInecuaciones").then((m) => m.LabInecuaciones), { ssr: false, loading: LabCargando });
const LabEnergiaFormas = dynamic(() => import("./labs/LabEnergiaFormas").then((m) => m.LabEnergiaFormas), { ssr: false, loading: LabCargando });
const LabParabola = dynamic(() => import("./labs/LabParabola").then((m) => m.LabParabola), { ssr: false, loading: LabCargando });
const LabEcuacionRecta = dynamic(() => import("./labs/LabEcuacionRecta").then((m) => m.LabEcuacionRecta), { ssr: false, loading: LabCargando });
const LabFunciones = dynamic(() => import("./labs/LabFunciones").then((m) => m.LabFunciones), { ssr: false, loading: LabCargando });
const LabPiramideEnergia = dynamic(() => import("./labs/LabPiramideEnergia").then((m) => m.LabPiramideEnergia), { ssr: false, loading: LabCargando });
const LabFotosintesis = dynamic(() => import("./labs/LabFotosintesis").then((m) => m.LabFotosintesis), { ssr: false, loading: LabCargando });
const LabSemejanza = dynamic(() => import("./labs/LabSemejanza").then((m) => m.LabSemejanza), { ssr: false, loading: LabCargando });
const LabCicloCarbono = dynamic(() => import("./labs/LabCicloCarbono").then((m) => m.LabCicloCarbono), { ssr: false, loading: LabCargando });
const LabCuadratica = dynamic(() => import("./labs/LabCuadratica").then((m) => m.LabCuadratica), { ssr: false, loading: LabCargando });
const LabSubsistemas = dynamic(() => import("./labs/LabSubsistemas").then((m) => m.LabSubsistemas), { ssr: false, loading: LabCargando });
const LabBiomas = dynamic(() => import("./labs/LabBiomas").then((m) => m.LabBiomas), { ssr: false, loading: LabCargando });
const LabTroficas = dynamic(() => import("./labs/LabTroficas").then((m) => m.LabTroficas), { ssr: false, loading: LabCargando });
const LabDeforestacion = dynamic(() => import("./labs/LabDeforestacion").then((m) => m.LabDeforestacion), { ssr: false, loading: LabCargando });
const LabDiscriminante = dynamic(() => import("./labs/LabDiscriminante").then((m) => m.LabDiscriminante), { ssr: false, loading: LabCargando });
const LabCirculoUnitario = dynamic(() => import("./labs/LabCirculoUnitario").then((m) => m.LabCirculoUnitario), { ssr: false, loading: LabCargando });
const LabTrianguloRectangulo = dynamic(() => import("./labs/LabTrianguloRectangulo").then((m) => m.LabTrianguloRectangulo), { ssr: false, loading: LabCargando });
const LabLeySenosCosenos = dynamic(() => import("./labs/LabLeySenosCosenos").then((m) => m.LabLeySenosCosenos), { ssr: false, loading: LabCargando });
const LabGeometriaAnalitica = dynamic(() => import("./labs/LabGeometriaAnalitica").then((m) => m.LabGeometriaAnalitica), { ssr: false, loading: LabCargando });
const LabTransformacionesFunciones = dynamic(() => import("./labs/LabTransformacionesFunciones").then((m) => m.LabTransformacionesFunciones), { ssr: false, loading: LabCargando });
const LabBalanceo = dynamic(() => import("./labs/LabBalanceo").then((m) => m.LabBalanceo), { ssr: false, loading: LabCargando });
const LabOrganica = dynamic(() => import("./labs/LabOrganica").then((m) => m.LabOrganica), { ssr: false, loading: LabCargando });
const LabPh = dynamic(() => import("./labs/LabPh").then((m) => m.LabPh), { ssr: false, loading: LabCargando });
const LabCo2 = dynamic(() => import("./labs/LabCo2").then((m) => m.LabCo2), { ssr: false, loading: LabCargando });
const LabConicas = dynamic(() => import("./labs/LabConicas").then((m) => m.LabConicas), { ssr: false, loading: LabCargando });
const LabReaccionesTipos = dynamic(() => import("./labs/LabReaccionesTipos").then((m) => m.LabReaccionesTipos), { ssr: false, loading: LabCargando });
const LabBiomoleculas = dynamic(() => import("./labs/LabBiomoleculas").then((m) => m.LabBiomoleculas), { ssr: false, loading: LabCargando });
const LabFuncionesConcepto = dynamic(() => import("./labs/LabFuncionesConcepto").then((m) => m.LabFuncionesConcepto), { ssr: false, loading: LabCargando });
const LabLimites = dynamic(() => import("./labs/LabLimites").then((m) => m.LabLimites), { ssr: false, loading: LabCargando });
const LabContinuidad = dynamic(() => import("./labs/LabContinuidad").then((m) => m.LabContinuidad), { ssr: false, loading: LabCargando });
const LabDerivada = dynamic(() => import("./labs/LabDerivada").then((m) => m.LabDerivada), { ssr: false, loading: LabCargando });
const LabReglas = dynamic(() => import("./labs/LabReglas").then((m) => m.LabReglas), { ssr: false, loading: LabCargando });
const LabTrascendentes = dynamic(() => import("./labs/LabTrascendentes").then((m) => m.LabTrascendentes), { ssr: false, loading: LabCargando });
const LabAnalisis = dynamic(() => import("./labs/LabAnalisis").then((m) => m.LabAnalisis), { ssr: false, loading: LabCargando });
const LabOptimizacion = dynamic(() => import("./labs/LabOptimizacion").then((m) => m.LabOptimizacion), { ssr: false, loading: LabCargando });
const LabDiferencial = dynamic(() => import("./labs/LabDiferencial").then((m) => m.LabDiferencial), { ssr: false, loading: LabCargando });
const LabNewton = dynamic(() => import("./labs/LabNewton").then((m) => m.LabNewton), { ssr: false, loading: LabCargando });
const LabCinematica = dynamic(() => import("./labs/LabCinematica").then((m) => m.LabCinematica), { ssr: false, loading: LabCargando });
const LabGravitacion = dynamic(() => import("./labs/LabGravitacion").then((m) => m.LabGravitacion), { ssr: false, loading: LabCargando });
const LabOndas = dynamic(() => import("./labs/LabOndas").then((m) => m.LabOndas), { ssr: false, loading: LabCargando });
const LabEspectro = dynamic(() => import("./labs/LabEspectro").then((m) => m.LabEspectro), { ssr: false, loading: LabCargando });
const LabOptica = dynamic(() => import("./labs/LabOptica").then((m) => m.LabOptica), { ssr: false, loading: LabCargando });
const LabElectromagnetismo = dynamic(() => import("./labs/LabElectromagnetismo").then((m) => m.LabElectromagnetismo), { ssr: false, loading: LabCargando });
const LabGeneticaMendel = dynamic(() => import("./labs/LabGeneticaMendel").then((m) => m.LabGeneticaMendel), { ssr: false, loading: LabCargando });
const LabCelula = dynamic(() => import("./labs/LabCelula").then((m) => m.LabCelula), { ssr: false, loading: LabCargando });
const LabMetabolismo = dynamic(() => import("./labs/LabMetabolismo").then((m) => m.LabMetabolismo), { ssr: false, loading: LabCargando });
const LabSeleccionNatural = dynamic(() => import("./labs/LabSeleccionNatural").then((m) => m.LabSeleccionNatural), { ssr: false, loading: LabCargando });
const LabAdnDogma = dynamic(() => import("./labs/LabAdnDogma").then((m) => m.LabAdnDogma), { ssr: false, loading: LabCargando });
const LabOrigenVida = dynamic(() => import("./labs/LabOrigenVida").then((m) => m.LabOrigenVida), { ssr: false, loading: LabCargando });
const LabMutaciones = dynamic(() => import("./labs/LabMutaciones").then((m) => m.LabMutaciones), { ssr: false, loading: LabCargando });
const LabBiotecnologia = dynamic(() => import("./labs/LabBiotecnologia").then((m) => m.LabBiotecnologia), { ssr: false, loading: LabCargando });
const LabFluidos = dynamic(() => import("./labs/LabFluidos").then((m) => m.LabFluidos), { ssr: false, loading: LabCargando });
const LabDivisionCelular = dynamic(() => import("./labs/LabDivisionCelular").then((m) => m.LabDivisionCelular), { ssr: false, loading: LabCargando });
const LabCalor = dynamic(() => import("./labs/LabCalor").then((m) => m.LabCalor), { ssr: false, loading: LabCargando });
const LabRedox = dynamic(() => import("./labs/LabRedox").then((m) => m.LabRedox), { ssr: false, loading: LabCargando });
const LabTfc = dynamic(() => import("./labs/LabTfc").then((m) => m.LabTfc), { ssr: false, loading: LabCargando });
const LabNormal = dynamic(() => import("./labs/LabNormal").then((m) => m.LabNormal), { ssr: false, loading: LabCargando });
const LabEquilibrio = dynamic(() => import("./labs/LabEquilibrio").then((m) => m.LabEquilibrio), { ssr: false, loading: LabCargando });
const LabRespiracion = dynamic(() => import("./labs/LabRespiracion").then((m) => m.LabRespiracion), { ssr: false, loading: LabCargando });
const LabEstructuraReaccion = dynamic(() => import("./labs/LabEstructuraReaccion").then((m) => m.LabEstructuraReaccion), { ssr: false, loading: LabCargando });
const LabTendenciaCentral = dynamic(() => import("./labs/LabEstadistica").then((m) => m.LabTendenciaCentral), { ssr: false, loading: LabCargando });
const LabDispersion = dynamic(() => import("./labs/LabEstadistica").then((m) => m.LabDispersion), { ssr: false, loading: LabCargando });
const LabHistograma = dynamic(() => import("./labs/LabEstadistica").then((m) => m.LabHistograma), { ssr: false, loading: LabCargando });
const LabModeladoConicas = dynamic(() => import("./labs/LabModeladoConicas").then((m) => m.LabModeladoConicas), { ssr: false, loading: LabCargando });
const LabLenguajeAlgebraico = dynamic(() => import("./labs/LabAlgebraTiles").then((m) => m.LabLenguajeAlgebraico), { ssr: false, loading: LabCargando });
const LabClasificacionExpresiones = dynamic(() => import("./labs/LabAlgebraTiles").then((m) => m.LabClasificacionExpresiones), { ssr: false, loading: LabCargando });
const LabOperacionesMonomiosBinomios = dynamic(() => import("./labs/LabAlgebraTiles").then((m) => m.LabOperacionesMonomiosBinomios), { ssr: false, loading: LabCargando });
const LabHardwareSoftware = dynamic(() => import("./labs/LabHardwareSoftware").then((m) => m.LabHardwareSoftware), { ssr: false, loading: LabCargando });
const LabConstructorAlgoritmos = dynamic(() => import("./labs/LabConstructorAlgoritmos").then((m) => m.LabConstructorAlgoritmos), { ssr: false, loading: LabCargando });
const LabTallerParrafos = dynamic(() => import("./labs/LabTallerParrafos").then((m) => m.LabTallerParrafos), { ssr: false, loading: LabCargando });
const LabPresentacionesIngles = dynamic(() => import("./labs/LabPresentacionesIngles").then((m) => m.LabPresentacionesIngles), { ssr: false, loading: LabCargando });
const LabLicenciasSoftware = dynamic(() => import("./labs/LabLicenciasSoftware").then((m) => m.LabLicenciasSoftware), { ssr: false, loading: LabCargando });
const LabEstadoMexicano = dynamic(() => import("./labs/LabEstadoMexicano").then((m) => m.LabEstadoMexicano), { ssr: false, loading: LabCargando });
const LabConcordanciaConectores = dynamic(() => import("./labs/LabConcordanciaConectores").then((m) => m.LabConcordanciaConectores), { ssr: false, loading: LabCargando });
const LabPosesivosIngles = dynamic(() => import("./labs/LabPosesivosIngles").then((m) => m.LabPosesivosIngles), { ssr: false, loading: LabCargando });
const LabComparativosIngles = dynamic(() => import("./labs/LabComparativosIngles").then((m) => m.LabComparativosIngles), { ssr: false, loading: LabCargando });
const LabPasadoSimpleIngles = dynamic(() => import("./labs/LabPasadoSimpleIngles").then((m) => m.LabPasadoSimpleIngles), { ssr: false, loading: LabCargando });
const LabPersonajesEscenarios = dynamic(() => import("./labs/LabPersonajesEscenarios").then((m) => m.LabPersonajesEscenarios), { ssr: false, loading: LabCargando });
const LabCausalidadHistorica = dynamic(() => import("./labs/LabCausalidadHistorica").then((m) => m.LabCausalidadHistorica), { ssr: false, loading: LabCargando });
const LabFuentesHistoricas = dynamic(() => import("./labs/LabFuentesHistoricas").then((m) => m.LabFuentesHistoricas), { ssr: false, loading: LabCargando });
const LabFakeNews = dynamic(() => import("./labs/LabFakeNews").then((m) => m.LabFakeNews), { ssr: false, loading: LabCargando });
const LabFactoresProduccion = dynamic(() => import("./labs/LabFactoresProduccion").then((m) => m.LabFactoresProduccion), { ssr: false, loading: LabCargando });
const LabNecesidadesSatisfactores = dynamic(() => import("./labs/LabNecesidadesSatisfactores").then((m) => m.LabNecesidadesSatisfactores), { ssr: false, loading: LabCargando });
const LabMovimientosLiterarios = dynamic(() => import("./labs/LabMovimientosLiterarios").then((m) => m.LabMovimientosLiterarios), { ssr: false, loading: LabCargando });
const LabFigurasRetoricas = dynamic(() => import("./labs/LabFigurasRetoricas").then((m) => m.LabFigurasRetoricas), { ssr: false, loading: LabCargando });
const LabHipotesisHistoricas = dynamic(() => import("./labs/LabHipotesisHistoricas").then((m) => m.LabHipotesisHistoricas), { ssr: false, loading: LabCargando });
const LabComunicacionMultimodal = dynamic(() => import("./labs/LabComunicacionMultimodal").then((m) => m.LabComunicacionMultimodal), { ssr: false, loading: LabCargando });
const LabDiversidadDiscriminacion = dynamic(() => import("./labs/LabDiversidadDiscriminacion").then((m) => m.LabDiversidadDiscriminacion), { ssr: false, loading: LabCargando });
const LabRelacionesPoder = dynamic(() => import("./labs/LabRelacionesPoder").then((m) => m.LabRelacionesPoder), { ssr: false, loading: LabCargando });
const LabPoliticasPublicas = dynamic(() => import("./labs/LabPoliticasPublicas").then((m) => m.LabPoliticasPublicas), { ssr: false, loading: LabCargando });
const LabGenerosLiterarios = dynamic(() => import("./labs/LabGenerosLiterarios").then((m) => m.LabGenerosLiterarios), { ssr: false, loading: LabCargando });
const LabPresentPerfectIngles = dynamic(() => import("./labs/LabPresentPerfectIngles").then((m) => m.LabPresentPerfectIngles), { ssr: false, loading: LabCargando });
const LabSentidoHistorico = dynamic(() => import("./labs/LabSentidoHistorico").then((m) => m.LabSentidoHistorico), { ssr: false, loading: LabCargando });
const LabSubgenerosNarrativos = dynamic(() => import("./labs/LabSubgenerosNarrativos").then((m) => m.LabSubgenerosNarrativos), { ssr: false, loading: LabCargando });
const LabResenaCritica = dynamic(() => import("./labs/LabResenaCritica").then((m) => m.LabResenaCritica), { ssr: false, loading: LabCargando });
const LabExposicionOral = dynamic(() => import("./labs/LabExposicionOral").then((m) => m.LabExposicionOral), { ssr: false, loading: LabCargando });
const LabProcesosIngles = dynamic(() => import("./labs/LabProcesosIngles").then((m) => m.LabProcesosIngles), { ssr: false, loading: LabCargando });
const LabJuventudesPoliticas = dynamic(() => import("./labs/LabJuventudesPoliticas").then((m) => m.LabJuventudesPoliticas), { ssr: false, loading: LabCargando });
const LabMexicoEnElMundo = dynamic(() => import("./labs/LabMexicoEnElMundo").then((m) => m.LabMexicoEnElMundo), { ssr: false, loading: LabCargando });
const LabConsejosIngles = dynamic(() => import("./labs/LabConsejosIngles").then((m) => m.LabConsejosIngles), { ssr: false, loading: LabCargando });
const LabBusquedaConfiable = dynamic(() => import("./labs/LabBusquedaConfiable").then((m) => m.LabBusquedaConfiable), { ssr: false, loading: LabCargando });
const LabTiposGraficas = dynamic(() => import("./labs/LabTiposGraficas").then((m) => m.LabTiposGraficas), { ssr: false, loading: LabCargando });
const LabEticaProduccionDigital = dynamic(() => import("./labs/LabEticaProduccionDigital").then((m) => m.LabEticaProduccionDigital), { ssr: false, loading: LabCargando });
const LabCarrerasDigitales = dynamic(() => import("./labs/LabCarrerasDigitales").then((m) => m.LabCarrerasDigitales), { ssr: false, loading: LabCargando });
const LabFalaciasLogica = dynamic(() => import("./labs/LabFalaciasLogica").then((m) => m.LabFalaciasLogica), { ssr: false, loading: LabCargando });
const LabBioetica = dynamic(() => import("./labs/LabBioetica").then((m) => m.LabBioetica), { ssr: false, loading: LabCargando });
const LabNavegacionSegura = dynamic(() => import("./labs/LabNavegacionSegura").then((m) => m.LabNavegacionSegura), { ssr: false, loading: LabCargando });
const LabAlgoritmosDeciden = dynamic(() => import("./labs/LabAlgoritmosDeciden").then((m) => m.LabAlgoritmosDeciden), { ssr: false, loading: LabCargando });
const LabTiempoHistorico = dynamic(() => import("./labs/LabTiempoHistorico").then((m) => m.LabTiempoHistorico), { ssr: false, loading: LabCargando });
const LabReglasIngles = dynamic(() => import("./labs/LabReglasIngles").then((m) => m.LabReglasIngles), { ssr: false, loading: LabCargando });
const LabTiposDePreguntas = dynamic(() => import("./labs/LabTiposDePreguntas").then((m) => m.LabTiposDePreguntas), { ssr: false, loading: LabCargando });
const LabHerramientasColaborativas = dynamic(() => import("./labs/LabHerramientasColaborativas").then((m) => m.LabHerramientasColaborativas), { ssr: false, loading: LabCargando });

/** Props que recibe cada componente de laboratorio. */
export interface PracticaLabProps {
  /** Color del área (UAC) para coherencia visual. */
  color: AreaColor;
  /** Código de la actividad de la que cuelga la práctica (p. ej. CNEYT-I-P02-A2). */
  actividadCodigo: string;
  /** Título de la actividad. */
  actividadTitulo: string;
}

export interface PracticaDef {
  /** Identificador único (= valor de actividades.practica_slug). */
  slug: string;
  /** Nombre visible de la práctica. */
  titulo: string;
  /** Descripción corta opcional. */
  descripcion?: string;
  /** Componente React del laboratorio. */
  Component: ComponentType<PracticaLabProps>;
}

export const PRACTICAS: Record<string, PracticaDef> = {
  densidad: { ...PRACTICAS_META["densidad"]!, Component: LabDensidad },
  "estados-materia": { ...PRACTICAS_META["estados-materia"]!, Component: LabEstadosMateria },
  "modelos-atomicos": { ...PRACTICAS_META["modelos-atomicos"]!, Component: LabModelosAtomicos },
  "enlaces-quimicos": { ...PRACTICAS_META["enlaces-quimicos"]!, Component: LabEnlacesQuimicos },
  "conservacion-materia": { ...PRACTICAS_META["conservacion-materia"]!, Component: LabConservacionMateria },
  "energia-electricidad": { ...PRACTICAS_META["energia-electricidad"]!, Component: LabEnergiaElectricidad },
  "separacion-mezclas": { ...PRACTICAS_META["separacion-mezclas"]!, Component: LabSeparacionMezclas },
  "propiedades-materia": { ...PRACTICAS_META["propiedades-materia"]!, Component: LabPropiedadesMateria },
  "fracciones-porcentajes": { ...PRACTICAS_META["fracciones-porcentajes"]!, Component: LabFracciones },
  "potencias-raices": { ...PRACTICAS_META["potencias-raices"]!, Component: LabPotencias },
  "concentracion-disolucion": { ...PRACTICAS_META["concentracion-disolucion"]!, Component: LabConcentracion },
  "razon-proporcion": { ...PRACTICAS_META["razon-proporcion"]!, Component: LabProporcion },
  "recta-numerica": { ...PRACTICAS_META["recta-numerica"]!, Component: LabRectaNumerica },
  "notacion-cientifica": { ...PRACTICAS_META["notacion-cientifica"]!, Component: LabNotacionCientifica },
  "valor-posicional": { ...PRACTICAS_META["valor-posicional"]!, Component: LabValorPosicional },
  "sistemas-ecuaciones-2x2": { ...PRACTICAS_META["sistemas-ecuaciones-2x2"]!, Component: LabSistemas },
  "ecuacion-lineal-balanza": { ...PRACTICAS_META["ecuacion-lineal-balanza"]!, Component: LabBalanza },
  "teorema-pitagoras": { ...PRACTICAS_META["teorema-pitagoras"]!, Component: LabPitagoras },
  "volumen-cilindro": { ...PRACTICAS_META["volumen-cilindro"]!, Component: LabCilindro },
  "factorizacion-area": { ...PRACTICAS_META["factorizacion-area"]!, Component: LabFactorizacion },
  "ecuacion-lineal-barras": { ...PRACTICAS_META["ecuacion-lineal-barras"]!, Component: LabEcuaciones },
  "productos-notables-3d": { ...PRACTICAS_META["productos-notables-3d"]!, Component: LabProductos },
  "conservacion-energia-pendulo": { ...PRACTICAS_META["conservacion-energia-pendulo"]!, Component: LabConservacion },
  "gas-ideal-piston": { ...PRACTICAS_META["gas-ideal-piston"]!, Component: LabGasIdeal },
  "transferencia-calor-mecanismos": { ...PRACTICAS_META["transferencia-calor-mecanismos"]!, Component: LabTransferenciaCalor },
  "entropia-segunda-ley": { ...PRACTICAS_META["entropia-segunda-ley"]!, Component: LabEntropia },
  "maquina-termica-ciclos": { ...PRACTICAS_META["maquina-termica-ciclos"]!, Component: LabMaquinaTermica },
  "trabajo-potencia-mecanica": { ...PRACTICAS_META["trabajo-potencia-mecanica"]!, Component: LabTrabajoPotencia },
  "inecuaciones-lineales": { ...PRACTICAS_META["inecuaciones-lineales"]!, Component: LabInecuaciones },
  "formas-energia-transformacion": { ...PRACTICAS_META["formas-energia-transformacion"]!, Component: LabEnergiaFormas },
  "parabola-trayectoria": { ...PRACTICAS_META["parabola-trayectoria"]!, Component: LabParabola },
  "ecuacion-recta": { ...PRACTICAS_META["ecuacion-recta"]!, Component: LabEcuacionRecta },
  "funciones-variable-real": { ...PRACTICAS_META["funciones-variable-real"]!, Component: LabFunciones },
  "teorema-fundamental-calculo": { ...PRACTICAS_META["teorema-fundamental-calculo"]!, Component: LabTfc },
  "distribucion-normal": { ...PRACTICAS_META["distribucion-normal"]!, Component: LabNormal },
  "medidas-tendencia-central": { ...PRACTICAS_META["medidas-tendencia-central"]!, Component: LabTendenciaCentral },
  "medidas-dispersion": { ...PRACTICAS_META["medidas-dispersion"]!, Component: LabDispersion },
  "datos-graficas-estadisticas": { ...PRACTICAS_META["datos-graficas-estadisticas"]!, Component: LabHistograma },
  "piramide-energia": { ...PRACTICAS_META["piramide-energia"]!, Component: LabPiramideEnergia },
  fotosintesis: { ...PRACTICAS_META["fotosintesis"]!, Component: LabFotosintesis },
  "semejanza-triangulos": { ...PRACTICAS_META["semejanza-triangulos"]!, Component: LabSemejanza },
  "ciclo-carbono": { ...PRACTICAS_META["ciclo-carbono"]!, Component: LabCicloCarbono },
  "ecuacion-cuadratica": { ...PRACTICAS_META["ecuacion-cuadratica"]!, Component: LabCuadratica },
  "subsistemas-terrestres": { ...PRACTICAS_META["subsistemas-terrestres"]!, Component: LabSubsistemas },
  "biomas-ecosistemas": { ...PRACTICAS_META["biomas-ecosistemas"]!, Component: LabBiomas },
  "redes-troficas": { ...PRACTICAS_META["redes-troficas"]!, Component: LabTroficas },
  deforestacion: { ...PRACTICAS_META["deforestacion"]!, Component: LabDeforestacion },
  discriminante: { ...PRACTICAS_META["discriminante"]!, Component: LabDiscriminante },
  "circulo-unitario": { ...PRACTICAS_META["circulo-unitario"]!, Component: LabCirculoUnitario },
  "triangulo-rectangulo": { ...PRACTICAS_META["triangulo-rectangulo"]!, Component: LabTrianguloRectangulo },
  "ley-senos-cosenos": { ...PRACTICAS_META["ley-senos-cosenos"]!, Component: LabLeySenosCosenos },
  "geometria-analitica": { ...PRACTICAS_META["geometria-analitica"]!, Component: LabGeometriaAnalitica },
  "transformaciones-funciones": { ...PRACTICAS_META["transformaciones-funciones"]!, Component: LabTransformacionesFunciones },
  "balanceo-ecuaciones": { ...PRACTICAS_META["balanceo-ecuaciones"]!, Component: LabBalanceo },
  "organica-visor": { ...PRACTICAS_META["organica-visor"]!, Component: LabOrganica },
  "ph-escala": { ...PRACTICAS_META["ph-escala"]!, Component: LabPh },
  "reaccion-co2": { ...PRACTICAS_META["reaccion-co2"]!, Component: LabCo2 },
  "conicas-lugares-geometricos": { ...PRACTICAS_META["conicas-lugares-geometricos"]!, Component: LabConicas },
  "modelado-conicas-estimacion": { ...PRACTICAS_META["modelado-conicas-estimacion"]!, Component: LabModeladoConicas },
  "lenguaje-algebraico-mosaicos": { ...PRACTICAS_META["lenguaje-algebraico-mosaicos"]!, Component: LabLenguajeAlgebraico },
  "clasificacion-expresiones-mosaicos": { ...PRACTICAS_META["clasificacion-expresiones-mosaicos"]!, Component: LabClasificacionExpresiones },
  "operaciones-binomios-mosaicos": { ...PRACTICAS_META["operaciones-binomios-mosaicos"]!, Component: LabOperacionesMonomiosBinomios },
  "tipos-reacciones-quimicas": { ...PRACTICAS_META["tipos-reacciones-quimicas"]!, Component: LabReaccionesTipos },
  "biomoleculas-cuatro-clases": { ...PRACTICAS_META["biomoleculas-cuatro-clases"]!, Component: LabBiomoleculas },
  "funciones-concepto": { ...PRACTICAS_META["funciones-concepto"]!, Component: LabFuncionesConcepto },
  "limites-acercamiento": { ...PRACTICAS_META["limites-acercamiento"]!, Component: LabLimites },
  "continuidad-tres-condiciones": { ...PRACTICAS_META["continuidad-tres-condiciones"]!, Component: LabContinuidad },
  "derivada-secante-tangente": { ...PRACTICAS_META["derivada-secante-tangente"]!, Component: LabDerivada },
  "reglas-derivacion": { ...PRACTICAS_META["reglas-derivacion"]!, Component: LabReglas },
  "trascendentes-derivacion": { ...PRACTICAS_META["trascendentes-derivacion"]!, Component: LabTrascendentes },
  "extremos-inflexion": { ...PRACTICAS_META["extremos-inflexion"]!, Component: LabAnalisis },
  "optimizacion-cilindro": { ...PRACTICAS_META["optimizacion-cilindro"]!, Component: LabOptimizacion },
  "diferencial-linealizacion": { ...PRACTICAS_META["diferencial-linealizacion"]!, Component: LabDiferencial },
  "dcl-leyes-newton": { ...PRACTICAS_META["dcl-leyes-newton"]!, Component: LabNewton },
  "mrua-acelerar-frenar": { ...PRACTICAS_META["mrua-acelerar-frenar"]!, Component: LabCinematica },
  "gravitacion-universal": { ...PRACTICAS_META["gravitacion-universal"]!, Component: LabGravitacion },
  "ondas-amplitud-frecuencia": { ...PRACTICAS_META["ondas-amplitud-frecuencia"]!, Component: LabOndas },
  "espectro-electromagnetico": { ...PRACTICAS_META["espectro-electromagnetico"]!, Component: LabEspectro },
  "optica-lentes-espejos": { ...PRACTICAS_META["optica-lentes-espejos"]!, Component: LabOptica },
  "electromagnetismo-ohm-faraday": { ...PRACTICAS_META["electromagnetismo-ohm-faraday"]!, Component: LabElectromagnetismo },
  "genetica-mendeliana-punnett": { ...PRACTICAS_META["genetica-mendeliana-punnett"]!, Component: LabGeneticaMendel },
  "celula-organelos-3d": { ...PRACTICAS_META["celula-organelos-3d"]!, Component: LabCelula },
  "metabolismo-celular-3d": { ...PRACTICAS_META["metabolismo-celular-3d"]!, Component: LabMetabolismo },
  "seleccion-natural-evolucion-3d": { ...PRACTICAS_META["seleccion-natural-evolucion-3d"]!, Component: LabSeleccionNatural },
  "adn-dogma-central-3d": { ...PRACTICAS_META["adn-dogma-central-3d"]!, Component: LabAdnDogma },
  "origen-vida-3d": { ...PRACTICAS_META["origen-vida-3d"]!, Component: LabOrigenVida },
  "mutaciones-3d": { ...PRACTICAS_META["mutaciones-3d"]!, Component: LabMutaciones },
  "biotecnologia-crispr-3d": { ...PRACTICAS_META["biotecnologia-crispr-3d"]!, Component: LabBiotecnologia },
  fluidos: { ...PRACTICAS_META["fluidos"]!, Component: LabFluidos },
  "division-celular": { ...PRACTICAS_META["division-celular"]!, Component: LabDivisionCelular },
  "propagacion-calor": { ...PRACTICAS_META["propagacion-calor"]!, Component: LabCalor },
  "redox-combustion": { ...PRACTICAS_META["redox-combustion"]!, Component: LabRedox },
  "equilibrio-quimico": { ...PRACTICAS_META["equilibrio-quimico"]!, Component: LabEquilibrio },
  "respiracion-celular": { ...PRACTICAS_META["respiracion-celular"]!, Component: LabRespiracion },
  "estructura-reaccion": { ...PRACTICAS_META["estructura-reaccion"]!, Component: LabEstructuraReaccion },
  "hardware-software": { ...PRACTICAS_META["hardware-software"]!, Component: LabHardwareSoftware },
  "constructor-algoritmos": { ...PRACTICAS_META["constructor-algoritmos"]!, Component: LabConstructorAlgoritmos },
  "taller-parrafos": { ...PRACTICAS_META["taller-parrafos"]!, Component: LabTallerParrafos },
  "presentaciones-ingles": { ...PRACTICAS_META["presentaciones-ingles"]!, Component: LabPresentacionesIngles },
  "licencias-software": { ...PRACTICAS_META["licencias-software"]!, Component: LabLicenciasSoftware },
  "estado-mexicano": { ...PRACTICAS_META["estado-mexicano"]!, Component: LabEstadoMexicano },
  "concordancia-conectores": { ...PRACTICAS_META["concordancia-conectores"]!, Component: LabConcordanciaConectores },
  "posesivos-ingles": { ...PRACTICAS_META["posesivos-ingles"]!, Component: LabPosesivosIngles },
  "comparativos-ingles": { ...PRACTICAS_META["comparativos-ingles"]!, Component: LabComparativosIngles },
  "pasado-simple-ingles": { ...PRACTICAS_META["pasado-simple-ingles"]!, Component: LabPasadoSimpleIngles },
  "personajes-escenarios": { ...PRACTICAS_META["personajes-escenarios"]!, Component: LabPersonajesEscenarios },
  "causalidad-historica": { ...PRACTICAS_META["causalidad-historica"]!, Component: LabCausalidadHistorica },
  "fuentes-historicas": { ...PRACTICAS_META["fuentes-historicas"]!, Component: LabFuentesHistoricas },
  "deteccion-fake-news": { ...PRACTICAS_META["deteccion-fake-news"]!, Component: LabFakeNews },
  "factores-produccion": { ...PRACTICAS_META["factores-produccion"]!, Component: LabFactoresProduccion },
  "necesidades-satisfactores": { ...PRACTICAS_META["necesidades-satisfactores"]!, Component: LabNecesidadesSatisfactores },
  "movimientos-literarios": { ...PRACTICAS_META["movimientos-literarios"]!, Component: LabMovimientosLiterarios },
  "figuras-retoricas": { ...PRACTICAS_META["figuras-retoricas"]!, Component: LabFigurasRetoricas },
  "hipotesis-historicas": { ...PRACTICAS_META["hipotesis-historicas"]!, Component: LabHipotesisHistoricas },
  "comunicacion-multimodal": { ...PRACTICAS_META["comunicacion-multimodal"]!, Component: LabComunicacionMultimodal },
  "diversidad-discriminacion": { ...PRACTICAS_META["diversidad-discriminacion"]!, Component: LabDiversidadDiscriminacion },
  "relaciones-poder": { ...PRACTICAS_META["relaciones-poder"]!, Component: LabRelacionesPoder },
  "politicas-publicas": { ...PRACTICAS_META["politicas-publicas"]!, Component: LabPoliticasPublicas },
  "generos-literarios": { ...PRACTICAS_META["generos-literarios"]!, Component: LabGenerosLiterarios },
  "present-perfect-ingles": { ...PRACTICAS_META["present-perfect-ingles"]!, Component: LabPresentPerfectIngles },
  "sentido-historico": { ...PRACTICAS_META["sentido-historico"]!, Component: LabSentidoHistorico },
  "subgeneros-narrativos": { ...PRACTICAS_META["subgeneros-narrativos"]!, Component: LabSubgenerosNarrativos },
  "resena-critica": { ...PRACTICAS_META["resena-critica"]!, Component: LabResenaCritica },
  "exposicion-oral": { ...PRACTICAS_META["exposicion-oral"]!, Component: LabExposicionOral },
  "procesos-ingles": { ...PRACTICAS_META["procesos-ingles"]!, Component: LabProcesosIngles },
  "juventudes-politicas": { ...PRACTICAS_META["juventudes-politicas"]!, Component: LabJuventudesPoliticas },
  "mexico-en-el-mundo": { ...PRACTICAS_META["mexico-en-el-mundo"]!, Component: LabMexicoEnElMundo },
  "consejos-ingles": { ...PRACTICAS_META["consejos-ingles"]!, Component: LabConsejosIngles },
  "busqueda-confiable": { ...PRACTICAS_META["busqueda-confiable"]!, Component: LabBusquedaConfiable },
  "tipos-graficas": { ...PRACTICAS_META["tipos-graficas"]!, Component: LabTiposGraficas },
  "etica-produccion-digital": { ...PRACTICAS_META["etica-produccion-digital"]!, Component: LabEticaProduccionDigital },
  "carreras-digitales": { ...PRACTICAS_META["carreras-digitales"]!, Component: LabCarrerasDigitales },
  "falacias-logica": { ...PRACTICAS_META["falacias-logica"]!, Component: LabFalaciasLogica },
  bioetica: { ...PRACTICAS_META["bioetica"]!, Component: LabBioetica },
  "navegacion-segura": { ...PRACTICAS_META["navegacion-segura"]!, Component: LabNavegacionSegura },
  "algoritmos-deciden": { ...PRACTICAS_META["algoritmos-deciden"]!, Component: LabAlgoritmosDeciden },
  "tiempo-historico": { ...PRACTICAS_META["tiempo-historico"]!, Component: LabTiempoHistorico },
  "reglas-ingles": { ...PRACTICAS_META["reglas-ingles"]!, Component: LabReglasIngles },
  "tipos-de-preguntas": { ...PRACTICAS_META["tipos-de-preguntas"]!, Component: LabTiposDePreguntas },
  "herramientas-colaborativas": { ...PRACTICAS_META["herramientas-colaborativas"]!, Component: LabHerramientasColaborativas },
};

/** Devuelve la práctica registrada para un slug, o null si no existe. */
export function getPractica(slug: string | null | undefined): PracticaDef | null {
  if (!slug) return null;
  return PRACTICAS[slug] ?? null;
}
