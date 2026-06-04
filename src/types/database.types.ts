export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      escuelas: {
        Row: {
          id: string;
          nombre: string;
          cct: string | null;
          subsistema:
            | "DGB"
            | "DGETI"
            | "DGETA"
            | "DGBTED"
            | "CONALEP"
            | "CECYT"
            | "CCH"
            | "ENP"
            | "BGE"
            | "EMSAD"
            | "BD"
            | "particular"
            | "otro"
            | null;
          rvoe: string | null;
          estado: string | null;
          municipio: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          cct?: string | null;
          subsistema?: string | null;
          rvoe?: string | null;
          estado?: string | null;
          municipio?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["escuelas"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "student" | "teacher" | "admin" | "super_admin";
          escuela_id: string | null;
          semestre: number | null;
          area_eleccion:
            | "ciencias-sociales"
            | "ciencias-naturales-mate"
            | "humanidades"
            | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string;
          escuela_id?: string | null;
          semestre?: number | null;
          area_eleccion?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_escuela_id_fkey";
            columns: ["escuela_id"];
            isOneToOne: false;
            referencedRelation: "escuelas";
            referencedColumns: ["id"];
          }
        ];
      };
      grupos: {
        Row: {
          id: string;
          nombre: string;
          semestre: number;
          escuela_id: string;
          id_docente: string | null;
          uac_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          semestre: number;
          escuela_id: string;
          id_docente?: string | null;
          uac_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["grupos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "grupos_escuela_id_fkey";
            columns: ["escuela_id"];
            isOneToOne: false;
            referencedRelation: "escuelas";
            referencedColumns: ["id"];
          }
        ];
      };
      alumnos_grupos: {
        Row: {
          id_alumno: string;
          id_grupo: string;
          created_at: string;
        };
        Insert: {
          id_alumno: string;
          id_grupo: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["alumnos_grupos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "alumnos_grupos_id_alumno_fkey";
            columns: ["id_alumno"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alumnos_grupos_id_grupo_fkey";
            columns: ["id_grupo"];
            isOneToOne: false;
            referencedRelation: "grupos";
            referencedColumns: ["id"];
          }
        ];
      };
      componentes_curriculares: {
        Row: {
          id: string;
          codigo: string;
          nombre: string;
          descripcion: string | null;
          tipo: "fundamental" | "fundamental-extendido" | "ampliado" | "laboral";
        };
        Insert: {
          id?: string;
          codigo: string;
          nombre: string;
          descripcion?: string | null;
          tipo: string;
        };
        Update: Partial<Database["public"]["Tables"]["componentes_curriculares"]["Insert"]>;
        Relationships: [];
      };
      recursos_sociocognitivos: {
        Row: {
          id: string;
          codigo: string;
          nombre: string;
          descripcion: string | null;
          color: string | null;
          icono: string | null;
          orden: number | null;
        };
        Insert: {
          id?: string;
          codigo: string;
          nombre: string;
          descripcion?: string | null;
          color?: string | null;
          icono?: string | null;
          orden?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["recursos_sociocognitivos"]["Insert"]>;
        Relationships: [];
      };
      areas_conocimiento: {
        Row: {
          id: string;
          codigo: string;
          nombre: string;
          descripcion: string | null;
          color: string | null;
          icono: string | null;
          orden: number | null;
        };
        Insert: {
          id?: string;
          codigo: string;
          nombre: string;
          descripcion?: string | null;
          color?: string | null;
          icono?: string | null;
          orden?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["areas_conocimiento"]["Insert"]>;
        Relationships: [];
      };
      recursos_socioemocionales: {
        Row: {
          id: string;
          codigo: string;
          nombre: string;
          descripcion: string | null;
          orden: number | null;
        };
        Insert: {
          id?: string;
          codigo: string;
          nombre: string;
          descripcion?: string | null;
          orden?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["recursos_socioemocionales"]["Insert"]>;
        Relationships: [];
      };
      uac: {
        Row: {
          id: string;
          codigo: string;
          nombre: string;
          descripcion: string | null;
          semestre: number;
          componente_id: string;
          recurso_id: string | null;
          area_id: string | null;
          orden: number | null;
          total_progresiones: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          codigo: string;
          nombre: string;
          descripcion?: string | null;
          semestre: number;
          componente_id: string;
          recurso_id?: string | null;
          area_id?: string | null;
          orden?: number | null;
          total_progresiones?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["uac"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "uac_componente_id_fkey";
            columns: ["componente_id"];
            isOneToOne: false;
            referencedRelation: "componentes_curriculares";
            referencedColumns: ["id"];
          }
        ];
      };
      progresiones: {
        Row: {
          id: string;
          codigo: string;
          uac_id: string;
          numero: number;
          titulo: string;
          descripcion: string | null;
          meta_aprendizaje: string | null;
          categoria: string | null;
          subcategoria: string | null;
          created_at: string;
          es_placeholder: boolean;
          descripcion_extendida: string | null;
          ejes_articuladores: string[] | null;
          transversalidades: string[] | null;
          tiempo_estimado_horas: number | null;
        };
        Insert: {
          id?: string;
          codigo: string;
          uac_id: string;
          numero: number;
          titulo: string;
          descripcion?: string | null;
          meta_aprendizaje?: string | null;
          categoria?: string | null;
          subcategoria?: string | null;
          created_at?: string;
          es_placeholder?: boolean;
          descripcion_extendida?: string | null;
          ejes_articuladores?: string[] | null;
          transversalidades?: string[] | null;
          tiempo_estimado_horas?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["progresiones"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "progresiones_uac_id_fkey";
            columns: ["uac_id"];
            isOneToOne: false;
            referencedRelation: "uac";
            referencedColumns: ["id"];
          }
        ];
      };
      actividades: {
        Row: {
          id: string;
          codigo: string;
          titulo: string;
          descripcion: string | null;
          tipo: string;
          contenido: Json;
          progresion_id: string | null;
          xp: number;
          estado: "borrador" | "revision" | "publicada" | "archivada";
          escuela_owner_id: string | null;
          created_at: string;
          updated_at: string;
          tipo_codigo: string | null;
          nivel_revision: "borrador" | "robustecida" | "validada_pedagogicamente";
          practica_slug: string | null;
        };
        Insert: {
          id?: string;
          codigo: string;
          titulo: string;
          descripcion?: string | null;
          tipo: string;
          contenido: Json;
          progresion_id?: string | null;
          xp?: number;
          estado?: string;
          escuela_owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
          tipo_codigo?: string | null;
          nivel_revision?: "borrador" | "robustecida" | "validada_pedagogicamente";
          practica_slug?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["actividades"]["Insert"]>;
        Relationships: [];
      };
      intentos: {
        Row: {
          id: string;
          user_id: string;
          actividad_id: string;
          status: "in_progress" | "completed" | "failed" | "abandoned";
          score: number | null;
          tiempo_segundos: number | null;
          respuestas: Json | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          actividad_id: string;
          status?: string;
          score?: number | null;
          tiempo_segundos?: number | null;
          respuestas?: Json | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["intentos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "intentos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_consents: {
        Row: {
          id: string;
          user_id: string;
          document_type: "privacy" | "terms";
          document_version: string;
          accepted_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_type: string;
          document_version: string;
          accepted_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["user_consents"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "user_consents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_my_escuela_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
