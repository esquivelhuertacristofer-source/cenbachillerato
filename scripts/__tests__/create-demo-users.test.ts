import { buildDemoUsers, DEMO_ESCUELA, DEMO_GRUPO, DEMO_PASSWORD } from "../create-demo-users";

describe("create-demo-users — datos y estructura", () => {
  const users = buildDemoUsers();

  it("genera exactamente 12 usuarios (1 admin + 1 docente + 10 alumnos)", () => {
    expect(users).toHaveLength(12);
  });

  it("el primer usuario es admin", () => {
    const admin = users[0];
    expect(admin?.role).toBe("admin");
    expect(admin?.email).toBe("admin@cenbachillerato-demo.com");
    expect(admin?.full_name).toBe("Admin Demo");
  });

  it("el segundo usuario es teacher", () => {
    const teacher = users[1];
    expect(teacher?.role).toBe("teacher");
    expect(teacher?.email).toBe("docente@cenbachillerato-demo.com");
    expect(teacher?.full_name).toBe("Docente Demo");
  });

  it("los últimos 10 son students", () => {
    const alumnos = users.slice(2);
    expect(alumnos).toHaveLength(10);
    alumnos.forEach((u) => expect(u.role).toBe("student"));
  });

  it("los alumnos tienen semestre 1", () => {
    users.slice(2).forEach((u) => expect(u.semestre).toBe(1));
  });

  it("todos los emails tienen formato válido", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    users.forEach((u) => {
      expect(u.email).toMatch(emailRegex);
    });
  });

  it("todos usan el mismo password demo", () => {
    users.forEach((u) => expect(u.password).toBe(DEMO_PASSWORD));
  });

  it("no hay emails duplicados (idempotencia: emails son llaves únicas)", () => {
    const emails = users.map((u) => u.email);
    const unique = new Set(emails);
    expect(unique.size).toBe(emails.length);
  });

  it("los emails de alumnos siguen patrón alumnoN@", () => {
    const alumnos = users.slice(2);
    alumnos.forEach((u, i) => {
      expect(u.email).toBe(`alumno${i + 1}@cenbachillerato-demo.com`);
    });
  });

  it("todos los usuarios tienen full_name no vacío", () => {
    users.forEach((u) => {
      expect(u.full_name).toBeTruthy();
      expect(u.full_name.trim().length).toBeGreaterThan(0);
    });
  });
});

describe("create-demo-users — constantes de fixture", () => {
  it("DEMO_ESCUELA tiene CCT DEMO-001", () => {
    expect(DEMO_ESCUELA.cct).toBe("DEMO-001");
  });

  it("DEMO_ESCUELA tiene subsistema particular", () => {
    expect(DEMO_ESCUELA.subsistema).toBe("particular");
  });

  it("DEMO_GRUPO tiene semestre 1", () => {
    expect(DEMO_GRUPO.semestre).toBe(1);
  });

  it("DEMO_PASSWORD cumple formato mínimo (8+ chars, mayúscula, número, especial)", () => {
    expect(DEMO_PASSWORD.length).toBeGreaterThanOrEqual(8);
    expect(DEMO_PASSWORD).toMatch(/[A-Z]/);
    expect(DEMO_PASSWORD).toMatch(/[0-9]/);
    expect(DEMO_PASSWORD).toMatch(/[!@#$%^&*]/);
  });
});
