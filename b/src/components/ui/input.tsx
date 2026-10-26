import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-none border-0 border-b-2 border-ink/40 bg-transparent px-0.5 py-1 font-display text-[1.05rem] font-medium text-ink transition-[color,border-color] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:font-sans placeholder:text-[0.95rem] placeholder:text-muted-ink disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
        "focus-visible:border-b-[3px] focus-visible:border-mandarina-tinta",
        "aria-invalid:border-out",
        className
      )}
      {...props}
    />
  )
}

export { Input }
