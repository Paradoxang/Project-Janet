import { describe, expect, it } from "vitest";
import { comprobarEntrada, CORREO_ADMIN, crearCuenta, huellaClave, type CuentaGuardada } from "@/lib/sesion";

const datos = { nombre: "Ana", correo: "Ana@Ejemplo.com ", clave: "juguetes123" };

async function cuentasCon(...lista: (typeof datos)[]) {
  const cuentas: Record<string, CuentaGuardada> = {};
  for (const d of lista) {
    const r = await crearCuenta(cuentas, d);
    if ("error" in r) throw new Error(r.error);
    cuentas[r.usuario.correo] = r.cuenta;
  }
  return cuentas;
}

describe("cuentas de la demo", () => {
  it("crea la cuenta de una compradora sin guardar la contraseña tal cual", async () => {
    const r = await crearCuenta({}, datos);
    if ("error" in r) throw new Error(r.error);
    expect(r.usuario).toEqual({ correo: "ana@ejemplo.com", nombre: "Ana", rol: "cliente" });
    expect(JSON.stringify(r.cuenta)).not.toContain("juguetes123");
    expect(r.cuenta.huella).toMatch(/^[0-9a-f]{64}$/);
    expect(r.cuenta.sal).toMatch(/^[0-9a-f]{32}$/);
  });

  it("la misma contraseña da otra huella con otra sal", async () => {
    const a = await huellaClave("juguetes123");
    const b = await huellaClave("juguetes123");
    expect(a.huella).not.toBe(b.huella);
    expect((await huellaClave("juguetes123", a.sal)).huella).toBe(a.huella);
  });

  it("valida los datos al crear la cuenta", async () => {
    const cuentas = await cuentasCon(datos);
    expect(await crearCuenta({}, { ...datos, nombre: "  " })).toEqual({ error: "nombreVacio" });
    expect(await crearCuenta({}, { ...datos, correo: "ana@" })).toEqual({ error: "correoInvalido" });
    expect(await crearCuenta({}, { ...datos, clave: "corta" })).toEqual({ error: "claveCorta" });
    expect(await crearCuenta(cuentas, { ...datos, correo: "ANA@ejemplo.com" })).toEqual({ error: "correoUsado" });
    expect(await crearCuenta({}, { ...datos, correo: "Admin@Example.com" })).toEqual({ error: "correoAdmin" });
  });

  it("entra con la contraseña correcta y no con otra", async () => {
    const cuentas = await cuentasCon(datos);
    expect(await comprobarEntrada(cuentas, "ANA@ejemplo.com", "juguetes123")).toEqual({
      usuario: { correo: "ana@ejemplo.com", nombre: "Ana", rol: "cliente" },
    });
    expect(await comprobarEntrada(cuentas, "ana@ejemplo.com", "otra-clave")).toEqual({ error: "credenciales" });
    // Mismo error si el correo no existe: no se revela qué cuentas hay.
    expect(await comprobarEntrada(cuentas, "nadie@ejemplo.com", "juguetes123")).toEqual({ error: "credenciales" });
    expect(await comprobarEntrada(cuentas, "ana@ejemplo.com", "")).toEqual({ error: "claveVacia" });
  });

  it("la dueña entra con el correo de administración y cualquier contraseña", async () => {
    expect(await comprobarEntrada({}, ` ${CORREO_ADMIN.toUpperCase()} `, "lo-que-sea")).toEqual({
      usuario: { correo: CORREO_ADMIN, nombre: "", rol: "admin" },
    });
    expect(await comprobarEntrada({}, CORREO_ADMIN, "")).toEqual({ error: "claveVacia" });
  });
});
