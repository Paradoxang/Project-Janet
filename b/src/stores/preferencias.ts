"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** ZIP de la demo: una mamá en Seattle. */
export const ZIP_INICIAL = "98101";

interface Preferencias {
  zip: string;
  setZip: (zip: string) => void;
}

export const usePreferencias = create<Preferencias>()(
  persist(
    (set) => ({
      zip: ZIP_INICIAL,
      setZip: (zip) => set({ zip }),
    }),
    { name: "preferencias" },
  ),
);
