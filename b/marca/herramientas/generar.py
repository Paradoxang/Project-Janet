"""Genera los SVG de la marca Brinco (logo, símbolo, ícono y mascota).

Uso:
  pip install fonttools brotli
  npm pack @fontsource-variable/fredoka   # y descomprimir
  python3 generar.py <ruta a fredoka-latin-wght-normal.woff2>

Todos los colores salen de PALETA: una versión alternativa de la marca es cambiar la paleta y volver a generar.
"""
import json, math, os, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.dirname(AQUI)

PALETA = {
    "pelo": "#F2753A",        # Naranja Brinco
    "pelo_sombra": "#DD6128",
    "crema": "#FFEBDA",
    "bolsa": "#FFD7BA",
    "bolsa_borde": "#EFA77E",
    "oreja": "#FFB9A0",
    "tinta": "#1F2A44",       # Azul Noche
    "rubor": "#FF8A9B",
    "cria": "#F89A63",
    "blanco": "#FFFFFF",
}


OREJA = "M0 -42 C14 -27 18 2 9 30 L-9 30 C-18 2 -14 -27 0 -42Z"


def cabeza(p, tono_cara=None):
    """Cabeza de Brinco en el sistema de la mascota (centro 120,92)."""
    cara = tono_cara or p["pelo"]
    return f"""
  <g>
    <path d="{OREJA}" transform="translate(92 46) rotate(-18)" fill="{cara}"/>
    <path d="{OREJA}" transform="translate(148 46) rotate(18)" fill="{cara}"/>
    <path d="{OREJA}" transform="translate(92 50) rotate(-18) scale(.5 .68)" fill="{p['oreja']}"/>
    <path d="{OREJA}" transform="translate(148 50) rotate(18) scale(.5 .68)" fill="{p['oreja']}"/>
    <ellipse cx="120" cy="92" rx="46" ry="42" fill="{cara}"/>
    <ellipse cx="120" cy="110" rx="25" ry="21" fill="{p['crema']}"/>
    <ellipse cx="88" cy="104" rx="8" ry="5" fill="{p['rubor']}" opacity=".55"/>
    <ellipse cx="152" cy="104" rx="8" ry="5" fill="{p['rubor']}" opacity=".55"/>
    <ellipse cx="101" cy="86" rx="6" ry="7.5" fill="{p['tinta']}"/>
    <ellipse cx="139" cy="86" rx="6" ry="7.5" fill="{p['tinta']}"/>
    <circle cx="103" cy="83" r="2.1" fill="{p['blanco']}"/>
    <circle cx="141" cy="83" r="2.1" fill="{p['blanco']}"/>
    <path d="M113 98.5 Q120 94 127 98.5 Q127 104 120 105 Q113 104 113 98.5Z" fill="{p['tinta']}"/>
    <path d="M112 110 Q116 115 120 110 Q124 115 128 110" fill="none" stroke="{p['tinta']}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>"""


def mascota(p):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 0 220 262" role="img" aria-label="Brinco, mamá canguro">
  <path d="M146 204 C178 208 204 224 228 236 C240 242 238 252 226 252 C196 252 168 248 146 242Z" fill="{p['pelo_sombra']}"/>
  <ellipse cx="92" cy="246" rx="31" ry="11" fill="{p['pelo_sombra']}"/>
  <ellipse cx="148" cy="246" rx="31" ry="11" fill="{p['pelo_sombra']}"/>
  <ellipse cx="91" cy="212" rx="27" ry="31" fill="{p['pelo']}"/>
  <ellipse cx="149" cy="212" rx="27" ry="31" fill="{p['pelo']}"/>
  <ellipse cx="120" cy="182" rx="50" ry="58" fill="{p['pelo']}"/>
  <ellipse cx="120" cy="190" rx="34" ry="44" fill="{p['crema']}"/>
  <g>
    <path d="{OREJA}" transform="translate(112 170) rotate(-20) scale(.34)" fill="{p['cria']}"/>
    <path d="{OREJA}" transform="translate(128 170) rotate(20) scale(.34)" fill="{p['cria']}"/>
    <circle cx="120" cy="186" r="15" fill="{p['cria']}"/>
    <ellipse cx="120" cy="192" rx="8" ry="6" fill="{p['crema']}"/>
    <circle cx="114.5" cy="184" r="2.4" fill="{p['tinta']}"/>
    <circle cx="125.5" cy="184" r="2.4" fill="{p['tinta']}"/>
    <ellipse cx="120" cy="189.5" rx="2.6" ry="1.9" fill="{p['tinta']}"/>
  </g>
  <path d="M90 194 Q120 204 150 194 Q150 230 120 232 Q90 230 90 194Z" fill="{p['bolsa']}"/>
  <path d="M90 194 Q120 204 150 194" fill="none" stroke="{p['bolsa_borde']}" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="93" cy="176" rx="9" ry="19" transform="rotate(-28 93 176)" fill="{p['pelo']}"/>
  <ellipse cx="147" cy="176" rx="9" ry="19" transform="rotate(28 147 176)" fill="{p['pelo']}"/>
  <ellipse cx="100" cy="192" rx="7.5" ry="6" fill="{p['pelo_sombra']}"/>
  <ellipse cx="140" cy="192" rx="7.5" ry="6" fill="{p['pelo_sombra']}"/>
  {cabeza(p)}
</svg>
"""


def simbolo(p):
    """Solo la cabeza, recortada (para el logo)."""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="62 0 116 136" role="img" aria-label="Brinco">{cabeza(p)}
</svg>
"""


def icono(p, fondo):
    """Ícono de app / favicon: cuadrado redondeado con la cabeza de Brinco."""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="Brinco">
  <rect width="160" height="160" rx="36" fill="{fondo}"/>
  <g transform="translate(-40 12)">{cabeza(p)}</g>
</svg>
"""


TRACKING = -15  # unidades de fuente entre letras


def letras(fuente, texto, wght):
    f = TTFont(fuente)
    if "fvar" in f:
        f = instancer.instantiateVariableFont(f, {"wght": wght})
    gs, cmap, hmtx = f.getGlyphSet(), f.getBestCmap(), f["hmtx"]
    x, trazos, cajas = 0, [], []
    for ch in texto:
        nombre = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[nombre].draw(TransformPen(pen, (1, 0, 0, -1, x, 0)))
        trazos.append(pen.getCommands())
        cajas.append((ch, x, hmtx[nombre][0]))
        x += hmtx[nombre][0] + TRACKING
    return " ".join(trazos), x - TRACKING, cajas


def logotipo(d, ancho, cajas, color_letras, color_bola):
    # La «i» sin punto lleva una pelota naranja: el brinco.
    _, xi, adv = [c for c in cajas if c[0] == "ı"][0]
    bx, by, r = xi + adv / 2, -640, 92
    return f"""<path d="{d}" fill="{color_letras}"/>
    <circle cx="{bx:.1f}" cy="{by}" r="{r}" fill="{color_bola}"/>"""


def logo(p, d, ancho, cajas, fondo_oscuro=False):
    letras_color = p["blanco"] if fondo_oscuro else p["tinta"]
    # palabra: unidades de fuente (alto ~ 740) escaladas a 0.1 => ~74 px; símbolo a 96 px de alto
    s = 0.1
    alto_simbolo = 98
    esc_simbolo = alto_simbolo / 136
    ancho_simbolo = 116 * esc_simbolo
    gap = 16
    total_w = ancho_simbolo + gap + ancho * s + 4
    base = 92  # línea base de la palabra en px
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w:.0f} 100" role="img" aria-label="Brinco">
  <g transform="translate(0 1) scale({esc_simbolo:.4f}) translate(-62 0)">{cabeza(p)}</g>
  <g transform="translate({ancho_simbolo + gap:.1f} {base}) scale({s})">
    {logotipo(d, ancho, cajas, letras_color, p['pelo'])}
  </g>
</svg>
"""


def solo_palabra(p, d, ancho, cajas):
    s = 0.1
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho * s + 4:.0f} 78" role="img" aria-label="Brinco">
  <g transform="translate(0 74) scale({s})">
    {logotipo(d, ancho, cajas, p['tinta'], p['pelo'])}
  </g>
</svg>
"""


if __name__ == "__main__":
    fuente = sys.argv[1]
    d, ancho, cajas = letras(fuente, "brınco", 600)
    archivos = {
        "mascota.svg": mascota(PALETA),
        "simbolo.svg": simbolo(PALETA),
        "icono.svg": icono(PALETA, PALETA["tinta"]),
        "logo.svg": logo(PALETA, d, ancho, cajas),
        "logo-negativo.svg": logo(PALETA, d, ancho, cajas, fondo_oscuro=True),
        "palabra.svg": solo_palabra(PALETA, d, ancho, cajas),
    }
    for nombre, svg in archivos.items():
        with open(os.path.join(SALIDA, nombre), "w") as fh:
            fh.write(svg)
        print("escrito", nombre)
