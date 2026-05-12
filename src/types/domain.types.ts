import type { Database } from "./database.types";

export type Escuela = Database["public"]["Tables"]["escuelas"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Grupo = Database["public"]["Tables"]["grupos"]["Row"];
export type ComponenteCurricular = Database["public"]["Tables"]["componentes_curriculares"]["Row"];
export type RecursoSociocognitivo = Database["public"]["Tables"]["recursos_sociocognitivos"]["Row"];
export type AreaConocimiento = Database["public"]["Tables"]["areas_conocimiento"]["Row"];
export type RecursoSocioemocional = Database["public"]["Tables"]["recursos_socioemocionales"]["Row"];
export type UAC = Database["public"]["Tables"]["uac"]["Row"];
export type Progresion = Database["public"]["Tables"]["progresiones"]["Row"];
export type Actividad = Database["public"]["Tables"]["actividades"]["Row"];
export type Intento = Database["public"]["Tables"]["intentos"]["Row"];

export type Role = Profile["role"];
export type Subsistema = NonNullable<Escuela["subsistema"]>;
export type AreaEleccion = NonNullable<Profile["area_eleccion"]>;

export type SemestreNum = 1 | 2 | 3 | 4 | 5 | 6;

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

export interface UACConProgresiones extends UAC {
  progresiones: Progresion[];
}

export interface SemestreData {
  semestre: SemestreNum;
  recursos_sociocognitivos: UAC[];
  area_uacs?: UAC[];
  recursos_socioemocionales: RecursoSocioemocional[];
}
