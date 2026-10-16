// Dinero y fechas. El dinero se suma en centavos enteros para no arrastrar errores de coma flotante.

export const aCentavos = (usd: number) => Math.round(usd * 100);
export const aDolares = (centavos: number) => centavos / 100;

const formatos = new Map<string, Intl.NumberFormat>();

export function precio(usd: number, locale: string): string {
  const clave = locale;
  let f = formatos.get(clave);
  if (!f) {
    f = new Intl.NumberFormat(locale === "es" ? "es-US" : "en-US", { style: "currency", currency: "USD" });
    formatos.set(clave, f);
  }
  return f.format(usd);
}

/** Separa un precio para pintarlo al estilo Amazon: $24<sup>99</sup>. */
export function partesPrecio(usd: number): { enteros: string; centavos: string } {
  const c = aCentavos(usd);
  return {
    enteros: Math.floor(c / 100).toLocaleString("en-US"),
    centavos: String(c % 100).padStart(2, "0"),
  };
}

/** Suma días hábiles (lunes a viernes) a una fecha. */
export function sumarDiasHabiles(desde: Date, dias: number): Date {
  const d = new Date(desde);
  let quedan = dias;
  while (quedan > 0) {
    d.setDate(d.getDate() + 1);
    const dia = d.getDay();
    if (dia !== 0 && dia !== 6) quedan--;
  }
  return d;
}

export function fechaCorta(fecha: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(fecha);
}

export function fechaLarga(fecha: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(fecha);
}

export function fechaResena(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
