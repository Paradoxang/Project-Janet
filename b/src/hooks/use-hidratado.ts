"use client";

import { useSyncExternalStore } from "react";

const sinSuscripcion = () => () => {};

/** true solo en el navegador ya hidratado: para lo que depende de localStorage o de la fecha de hoy. */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );
}
