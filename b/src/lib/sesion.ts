// Cuentas de la demo: viven solo en el navegador. La contraseña nunca se guarda tal cual,
// solo su huella (PBKDF2 con sal). En el desarrollo real esto lo hace el servidor.

export type Rol = "cliente" | "admin";

export interface Usuario {
  correo: string;
  nombre: string;
  rol: Rol;
  /** Administración invitada (el equipo que enseña la demo), no la dueña. */
  invitado?: boolean;
}

export interface CuentaGuardada {
  nombre: string;
  sal: string;
  huella: string;
  creada: string;
}

export type ErrorSesion =
  | "nombreVacio"
  | "correoInvalido"
  | "claveCorta"
  | "claveVacia"
  | "correoUsado"
  | "correoAdmin"
  | "credenciales"
  | "claveActual"
  | "claveIgual";

/** La dueña entra con este correo y, en la demo, con cualquier contraseña (decisión del 16-10). */
export const CORREO_ADMIN = "admin@example.com";

/**
 * Quién entra al panel. Todos con cualquier contraseña (es una demo). Además de la dueña, dos cuentas de
 * administración invitada para el equipo (decisión del 16-10). Correos de ejemplo: el repositorio es público.
 */
export const ADMINISTRACION: Record<string, { nombre: string; invitado: boolean }> = {
  [CORREO_ADMIN]: { nombre: "", invitado: false },
  "santiago@example.com": { nombre: "Santiago", invitado: true },
  "juan@example.com": { nombre: "Juan", invitado: true },
};

/** Nombre con el que se guarda la sesión en el navegador (también lo lee el script de <head> del panel). */
export const GUARDADO_SESION = "cuenta";

export const CLAVE_MINIMA = 8;
const ITERACIONES = 100_000;

export const normalizarCorreo = (correo: string) => correo.trim().toLowerCase();
export const correoValido = (correo: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
export const esCorreoAdmin = (correo: string) =>
  Object.prototype.hasOwnProperty.call(ADMINISTRACION, normalizarCorreo(correo));

const aHex = (bytes: ArrayBuffer | Uint8Array) =>
  Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
const deHex = (hex: string) => new Uint8Array(hex.match(/../g)?.map((h) => parseInt(h, 16)) ?? []);

/** Huella de la contraseña con PBKDF2-SHA256. Sin `sal`, crea una nueva al azar. */
export async function huellaClave(clave: string, sal?: string): Promise<{ sal: string; huella: string }> {
  const salBytes = sal ? deHex(sal) : crypto.getRandomValues(new Uint8Array(16));
  const llave = await crypto.subtle.importKey("raw", new TextEncoder().encode(clave), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salBytes, iterations: ITERACIONES },
    llave,
    256,
  );
  return { sal: aHex(salBytes), huella: aHex(bits) };
}

export async function crearCuenta(
  cuentas: Record<string, CuentaGuardada>,
  datos: { nombre: string; correo: string; clave: string },
): Promise<{ error: ErrorSesion } | { cuenta: CuentaGuardada; usuario: Usuario }> {
  const nombre = datos.nombre.trim();
  const correo = normalizarCorreo(datos.correo);
  if (!nombre) return { error: "nombreVacio" };
  if (!correoValido(correo)) return { error: "correoInvalido" };
  if (esCorreoAdmin(correo)) return { error: "correoAdmin" };
  if (cuentas[correo]) return { error: "correoUsado" };
  if (datos.clave.length < CLAVE_MINIMA) return { error: "claveCorta" };
  const { sal, huella } = await huellaClave(datos.clave);
  return {
    cuenta: { nombre, sal, huella, creada: new Date().toISOString() },
    usuario: { correo, nombre, rol: "cliente" },
  };
}

/** Cambia la contraseña: pide la actual y guarda la huella de la nueva (con sal nueva). */
export async function cambiarClave(
  cuenta: CuentaGuardada,
  actual: string,
  nueva: string,
): Promise<{ error: ErrorSesion } | { cuenta: CuentaGuardada }> {
  const { huella } = await huellaClave(actual, cuenta.sal);
  if (huella !== cuenta.huella) return { error: "claveActual" };
  if (nueva.length < CLAVE_MINIMA) return { error: "claveCorta" };
  if (nueva === actual) return { error: "claveIgual" };
  return { cuenta: { ...cuenta, ...(await huellaClave(nueva)) } };
}

export async function comprobarEntrada(
  cuentas: Record<string, CuentaGuardada>,
  correoEscrito: string,
  clave: string,
): Promise<{ error: ErrorSesion } | { usuario: Usuario }> {
  const correo = normalizarCorreo(correoEscrito);
  if (!correoValido(correo)) return { error: "correoInvalido" };
  if (!clave) return { error: "claveVacia" };
  if (esCorreoAdmin(correo)) {
    const { nombre, invitado } = ADMINISTRACION[correo];
    return { usuario: { correo, nombre, rol: "admin", ...(invitado ? { invitado } : {}) } };
  }
  const cuenta = cuentas[correo];
  if (!cuenta) return { error: "credenciales" };
  const { huella } = await huellaClave(clave, cuenta.sal);
  if (huella !== cuenta.huella) return { error: "credenciales" };
  return { usuario: { correo, nombre: cuenta.nombre, rol: "cliente" } };
}
