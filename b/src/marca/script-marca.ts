// Se ejecuta en <head> antes de pintar: elige la marca (neutra o Brinco) sin parpadeo.
// Prioridad: ?marca=… en la URL (y se recuerda) → lo guardado → la marca inicial del build.
export const MARCAS = ["neutra", "brinco"] as const;
export type MarcaId = (typeof MARCAS)[number];

export const MARCA_INICIAL: MarcaId =
  process.env.NEXT_PUBLIC_MARCA_INICIAL === "brinco" ? "brinco" : "neutra";

export const ICONOS: Record<MarcaId, string> = {
  neutra: "/icono-neutro.svg",
  brinco: "/icono-brinco.svg",
};

export function scriptMarca(): string {
  return `(function(){try{var d=document.documentElement;var q=new URLSearchParams(location.search).get('marca');var ok=function(m){return m==='neutra'||m==='brinco'};if(ok(q)){localStorage.setItem('marca',q)}var m=ok(q)?q:localStorage.getItem('marca');if(!ok(m)){m='${MARCA_INICIAL}'}d.setAttribute('data-marca',m);var i=document.querySelector('link[rel="icon"]');var iconos=${JSON.stringify(ICONOS)};if(i){i.setAttribute('href',iconos[m])}}catch(e){}})();`;
}
