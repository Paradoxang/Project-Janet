"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  comprobarEntrada,
  crearCuenta,
  type CuentaGuardada,
  type ErrorSesion,
  type Usuario,
} from "@/lib/sesion";

const SIN_CUENTA = "";
const NINGUNO: string[] = [];

/** Sesión de la demo: cuentas, quién entró y sus favoritos. Todo solo en este navegador. */
interface Cuenta {
  usuario: Usuario | null;
  cuentas: Record<string, CuentaGuardada>;
  /** Favoritos por correo; "" son los de quien aún no entró (se le pasan al entrar). */
  deseos: Record<string, string[]>;
  registrar: (datos: { nombre: string; correo: string; clave: string }) => Promise<ErrorSesion | null>;
  entrar: (correo: string, clave: string) => Promise<ErrorSesion | null>;
  salir: () => void;
  alternarDeseo: (id: string) => void;
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
    }),
    {
      name: "cuenta",
      version: 1,
      partialize: ({ usuario, cuentas, deseos }) => ({ usuario, cuentas, deseos }),
      // v0 (hasta el 16-10): { nombre, deseos: string[] }, sin contraseñas. Se conservan los favoritos.
      migrate: (viejo, version) => {
        if (version === 0) {
          const v0 = viejo as { deseos?: string[] };
          return { usuario: null, cuentas: {}, deseos: { [SIN_CUENTA]: v0.deseos ?? [] } };
        }
        return viejo as Cuenta;
      },
    },
  ),
);

/** Favoritos de quien está ahora (o de quien aún no entró). */
export const useDeseos = () => useCuenta((s) => s.deseos[s.usuario?.correo ?? SIN_CUENTA] ?? NINGUNO);
