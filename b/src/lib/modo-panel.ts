// Panel de administración a pantalla completa (decisión del 16-10): con alguien de administración
// dentro del panel, la cabecera de la tienda se recoge. Lo marca <html data-panel> y el CSS hace el resto.
import { routing } from "@/i18n/routing";
import { GUARDADO_SESION } from "./sesion";

/** ¿Es una página del panel? Recibe la ruta sin el idioma (/panel, /panel/catalogo/…). */
export const esRutaPanel = (ruta: string) => /^\/panel(\/|$)/.test(ruta);

/**
 * Se ejecuta en <head> antes de pintar: si la sesión guardada es de administración y la página es del panel,
 * pone <html data-panel> para que la cabecera de la tienda no se vea ni un instante. Al navegar, lo mantiene ModoPanel.
 */
export function scriptModoPanel(): string {
  const ruta = `^/(${routing.locales.join("|")})/panel(/|$)`;
  return `(function(){try{if(!new RegExp(${JSON.stringify(ruta)}).test(location.pathname))return;var s=JSON.parse(localStorage.getItem(${JSON.stringify(GUARDADO_SESION)})||'null');var u=s&&s.state&&s.state.usuario;if(u&&u.rol==='admin'){document.documentElement.setAttribute('data-panel','')}}catch(e){}})();`;
}
