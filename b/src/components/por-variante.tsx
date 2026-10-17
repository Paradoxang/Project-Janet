/**
 * Un texto que cambia con la variante de la maqueta, elegido por el CSS (.solo-variante-*): sirve en lo que se pinta en
 * el servidor, sin esperar a React ni parpadear. Si los dos textos son iguales, va uno solo.
 */
export function PorVariante({ blanca, color }: { blanca: string; color: string }) {
  if (blanca === color) return <>{blanca}</>;
  return (
    <>
      <span className="solo-variante-base">{blanca}</span>
      <span className="solo-variante-color">{color}</span>
    </>
  );
}
