/**
 * Reparte un número fijo de turnos entre quien los pide, en orden de llegada.
 * Lo usan las tarjetas holográficas: cada una es un contexto WebGL y el navegador solo deja tener unos pocos.
 * Concede de uno en uno, cuando `programar` lo diga (en el navegador, en un rato libre), para no trabar el scroll.
 */
export function crearTurnos(max: number, programar: (tarea: () => void) => void) {
  let ocupados = 0;
  let pendiente = false;
  const cola: Array<() => void> = [];

  function repartir() {
    if (pendiente || ocupados >= max || cola.length === 0) return;
    pendiente = true;
    programar(() => {
      pendiente = false;
      const conceder = ocupados < max ? cola.shift() : undefined;
      if (!conceder) return;
      ocupados++;
      conceder();
      repartir();
    });
  }

  /** Pide un turno; `alConceder` se llama cuando toca. Devuelve la función que lo suelta (o sale de la cola). */
  function pedir(alConceder: () => void) {
    let activo = false;
    let soltado = false;
    const conceder = () => {
      activo = true;
      alConceder();
    };
    cola.push(conceder);
    repartir();
    return () => {
      if (soltado) return;
      soltado = true;
      const i = cola.indexOf(conceder);
      if (i >= 0) cola.splice(i, 1);
      if (activo) {
        activo = false;
        ocupados--;
        repartir();
      }
    };
  }

  return { pedir, ocupados: () => ocupados, enCola: () => cola.length };
}
