"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
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

export default function MapaTiendas({
  puntos,
  foco,
  etiqueta,
  alElegir,
}: {
  puntos: PuntoMapa[];
  foco: string | null;
  etiqueta: string;
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
