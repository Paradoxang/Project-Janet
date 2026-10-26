"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconoPin } from "@/components/cuento/iconos";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHidratado } from "@/hooks/use-hidratado";
import { lugarDeZip, zipValido } from "@/lib/zip";
import { cn } from "@/lib/utils";
import { usePreferencias, ZIP_INICIAL } from "@/stores/preferencias";

export function SelectorZip({ className }: { className?: string }) {
  const t = useTranslations("cabecera");
  const hidratado = useHidratado();
  const zipGuardado = usePreferencias((s) => s.zip);
  const setZip = usePreferencias((s) => s.setZip);
  const zip = hidratado ? zipGuardado : ZIP_INICIAL;
  const [abierto, setAbierto] = useState(false);
  const [borrador, setBorrador] = useState(zip);
  const [error, setError] = useState(false);

  return (
    <Dialog
      open={abierto}
      onOpenChange={(v) => {
        setAbierto(v);
        if (v) {
          setBorrador(zip);
          setError(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          data-testid="selector-zip"
          className={cn(
            "text-muted-ink hover:text-ink flex items-center gap-1.5 rounded-md text-left text-[13px] leading-tight",
            className,
          )}
        >
          <IconoPin className="size-4 shrink-0" />
          <span>
            {t("entregarA")}{" "}
            <b className="text-ink font-bold">
              {lugarDeZip(zip)} {zip}
            </b>
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("zipTitulo")}</DialogTitle>
          <DialogDescription>{t("zipTexto")}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!zipValido(borrador)) {
              setError(true);
              return;
            }
            setZip(borrador.trim());
            setAbierto(false);
          }}
        >
          <Label htmlFor="zip">{t("zipEtiqueta")}</Label>
          <Input
            id="zip"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            value={borrador}
            aria-invalid={error}
            aria-describedby={error ? "zip-error" : undefined}
            onChange={(e) => {
              setBorrador(e.target.value.replace(/\D/g, ""));
              setError(false);
            }}
          />
          {error ? (
            <p id="zip-error" className="text-out text-sm">
              {t("zipInvalido")}
            </p>
          ) : null}
          <Button type="submit" variant="cta" size="lg">
            {t("zipGuardar")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
