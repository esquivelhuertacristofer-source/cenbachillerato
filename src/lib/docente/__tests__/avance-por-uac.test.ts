import { avancePorUac, cohorteDeSemestre, semestresDelDocente } from '../avance-por-uac';

const grupos = [
  { id: 'g2', semestre: 2 },
  { id: 'g4a', semestre: 4 },
  { id: 'g4b', semestre: 4 },
];
const membresias = [
  { id_alumno: 'ana', id_grupo: 'g2' },
  { id_alumno: 'beto', id_grupo: 'g4a' },
  { id_alumno: 'caro', id_grupo: 'g4b' },
];
const uacs = [
  { id: 'u2', codigo: 'PM-II', nombre: 'Pensamiento Matemático II', semestre: 2 },
  { id: 'u4', codigo: 'PM-IV', nombre: 'Pensamiento Matemático IV', semestre: 4 },
];
const progresiones = [
  { id: 'p2', uac_id: 'u2' },
  { id: 'p4', uac_id: 'u4' },
];
const actividades = [
  { id: 'a2-1', progresion_id: 'p2' },
  { id: 'a2-2', progresion_id: 'p2' },
  { id: 'a4-1', progresion_id: 'p4' },
  { id: 'a4-2', progresion_id: 'p4' },
];

describe('avance por asignatura del docente', () => {
  it('ofrece solo los semestres en los que el docente tiene grupo', () => {
    expect(semestresDelDocente(grupos)).toEqual([2, 4]);
  });

  it('la cohorte de un semestre son los alumnos de SUS grupos de ese semestre', () => {
    expect([...cohorteDeSemestre(grupos, membresias, 4)].sort()).toEqual(['beto', 'caro']);
    expect([...cohorteDeSemestre(grupos, membresias, 2)]).toEqual(['ana']);
  });

  it('solo muestra las UAC del semestre elegido', () => {
    const r = avancePorUac({ semestre: 4, cohorte: cohorteDeSemestre(grupos, membresias, 4), uacs, progresiones, actividades, intentos: [] });
    expect(r.map((u) => u.codigo)).toEqual(['PM-IV']);
  });

  it('los alumnos de otro semestre no hunden el porcentaje', () => {
    // beto y caro (4.º) completan las 2 actividades de PM-IV; ana (2.º) no cuenta.
    const intentos = ['beto', 'caro'].flatMap((u) => ['a4-1', 'a4-2'].map((a) => ({ user_id: u, actividad_id: a })));
    const r = avancePorUac({ semestre: 4, cohorte: cohorteDeSemestre(grupos, membresias, 4), uacs, progresiones, actividades, intentos });
    expect(r[0]!.pct).toBe(100);
  });

  it('repetir una actividad no infla el avance', () => {
    const intentos = [1, 2, 3].map(() => ({ user_id: 'ana', actividad_id: 'a2-1' }));
    const r = avancePorUac({ semestre: 2, cohorte: cohorteDeSemestre(grupos, membresias, 2), uacs, progresiones, actividades, intentos });
    expect(r[0]!.pct).toBe(50);
  });

  it('ignora intentos de alumnos fuera de la cohorte y sin actividad', () => {
    const intentos = [
      { user_id: 'ana', actividad_id: 'a4-1' },
      { user_id: 'beto', actividad_id: null },
    ];
    const r = avancePorUac({ semestre: 4, cohorte: cohorteDeSemestre(grupos, membresias, 4), uacs, progresiones, actividades, intentos });
    expect(r[0]!.pct).toBe(0);
  });
});
