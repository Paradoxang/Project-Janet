import type { ProductoLigero } from "@/lib/tipos";
import { TarjetaProducto } from "./tarjeta-producto";

/** Fila horizontal deslizable de productos (en móvil se desliza con el dedo, como en Amazon). */
export function FilaProductos({ productos }: { productos: ProductoLigero[] }) {
  return (
    <div className="relative -mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
      <ul className="flex snap-x snap-mandatory gap-3 md:grid md:grid-cols-4 md:gap-4 lg:grid-cols-5">
        {productos.map((p) => (
          <li key={p.id} className="w-[44vw] max-w-[220px] shrink-0 snap-start md:w-auto md:max-w-none">
            <TarjetaProducto p={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
