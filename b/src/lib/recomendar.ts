// «Te puede gustar» de la cuenta: juguetes parecidos a lo que la persona guardó o compró.
import type { ProductoLigero } from "./tipos";

/**
 * Puntúa cada juguete por parecido (misma categoría: 2 puntos; misma edad: 1) con lo que le gustó.
 * No repite lo que ya guardó o compró. Si no hay pistas, recomienda los más vendidos.
 */
export function recomendar(catalogo: ProductoLigero[], gustos: string[], limite = 8): ProductoLigero[] {
  const porId = new Map(catalogo.map((p) => [p.id, p]));
  const pistas = gustos.map((id) => porId.get(id)).filter((p): p is ProductoLigero => !!p);
  const yaTiene = new Set(gustos);
  const candidatos = catalogo.filter((p) => !yaTiene.has(p.id) && p.stockOnline > 0);
  const puntos = (p: ProductoLigero) =>
    pistas.reduce((s, g) => s + (g.category === p.category ? 2 : 0) + (g.ageGroup === p.ageGroup ? 1 : 0), 0);
  return candidatos
    .map((p) => ({ p, puntos: puntos(p) }))
    .sort(
      (a, b) =>
        b.puntos - a.puntos ||
        Number(b.p.bestSeller) - Number(a.p.bestSeller) ||
        b.p.reviewCount - a.p.reviewCount,
    )
    .slice(0, limite)
    .map((x) => x.p);
}
