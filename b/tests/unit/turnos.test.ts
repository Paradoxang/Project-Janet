import { describe, expect, it } from "vitest";
import { crearTurnos } from "@/lib/turnos";

/** Programador a mano: las tareas esperan hasta que la prueba llama a `correr()`. */
function programadorManual() {
  const tareas: Array<() => void> = [];
  return {
    programar: (tarea: () => void) => void tareas.push(tarea),
    correr() {
      while (tareas.length) tareas.shift()!();
    },
  };
}

describe("turnos (tarjetas holográficas)", () => {
  it("no concede más turnos que el máximo y los da en orden de llegada", () => {
    const reloj = programadorManual();
    const turnos = crearTurnos(2, reloj.programar);
    const concedidos: string[] = [];
    for (const id of ["a", "b", "c", "d"]) turnos.pedir(() => concedidos.push(id));

    expect(concedidos).toEqual([]); // nada hasta que el navegador esté libre
    reloj.correr();
    expect(concedidos).toEqual(["a", "b"]);
    expect(turnos.ocupados()).toBe(2);
    expect(turnos.enCola()).toBe(2);
  });

  it("al soltar un turno se lo da al siguiente de la cola", () => {
    const reloj = programadorManual();
    const turnos = crearTurnos(1, reloj.programar);
    const concedidos: string[] = [];
    const soltarA = turnos.pedir(() => concedidos.push("a"));
    turnos.pedir(() => concedidos.push("b"));
    reloj.correr();
    expect(concedidos).toEqual(["a"]);

    soltarA();
    soltarA(); // soltar dos veces no libera otro turno
    reloj.correr();
    expect(concedidos).toEqual(["a", "b"]);
    expect(turnos.ocupados()).toBe(1);
  });

  it("quien se va mientras espera sale de la cola sin ocupar turno", () => {
    const reloj = programadorManual();
    const turnos = crearTurnos(1, reloj.programar);
    const concedidos: string[] = [];
    const soltarA = turnos.pedir(() => concedidos.push("a"));
    const soltarB = turnos.pedir(() => concedidos.push("b"));
    turnos.pedir(() => concedidos.push("c"));
    reloj.correr();

    soltarB();
    expect(turnos.enCola()).toBe(1);
    soltarA();
    reloj.correr();
    expect(concedidos).toEqual(["a", "c"]);
    expect(turnos.ocupados()).toBe(1);
  });

  it("concede de uno en uno: cada turno es una tarea aparte", () => {
    const tareas: Array<() => void> = [];
    const turnos = crearTurnos(3, (t) => void tareas.push(t));
    const concedidos: string[] = [];
    for (const id of ["a", "b", "c"]) turnos.pedir(() => concedidos.push(id));

    expect(tareas).toHaveLength(1);
    tareas.shift()!();
    expect(concedidos).toEqual(["a"]);
    expect(tareas).toHaveLength(1);
    tareas.shift()!();
    tareas.shift()!();
    expect(concedidos).toEqual(["a", "b", "c"]);
    expect(tareas).toHaveLength(0);
  });
});
