"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { zipValido } from "@/lib/zip";
import { usePreferencias } from "@/stores/preferencias";

/**
 * El ZIP en el campo del boletín del canon: se escribe, se guarda y lleva al mapa de tiendas, que ya sale con esa zona.
 * `papel`: sobre fondo claro (tinta); si no, sobre azul noche (crema).
 */
export function BuscarTiendaZip({
  papel = false,
  id = "zip-panel",
}: {
  papel?: boolean;
  id?: string;
}) {
  const t = useTranslations("donde");
  const router = useRouter();
  const setZip = usePreferencias((s) => s.setZip);
  const [zip, setValor] = useState("");
  const [error, setError] = useState(false);
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!zipValido(zip)) {
          setError(true);
          return;
        }
        setZip(zip);
        router.push("/where-to-buy");
      }}
    >
      <label htmlFor={id} className={cn("cejilla", papel ? "text-ink/80" : "text-crema/80")}>
        {t("zip")}
      </label>
      <div className="flex flex-wrap items-end gap-3">
        <input
          id={id}
          inputMode="numeric"
          maxLength={5}
          autoComplete="postal-code"
          placeholder={t("zipPista")}
          value={zip}
          onChange={(e) => {
            setValor(e.target.value.replace(/\D/g, ""));
            setError(false);
          }}
          aria-invalid={error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn("campo-boletin min-w-0 flex-1 basis-48", papel && "campo-boletin-papel")}
        />
        <button type="submit" className={cn("placa", papel && "placa-noche")}>
          {t("buscar")} <span aria-hidden="true">→</span>
        </button>
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className={cn("text-[14px] font-semibold", papel ? "text-out" : "text-calendula")}
        >
          {t("zipInvalido")}
        </p>
      ) : null}
    </form>
  );
}
