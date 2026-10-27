"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      // Rediseño del 26-10: los avisos son tarjetas azul noche del canon, con glifos en vez de iconos de trazo.
      icons={{
        success: <span className="text-calendula">✓</span>,
        info: <span className="text-aqua">i</span>,
        warning: <span className="text-calendula">!</span>,
        error: <span className="text-calendula">✕</span>,
        loading: <span className="text-calendula">…</span>,
      }}
      toastOptions={{ classNames: { toast: "font-display", description: "font-sans" } }}
      style={
        {
          "--normal-bg": "var(--m-noche)",
          "--normal-text": "var(--m-crema)",
          "--normal-border": "rgb(246 239 224 / 0.18)",
          "--border-radius": "18px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
