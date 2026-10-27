import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-btn font-grabado text-[0.78rem] font-semibold whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-calendula disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Rediseño del 26-10: todo botón sale de una pieza del canon. Por defecto, la placa azul noche.
        default:
          "bg-noche tracking-[0.1em] text-crema uppercase shadow-[inset_0_0_0_1.5px_var(--m-hilo-oro)] hover:-translate-y-0.5 hover:bg-[#23265a] motion-reduce:hover:translate-y-0",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        // El botón de texto del canon: transparente, con el filete del color de la letra.
        outline: "bg-transparent tracking-[0.1em] uppercase shadow-[inset_0_0_0_1px_currentColor] hover:bg-ink/5",
        // La píldora del canon.
        secondary: "rounded-full bg-crema text-[0.9rem] text-ink hover:bg-aqua hover:text-noche",
        ghost: "text-[0.9rem] hover:bg-ink/5",
        link: "text-[0.95rem] text-link underline-offset-4 hover:underline",
        // Marca: «Add to cart» y «Buy now» (los colores salen de la marca activa).
        // Rediseño del 26-10: placas del canon, cuadradas (5 px) y con el filete de oro grabado. Suben un poco al pasar.
        cta: "bg-cta font-grabado font-bold tracking-[0.1em] text-cta-ink uppercase shadow-[inset_0_0_0_1.5px_var(--m-hilo-oro),0_8px_20px_rgb(255_106_43/0.28)] hover:-translate-y-0.5 hover:bg-cta-hover active:translate-y-0 disabled:shadow-none motion-reduce:hover:translate-y-0",
        buy: "bg-buy font-grabado font-bold tracking-[0.1em] text-buy-ink uppercase shadow-[inset_0_0_0_1.5px_var(--m-hilo-oro),0_8px_20px_rgb(22_24_58/0.2)] hover:-translate-y-0.5 hover:bg-[#23265a] active:translate-y-0 motion-reduce:hover:translate-y-0",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-btn px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-btn px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-btn px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-btn px-6 text-base has-[>svg]:px-5",
        icon: "size-9",
        "icon-xs": "size-6 rounded-btn [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
