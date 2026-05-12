export type TipoComponente =
  | "fundamental"
  | "fundamental-extendido"
  | "ampliado"
  | "laboral";

export interface ComponenteCurricularStatic {
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: TipoComponente;
}

export interface RecursoSociocognitivoStatic {
  codigo: string;
  nombre: string;
  descripcion: string;
  color: string;
  colorText: string;
  icono: string;
  orden: number;
  semestres: number[];
}

export interface AreaConocimientoStatic {
  codigo: string;
  nombre: string;
  descripcion: string;
  color: string;
  colorText: string;
  icono: string;
  orden: number;
  semestresInicio: number;
}

export interface RecursoSocioemocionalStatic {
  codigo: string;
  nombre: string;
  descripcion: string;
  orden: number;
}

export interface UACStatic {
  codigo: string;
  nombre: string;
  semestre: number;
  componenteCodigo: string;
  recursoCodigo?: string;
  areaCodigo?: string;
  orden: number;
  totalProgresionesEsperadas: number;
}
