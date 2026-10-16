// ZIP de EE. UU. → estado y coordenadas aproximadas. Suficiente para la maqueta: estimar el impuesto y
// encontrar la tienda más cercana. (En el desarrollo real: el Gazetteer ZCTA del Censo.)

export interface Coordenadas {
  lat: number;
  lng: number;
}

// Rangos de los 3 primeros dígitos del ZIP por estado.
const RANGOS: [number, number, string][] = [
  [10, 27, "MA"], [28, 29, "RI"], [30, 38, "NH"], [39, 49, "ME"], [50, 54, "VT"], [55, 55, "MA"],
  [56, 59, "VT"], [60, 69, "CT"], [70, 89, "NJ"], [100, 149, "NY"], [150, 196, "PA"], [197, 199, "DE"],
  [200, 200, "DC"], [201, 201, "VA"], [202, 205, "DC"], [206, 219, "MD"], [220, 246, "VA"], [247, 268, "WV"],
  [270, 289, "NC"], [290, 299, "SC"], [300, 319, "GA"], [320, 339, "FL"], [341, 349, "FL"], [350, 369, "AL"],
  [370, 385, "TN"], [386, 397, "MS"], [398, 399, "GA"], [400, 427, "KY"], [430, 459, "OH"], [460, 479, "IN"],
  [480, 499, "MI"], [500, 528, "IA"], [530, 549, "WI"], [550, 567, "MN"], [569, 569, "DC"], [570, 577, "SD"],
  [580, 588, "ND"], [590, 599, "MT"], [600, 629, "IL"], [630, 658, "MO"], [660, 679, "KS"], [680, 693, "NE"],
  [700, 714, "LA"], [716, 729, "AR"], [730, 732, "OK"], [733, 733, "TX"], [734, 749, "OK"], [750, 799, "TX"],
  [800, 816, "CO"], [820, 831, "WY"], [832, 838, "ID"], [840, 847, "UT"], [850, 865, "AZ"], [870, 884, "NM"],
  [885, 885, "TX"], [889, 898, "NV"], [900, 961, "CA"], [967, 968, "HI"], [970, 979, "OR"], [980, 994, "WA"],
  [995, 999, "AK"],
];

// Centro aproximado de cada estado.
const CENTRO_ESTADO: Record<string, [number, number]> = {
  AL: [32.81, -86.79], AK: [61.37, -152.4], AZ: [33.73, -111.43], AR: [34.97, -92.37], CA: [36.12, -119.68],
  CO: [39.06, -105.31], CT: [41.6, -72.76], DE: [39.32, -75.51], DC: [38.9, -77.03], FL: [27.77, -81.69],
  GA: [33.04, -83.64], HI: [21.09, -157.5], ID: [44.24, -114.48], IL: [40.35, -88.99], IN: [39.85, -86.26],
  IA: [42.01, -93.21], KS: [38.53, -96.73], KY: [37.67, -84.67], LA: [31.17, -91.87], ME: [44.69, -69.38],
  MD: [39.06, -76.8], MA: [42.23, -71.53], MI: [43.33, -84.54], MN: [45.69, -93.9], MS: [32.74, -89.68],
  MO: [38.46, -92.29], MT: [46.92, -110.45], NE: [41.13, -98.27], NV: [38.31, -117.06], NH: [43.45, -71.56],
  NJ: [40.3, -74.52], NM: [34.84, -106.25], NY: [42.17, -74.95], NC: [35.63, -79.81], ND: [47.53, -99.78],
  OH: [40.39, -82.76], OK: [35.57, -96.93], OR: [44.57, -122.07], PA: [40.59, -77.21], RI: [41.68, -71.51],
  SC: [33.86, -80.95], SD: [44.3, -99.44], TN: [35.75, -86.69], TX: [31.05, -97.56], UT: [40.15, -111.86],
  VT: [44.05, -72.71], VA: [37.77, -78.17], WA: [47.4, -121.49], WV: [38.49, -80.95], WI: [44.27, -89.62],
  WY: [42.76, -107.3],
};

// Ciudades grandes por prefijo (más precisas que el centro del estado).
const METROS: [number, number, number, number, string][] = [
  // [desde, hasta, lat, lng, ciudad]
  [980, 981, 47.61, -122.33, "Seattle"], [982, 982, 47.98, -122.2, "Everett"], [983, 984, 47.25, -122.44, "Tacoma"], [985, 985, 47.04, -122.9, "Olympia"],
  [986, 986, 45.64, -122.66, "Vancouver"], [990, 992, 47.66, -117.43, "Spokane"], [970, 972, 45.52, -122.68, "Portland"],
  [900, 908, 34.05, -118.25, "Los Angeles"], [910, 916, 34.17, -118.3, "Pasadena"], [917, 918, 34.07, -117.95, "Pomona"], [919, 921, 32.72, -117.16, "San Diego"],
  [922, 922, 33.83, -116.55, "Palm Springs"], [923, 925, 34.06, -117.29, "Riverside"], [926, 928, 33.75, -117.87, "Santa Ana"], [930, 931, 34.3, -119.4, "Ventura"],
  [932, 933, 35.37, -119.02, "Bakersfield"], [936, 938, 36.74, -119.79, "Fresno"], [940, 944, 37.6, -122.35, "San Francisco"], [945, 948, 37.8, -122.27, "Oakland"],
  [950, 951, 37.34, -121.89, "San Jose"], [956, 958, 38.58, -121.49, "Sacramento"],
  [750, 753, 32.78, -96.8, "Dallas"], [760, 761, 32.75, -97.33, "Fort Worth"], [770, 775, 29.76, -95.37, "Houston"], [780, 782, 29.42, -98.49, "San Antonio"],
  [733, 733, 30.27, -97.74, "Austin"], [786, 787, 30.27, -97.74, "Austin"], [799, 799, 31.76, -106.49, "El Paso"],
  [320, 322, 30.33, -81.66, "Jacksonville"], [327, 328, 28.54, -81.38, "Orlando"], [330, 332, 25.76, -80.19, "Miami"], [333, 333, 26.12, -80.14, "Fort Lauderdale"],
  [334, 334, 26.71, -80.05, "West Palm Beach"], [335, 337, 27.95, -82.46, "Tampa"], [339, 339, 26.64, -81.87, "Fort Myers"],
  [100, 102, 40.75, -73.99, "New York"], [103, 103, 40.58, -74.15, "Staten Island"], [104, 104, 40.84, -73.86, "Bronx"], [110, 114, 40.71, -73.83, "Queens"],
  [115, 119, 40.79, -73.13, "Long Island"], [120, 123, 42.65, -73.75, "Albany"], [140, 143, 42.89, -78.88, "Buffalo"], [144, 146, 43.16, -77.61, "Rochester"],
  [850, 853, 33.45, -112.07, "Phoenix"], [856, 857, 32.22, -110.97, "Tucson"], [889, 891, 36.17, -115.14, "Las Vegas"], [894, 895, 39.53, -119.81, "Reno"],
  [606, 608, 41.88, -87.63, "Chicago"], [300, 303, 33.75, -84.39, "Atlanta"], [800, 802, 39.74, -104.99, "Denver"], [21, 22, 42.36, -71.06, "Boston"],
  [190, 191, 39.95, -75.17, "Philadelphia"], [150, 152, 40.44, -79.99, "Pittsburgh"], [200, 205, 38.9, -77.04, "Washington"], [480, 483, 42.33, -83.05, "Detroit"],
  [553, 554, 44.98, -93.27, "Minneapolis"], [700, 701, 29.95, -90.07, "New Orleans"], [370, 372, 36.16, -86.78, "Nashville"], [380, 381, 35.15, -90.05, "Memphis"],
  [282, 282, 35.23, -80.84, "Charlotte"], [275, 276, 35.78, -78.64, "Raleigh"], [840, 841, 40.76, -111.89, "Salt Lake City"], [630, 631, 38.63, -90.2, "St. Louis"],
  [640, 641, 39.1, -94.58, "Kansas City"], [441, 441, 41.5, -81.69, "Cleveland"], [432, 432, 39.96, -83.0, "Columbus"], [452, 452, 39.1, -84.51, "Cincinnati"],
  [70, 71, 40.74, -74.17, "Newark"], [967, 968, 21.31, -157.86, "Honolulu"], [995, 996, 61.22, -149.9, "Anchorage"],
];

export function zipValido(zip: string): boolean {
  return /^\d{5}$/.test(zip.trim());
}

function prefijo(zip: string): number | null {
  return zipValido(zip) ? Number(zip.trim().slice(0, 3)) : null;
}

export function estadoDeZip(zip: string): string | null {
  const p = prefijo(zip);
  if (p === null) return null;
  const rango = RANGOS.find(([desde, hasta]) => p >= desde && p <= hasta);
  return rango ? rango[2] : null;
}

/** Ciudad aproximada del ZIP (solo las grandes); si no, el código del estado. */
export function lugarDeZip(zip: string): string | null {
  const p = prefijo(zip);
  if (p === null) return null;
  const metro = METROS.find(([desde, hasta]) => p >= desde && p <= hasta);
  return metro ? metro[4] : estadoDeZip(zip);
}

export function coordenadasDeZip(zip: string): Coordenadas | null {
  const p = prefijo(zip);
  if (p === null) return null;
  const metro = METROS.find(([desde, hasta]) => p >= desde && p <= hasta);
  if (metro) return { lat: metro[2], lng: metro[3] };
  const estado = estadoDeZip(zip);
  const centro = estado ? CENTRO_ESTADO[estado] : undefined;
  return centro ? { lat: centro[0], lng: centro[1] } : null;
}

/** Distancia en millas (fórmula del haversine). */
export function distanciaMillas(a: Coordenadas, b: Coordenadas): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}
