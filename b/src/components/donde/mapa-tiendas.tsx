"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

export interface PuntoMapa {
  id: string;
  ciudad: string;
  lat: number;
  lng: number;
  /** null = sin filtro de producto */
  unidades: number | null;
  detalle: string;
}

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

function Encuadre({ puntos, foco }: { puntos: PuntoMapa[]; foco: string | null }) {
  const mapa = useMap();
  useEffect(() => {
    const elegido = puntos.find((p) => p.id === foco);
    if (elegido) {
      mapa.flyTo([elegido.lat, elegido.lng], 9, { duration: 0.8 });
    } else {
      mapa.fitBounds(L.latLngBounds(puntos.map((p) => [p.lat, p.lng] as [number, number])), {
        paddingTopLeft: [56, 48],
        paddingBottomRight: [28, 28],
      });
    }
  }, [mapa, puntos, foco]);
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
        mapa.setZoomAround(mapa.mouseEventToContainerPoint(e), Math.min(mapa.getMaxZoom(), Math.max(mapa.getMinZoom(), nivel)));
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
      className={`pointer-events-none absolute inset-0 z-[1000] grid place-items-center bg-black/45 p-6 text-center text-base font-bold text-white transition-opacity duration-200 motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {aviso}
    </div>
  );
}

export default function MapaTiendas({
  puntos,
  foco,
  etiqueta,
  avisoZoom,
  alElegir,
}: {
  puntos: PuntoMapa[];
  foco: string | null;
  etiqueta: string;
  avisoZoom: string;
  alElegir: (id: string) => void;
}) {
  return (
    <div role="region" aria-label={etiqueta} className="h-full w-full">
      <MapContainer
        center={[39.5, -98.35]}
        zoom={3}
        scrollWheelZoom={false}
        className="h-full w-full rounded-card"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Encuadre puntos={puntos} foco={foco} />
        <ZoomConTecla aviso={avisoZoom} />
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
