"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { Coordenadas } from "@/lib/zip";

export interface PuntoMapa {
  id: string;
  ciudad: string;
  lat: number;
  lng: number;
  /** null = sin filtro de producto */
  unidades: number | null;
  detalle: string;
}

/** «cerca»: el ZIP y sus tiendas más cercanas; «todas»: todo EE. UU. con todas las tiendas. */
export type VistaMapa = "cerca" | "todas";

function icono(p: PuntoMapa, activo: boolean) {
  const estado = p.unidades === null ? "neutro" : p.unidades > 0 ? "si" : "no";
  return L.divIcon({
    className: "",
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36],
    html: `<span class="pin-tienda pin-${estado}${activo ? " pin-activo" : ""}"><span>${p.unidades === null ? "" : p.unidades}</span></span>`,
  });
}

const ICONO_ORIGEN = L.divIcon({
  className: "",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  html: '<span class="pin-yo"></span>',
});

/** Cuántas tiendas cercanas entran en el encuadre «cerca» además del ZIP. */
const CERCANAS = 2;

function Encuadre({
  puntos,
  foco,
  origen,
  vista,
}: {
  puntos: PuntoMapa[];
  foco: string | null;
  origen: Coordenadas | null;
  vista: VistaMapa;
}) {
  const mapa = useMap();
  useEffect(() => {
    const elegido = puntos.find((p) => p.id === foco);
    const moverse = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (elegido) {
      if (moverse) mapa.flyTo([elegido.lat, elegido.lng], 10, { duration: 0.8 });
      else mapa.setView([elegido.lat, elegido.lng], 10);
      return;
    }
    // Los puntos llegan ordenados por distancia: los primeros son los más cercanos al ZIP.
    const dentro = vista === "cerca" && origen ? [origen, ...puntos.slice(0, CERCANAS)] : puntos;
    const limites = L.latLngBounds(dentro.map((p) => [p.lat, p.lng] as [number, number]));
    const opciones = {
      paddingTopLeft: [60, 76] as L.PointTuple,
      paddingBottomRight: [60, 60] as L.PointTuple,
      maxZoom: 11,
    };
    if (moverse) mapa.flyToBounds(limites, { ...opciones, duration: 0.9 });
    else mapa.fitBounds(limites, opciones);
  }, [mapa, puntos, foco, origen, vista]);
  return null;
}

/**
 * Zoom con Ctrl (o ⌘, Alt, Mayús) + rueda, alrededor del puntero, como en Google Maps (review de usuario, 16-10). Sin
 * tecla, la rueda sigue moviendo la página y el mapa avisa cómo hacer zoom. Una rueda de trackpad manda muchos eventos
 * seguidos: se cuenta uno cada 150 ms para que cada gesto sea un nivel de zoom.
 */
function ZoomConTecla({ aviso }: { aviso: string }) {
  const mapa = useMap();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const contenedor = mapa.getContainer();
    let reloj: number | undefined;
    let ultimo = 0;
    const alGirar = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        e.preventDefault();
        setVisible(false);
        if (e.timeStamp - ultimo < 150) return;
        ultimo = e.timeStamp;
        const nivel = mapa.getZoom() + (e.deltaY < 0 ? 1 : -1);
        mapa.setZoomAround(
          mapa.mouseEventToContainerPoint(e),
          Math.min(mapa.getMaxZoom(), Math.max(mapa.getMinZoom(), nivel)),
        );
      } else {
        setVisible(true);
        window.clearTimeout(reloj);
        reloj = window.setTimeout(() => setVisible(false), 1500);
      }
    };
    contenedor.addEventListener("wheel", alGirar, { passive: false });
    return () => {
      contenedor.removeEventListener("wheel", alGirar);
      window.clearTimeout(reloj);
    };
  }, [mapa]);
  return (
    <div
      aria-hidden="true"
      data-testid="aviso-zoom"
      className={`bg-noche/55 font-display text-crema pointer-events-none absolute inset-0 z-[1000] grid place-items-center p-6 text-center text-base font-semibold transition-opacity duration-200 motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {aviso}
    </div>
  );
}

/**
 * El mapa de tiendas (rediseño del 26-10): teselas de OpenStreetMap entibiadas con un filtro (papel, no gris de
 * oficina), el punto aqua del ZIP buscado y los pines de las tiendas. Se acerca solo al ZIP y sus tiendas más cercanas;
 * «Ver todo EE. UU.» (en la página) aleja hasta enseñarlas todas.
 */
export default function MapaTiendas({
  puntos,
  foco,
  origen,
  vista,
  etiqueta,
  etiquetaOrigen,
  avisoZoom,
  alElegir,
}: {
  puntos: PuntoMapa[];
  foco: string | null;
  origen: Coordenadas | null;
  vista: VistaMapa;
  etiqueta: string;
  etiquetaOrigen: string;
  avisoZoom: string;
  alElegir: (id: string) => void;
}) {
  return (
    <div role="region" aria-label={etiqueta} className="mapa-cuento h-full w-full">
      <MapContainer
        center={[39.5, -98.35]}
        zoom={4}
        minZoom={3}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Encuadre puntos={puntos} foco={foco} origen={origen} vista={vista} />
        <ZoomConTecla aviso={avisoZoom} />
        {origen ? (
          <Marker
            position={[origen.lat, origen.lng]}
            icon={ICONO_ORIGEN}
            title={etiquetaOrigen}
            alt={etiquetaOrigen}
            keyboard={false}
          />
        ) : null}
        {puntos.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={icono(p, p.id === foco)}
            title={`${p.ciudad} (DEMO) · ${p.detalle}`}
            alt={`${p.ciudad} (DEMO)`}
            eventHandlers={{ click: () => alElegir(p.id) }}
          >
            <Popup>
              <b>{p.ciudad}</b> · DEMO
              <br />
              {p.detalle}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
