/** Subrayado hecho a mano (un trazo SVG que se dibuja al cargar). No es una fuente: es un dibujo. */
export function Garabato({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 20"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.22em] left-[-2%] h-[0.42em] w-[104%] overflow-visible text-trazo"
      >
        <path
          d="M3 13 C 40 4, 92 3, 132 8 S 186 15, 197 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          pathLength={1}
          className="trazar"
        />
      </svg>
    </span>
  );
}
