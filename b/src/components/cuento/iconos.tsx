import { cn } from "@/lib/utils";

/*
  Iconos del canon: SVG en línea, rellenos y sin trazo (DESIGN.md, «Iconography»), en el color del texto. Las flechas y
  las marcas siguen siendo glifos Unicode (→ ↓ ✓ ★ ✦), como en el canon. Todos van con aria-hidden: el nombre lo pone
  el botón o el enlace que los lleva.
*/

type Props = { className?: string };

function Svg({ className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={cn("size-5 shrink-0", className)}
    >
      {children}
    </svg>
  );
}

export const IconoMenu = (p: Props) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="2.6" rx="1.3" />
    <rect x="3" y="10.7" width="18" height="2.6" rx="1.3" />
    <rect x="3" y="16.4" width="12" height="2.6" rx="1.3" />
  </Svg>
);

export const IconoLupa = (p: Props) => (
  <Svg {...p}>
    <path
      fillRule="evenodd"
      d="M10.5 3.5a7 7 0 0 1 5.6 11.2l4.5 4.5a1.6 1.6 0 1 1-2.3 2.3l-4.5-4.5A7 7 0 1 1 10.5 3.5Zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
    />
  </Svg>
);

export const IconoPersona = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="7.8" r="4.3" />
    <path d="M3.8 20.4c0-4.1 3.7-6.9 8.2-6.9s8.2 2.8 8.2 6.9c0 .6-.5 1.1-1.1 1.1H4.9c-.6 0-1.1-.5-1.1-1.1Z" />
  </Svg>
);

export const IconoCorazon = (p: Props) => (
  <Svg {...p}>
    <path d="m12 21.2-1.4-1.2C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.6 11.5L12 21.2Z" />
  </Svg>
);

export const IconoBolsa = (p: Props) => (
  <Svg {...p}>
    <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5V8h2V6.5a2.5 2.5 0 0 1 5 0V8h2V6.5A4.5 4.5 0 0 0 12 2Z" />
    <path d="M5.4 9h13.2l1 11.1A1.7 1.7 0 0 1 17.9 22H6.1a1.7 1.7 0 0 1-1.7-1.9L5.4 9Z" />
  </Svg>
);

export const IconoPin = (p: Props) => (
  <Svg {...p}>
    <path
      fillRule="evenodd"
      d="M12 2a7.3 7.3 0 0 0-7.3 7.3C4.7 14.7 12 22.6 12 22.6s7.3-7.9 7.3-13.3A7.3 7.3 0 0 0 12 2Zm0 4.4a2.9 2.9 0 1 1 0 5.8 2.9 2.9 0 0 1 0-5.8Z"
    />
  </Svg>
);

export const IconoCerrar = (p: Props) => (
  <Svg {...p}>
    <path d="m5.6 4.2 6.4 6.4 6.4-6.4 1.4 1.4-6.4 6.4 6.4 6.4-1.4 1.4-6.4-6.4-6.4 6.4-1.4-1.4 6.4-6.4-6.4-6.4 1.4-1.4Z" />
  </Svg>
);

export const IconoHoja = (p: Props) => (
  <Svg {...p}>
    <path d="M20.5 3.5C11.3 3.5 5 8.1 5 15.2c0 1.4.3 2.6.8 3.6l-2.3 2.3 1.4 1.4 2.3-2.3c1 .5 2.3.8 3.6.8 7.1 0 9.7-7.6 9.7-17.5Z" />
  </Svg>
);

export const IconoCandado = (p: Props) => (
  <Svg {...p}>
    <path d="M12 2.5A4.5 4.5 0 0 0 7.5 7v3h2V7a2.5 2.5 0 0 1 5 0v3h2V7A4.5 4.5 0 0 0 12 2.5Z" />
    <rect x="4.5" y="10" width="15" height="11.5" rx="1.8" />
  </Svg>
);

export const IconoPausa = (p: Props) => (
  <Svg {...p}>
    <rect x="6" y="4.5" width="4" height="15" rx="1.2" />
    <rect x="14" y="4.5" width="4" height="15" rx="1.2" />
  </Svg>
);

export const IconoSeguir = (p: Props) => (
  <Svg {...p}>
    <path d="M7 4.6v14.8c0 .9 1 1.4 1.7.9l11-7.4c.6-.4.6-1.4 0-1.8l-11-7.4C8 3.2 7 3.7 7 4.6Z" />
  </Svg>
);

export const IconoDiana = (p: Props) => (
  <Svg {...p}>
    <path
      fillRule="evenodd"
      d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm0 3.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z"
    />
  </Svg>
);

export const IconoReloj = (p: Props) => (
  <Svg {...p}>
    <path
      fillRule="evenodd"
      d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm-1.1 4.5v6.2l4.6 2.7 1.1-1.9-3.5-2V6.5h-2.2Z"
    />
  </Svg>
);

export const IconoTelefono = (p: Props) => (
  <Svg {...p}>
    <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z" />
  </Svg>
);

export const IconoRumbo = (p: Props) => (
  <Svg {...p}>
    <path d="M21 3 3 10.5l7.6 2.9L13.5 21 21 3Z" />
  </Svg>
);

export const IconoRegalo = (p: Props) => (
  <Svg {...p}>
    <path d="M12 7.2c-.9-2.9-4.9-4.2-5.2-1.6C6.6 7.4 9.6 7.4 12 7.2Zm0 0c.9-2.9 4.9-4.2 5.2-1.6.2 1.8-2.8 1.8-5.2 1.6Z" />
    <rect x="3" y="7.5" width="8" height="3.5" rx="0.8" />
    <rect x="13" y="7.5" width="8" height="3.5" rx="0.8" />
    <path d="M4.3 12.2H11V22H5.8a1.5 1.5 0 0 1-1.5-1.5v-8.3Zm8.7 0h6.7v8.3a1.5 1.5 0 0 1-1.5 1.5H13v-9.8Z" />
  </Svg>
);

export const IconoBloques = (p: Props) => (
  <Svg {...p}>
    <rect x="3" y="12.5" width="8.5" height="8.5" rx="1.6" />
    <rect x="12.5" y="12.5" width="8.5" height="8.5" rx="1.6" />
    <rect x="7.8" y="3" width="8.5" height="8.5" rx="1.6" />
  </Svg>
);

export const IconoTarjeta = (p: Props) => (
  <Svg {...p}>
    <path
      fillRule="evenodd"
      d="M4.5 4.5h15A2.5 2.5 0 0 1 22 7v10a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17V7a2.5 2.5 0 0 1 2.5-2.5ZM2 8.5v2.5h20V8.5H2Zm3 6.5v1.6h5V15H5Z"
    />
  </Svg>
);

export const IconoAviso = (p: Props) => (
  <Svg {...p}>
    <path
      fillRule="evenodd"
      d="M10.3 3.3a2 2 0 0 1 3.4 0l8.4 14.5a2 2 0 0 1-1.7 3H3.6a2 2 0 0 1-1.7-3l8.4-14.5ZM11 9v5h2V9h-2Zm0 6.5v2h2v-2h-2Z"
    />
  </Svg>
);

export const IconoRegla = (p: Props) => (
  <Svg {...p}>
    <path
      fillRule="evenodd"
      d="M2.6 16.2 16.2 2.6a1.4 1.4 0 0 1 2 0l3.2 3.2a1.4 1.4 0 0 1 0 2L7.8 21.4a1.4 1.4 0 0 1-2 0l-3.2-3.2a1.4 1.4 0 0 1 0-2Zm6.6-5 1.8 1.8 1.1-1.1-1.8-1.8-1.1 1.1Zm3.1-3.1 1.8 1.8 1.1-1.1-1.8-1.8-1.1 1.1Zm-6.2 6.2 1.8 1.8 1.1-1.1-1.8-1.8-1.1 1.1Z"
    />
  </Svg>
);

/**
 * El punto del logo del canon: un círculo azul noche con tres puntitos desplazados (caléndula, crema y mandarina).
 * Hace de marca provisional junto al marcador «Tu logo» hasta que la clienta tenga el suyo. `claro`: con aro crema,
 * para que se vea sobre el azul noche.
 */
export function PuntoLogo({ className, claro = false }: Props & { claro?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-noche relative inline-block size-[38px] shrink-0 rounded-full",
        claro && "ring-crema/70 ring-2",
        className,
      )}
    >
      <span className="bg-calendula absolute top-[9px] left-[10px] size-[9px] rounded-full" />
      <span className="bg-crema absolute top-[16px] right-[8px] size-[6px] rounded-full" />
      <span className="bg-mandarina absolute bottom-[8px] left-[15px] size-[7px] rounded-full" />
    </span>
  );
}
