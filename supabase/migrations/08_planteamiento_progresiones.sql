-- ============================================================
-- Migración 08: Tabla planteamiento_progresiones
-- Propósito: Almacenar el plan didáctico completo por progresión
--            MCCEMS. Estructura espejo de pedagogiaData de Financiera.
-- Versión curricular: MCCEMS_2025
-- ============================================================

CREATE TABLE IF NOT EXISTS planteamiento_progresiones (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  progresion_id       UUID        NOT NULL REFERENCES progresiones(id) ON DELETE CASCADE,
  contenido           JSONB       NOT NULL,
  version_curricular  TEXT        NOT NULL DEFAULT 'MCCEMS_2025',
  nivel_revision      TEXT        NOT NULL DEFAULT 'borrador'
                                  CHECK (nivel_revision IN ('borrador', 'robustecida', 'validada_pedagogicamente')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(progresion_id, version_curricular)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_planteamiento_progresion
  ON planteamiento_progresiones(progresion_id);

CREATE INDEX IF NOT EXISTS idx_planteamiento_nivel_revision
  ON planteamiento_progresiones(nivel_revision);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_planteamiento_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_planteamiento_updated_at ON planteamiento_progresiones;
CREATE TRIGGER trg_planteamiento_updated_at
  BEFORE UPDATE ON planteamiento_progresiones
  FOR EACH ROW EXECUTE FUNCTION update_planteamiento_updated_at();

-- RLS
ALTER TABLE planteamiento_progresiones ENABLE ROW LEVEL SECURITY;

-- Docentes y admins pueden leer
CREATE POLICY "docentes_leen_planteamiento" ON planteamiento_progresiones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('teacher', 'admin', 'super_admin')
    )
  );

-- Solo admin puede modificar
CREATE POLICY "admin_gestiona_planteamiento" ON planteamiento_progresiones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

COMMENT ON TABLE planteamiento_progresiones IS
  'Plan didáctico completo por progresión MCCEMS. Estructura espejo de pedagogiaData '
  'de CEN Financiera. El campo contenido sigue el schema ProgresionPlanSchema (Zod).';

COMMENT ON COLUMN planteamiento_progresiones.contenido IS
  'JSONB con estructura: {code, title, level, duration, difficulty, category, '
  'metadata:{objective,competencies[],materials[]}, strategy:{timeline[],phases[]}, '
  'theory:{introduction,sections[]}, evaluation:{exam_questions[],rubric}, teacher_tips[]}';
