// Variante de la maqueta (propuesta P3 de la review de usuario del 16-10; Santiago: «dejalo como para montar una
// variante de la maqueta y las imágenes serían con IA»). «base» es la tienda blanca de siempre; «color» le sube el
// color y pone fotos de niños jugando, hechas con IA y marcadas como tales.
// Se ejecuta en <head> antes de pintar, como la marca: ?variante=… (y se recuerda) → lo guardado → «base».
export const VARIANTES = ["base", "color"] as const;
export type VarianteId = (typeof VARIANTES)[number];

export function scriptVariante(): string {
  return `(function(){try{var d=document.documentElement;var q=new URLSearchParams(location.search).get('variante');var ok=function(v){return v==='base'||v==='color'};if(ok(q)){localStorage.setItem('variante',q)}var v=ok(q)?q:localStorage.getItem('variante');if(!ok(v)){v='base'}d.setAttribute('data-variante',v)}catch(e){}})();`;
}
