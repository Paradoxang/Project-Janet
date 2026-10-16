"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  cambiarClave,
  comprobarEntrada,
  crearCuenta,
  type CuentaGuardada,
  type ErrorSesion,
  type Usuario,
} from "@/lib/sesion";

const SIN_CUENTA = "";
const NINGUNO: string[] = [];

/** Qué correos quiere recibir (en la demo no se envía ninguno: se simulan en su bandeja). */
export interface Avisos {
  pedidos: boolean;
  stock: boolean;
  ofertas: boolean;
}
export const AVISOS_INICIALES: Avisos = { pedidos: true, stock: true, ofertas: false };

/** Sesión de la demo: cuentas, quién entró y sus favoritos. Todo solo en este navegador. */
interface Cuenta {
  usuario: Usuario | null;
  cuentas: Record<string, CuentaGuardada>;
  /** Favoritos por correo; "" son los de quien aún no entró (se le pasan al entrar). */
  deseos: Record<string, string[]>;
  avisos: Record<string, Avisos>;
  registrar: (datos: { nombre: string; correo: string; clave: string }) => Promise<ErrorSesion | null>;
  entrar: (correo: string, clave: string) => Promise<ErrorSesion | null>;
  salir: () => void;
  alternarDeseo: (id: string) => void;
  cambiarNombre: (nombre: string) => ErrorSesion | null;
  cambiarClave: (actual: string, nueva: string) => Promise<ErrorSesion | null>;
  alternarAviso: (clave: keyof Avisos) => void;
}

/** Junta los favoritos de antes de entrar con los de la cuenta. */
function conDeseosDeInvitado(deseos: Record<string, string[]>, correo: string) {
  const invitado = deseos[SIN_CUENTA] ?? [];
  const propios = deseos[correo] ?? [];
  return { ...deseos, [SIN_CUENTA]: [], [correo]: [...invitado.filter((id) => !propios.includes(id)), ...propios] };
}

export const useCuenta = create<Cuenta>()(
  persist(
    (set, get) => ({
      usuario: null,
      cuentas: {},
      deseos: {},
      avisos: {},
      registrar: async (datos) => {
        const r = await crearCuenta(get().cuentas, datos);
        if ("error" in r) return r.error;
        set((s) => ({
          usuario: r.usuario,
          cuentas: { ...s.cuentas, [r.usuario.correo]: r.cuenta },
          deseos: conDeseosDeInvitado(s.deseos, r.usuario.correo),
        }));
        return null;
      },
      entrar: async (correo, clave) => {
        const r = await comprobarEntrada(get().cuentas, correo, clave);
        if ("error" in r) return r.error;
        set((s) => ({ usuario: r.usuario, deseos: conDeseosDeInvitado(s.deseos, r.usuario.correo) }));
        return null;
      },
      salir: () => set({ usuario: null }),
      alternarDeseo: (id) =>
        set((s) => {
          const clave = s.usuario?.correo ?? SIN_CUENTA;
          const lista = s.deseos[clave] ?? [];
          return { deseos: { ...s.deseos, [clave]: lista.includes(id) ? lista.filter((d) => d !== id) : [id, ...lista] } };
        }),
      cambiarNombre: (nombre) => {
        const limpio = nombre.trim();
        const { usuario, cuentas } = get();
        if (!usuario || usuario.rol !== "cliente" || !cuentas[usuario.correo]) return null;
        if (!limpio) return "nombreVacio";
        set({
          usuario: { ...usuario, nombre: limpio },
          cuentas: { ...cuentas, [usuario.correo]: { ...cuentas[usuario.correo], nombre: limpio } },
        });
        return null;
      },
      cambiarClave: async (actual, nueva) => {
        const { usuario, cuentas } = get();
        const cuenta = usuario ? cuentas[usuario.correo] : undefined;
        if (!usuario || !cuenta) return "credenciales";
        const r = await cambiarClave(cuenta, actual, nueva);
        if ("error" in r) return r.error;
        set((s) => ({ cuentas: { ...s.cuentas, [usuario.correo]: r.cuenta } }));
        return null;
      },
      alternarAviso: (clave) =>
        set((s) => {
          if (!s.usuario) return {};
          const actuales = s.avisos[s.usuario.correo] ?? AVISOS_INICIALES;
          return { avisos: { ...s.avisos, [s.usuario.correo]: { ...actuales, [clave]: !actuales[clave] } } };
        }),
    }),
    {
      name: "cuenta",
      version: 1,
      partialize: ({ usuario, cuentas, deseos, avisos }) => ({ usuario, cuentas, deseos, avisos }),
      // v0 (hasta el 16-10): { nombre, deseos: string[] }, sin contraseñas. Se conservan los favoritos.
      migrate: (viejo, version) => {
        if (version === 0) {
          const v0 = viejo as { deseos?: string[] };
          return { usuario: null, cuentas: {}, deseos: { [SIN_CUENTA]: v0.deseos ?? [] }, avisos: {} };
        }
        return viejo as Cuenta;
      },
    },
  ),
);

/** Favoritos de quien está ahora (o de quien aún no entró). */
export const useDeseos = () => useCuenta((s) => s.deseos[s.usuario?.correo ?? SIN_CUENTA] ?? NINGUNO);

/** Qué avisos por correo quiere quien está ahora. */
export const useAvisos = () => useCuenta((s) => (s.usuario ? s.avisos[s.usuario.correo] : undefined) ?? AVISOS_INICIALES);
