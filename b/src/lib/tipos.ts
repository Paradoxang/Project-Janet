// Tipos del paquete de datos común (/datos). Hoy vienen de JSON; en el desarrollo real, de la API.

export type Idioma = "en" | "es";
export type Texto = Record<Idioma, string>;
export type Lista = Record<Idioma, string[]>;

export type GrupoEdad = "0-12m" | "1-2" | "3-4" | "5-7" | "8+";
export type Categoria = "baby" | "building" | "pretend" | "stem" | "arts" | "outdoor" | "games" | "plush";
export type Ocasion = "birthday" | "holidays" | "baby-shower" | "just-because" | "back-to-school";
export type Tinte = "cielo" | "menta" | "lila" | "durazno" | "limon";

export interface Resena {
  id: string;
  name: string;
  state: string;
  rating: number;
  date: string;
  title: Texto;
  body: Texto;
}

export interface Producto {
  id: string;
  slug: string;
  title: Texto;
  summary: Texto;
  bullets: Lista;
  specs: {
    ages: Texto;
    dimensions: string;
    weight: string;
    materials: Texto;
    batteries: Texto;
    pieces: number | null;
  };
  safety: Lista;
  price: number;
  category: Categoria;
  ageGroup: GrupoEdad;
  occasions: Ocasion[];
  bestSeller: boolean;
  rating: number;
  reviewCount: number;
  stockOnline: number;
  deliveryDays: number;
  illustration: string;
  /** Foto subida por la dueña (data URL). Si está, se usa en vez de la ilustración. */
  imagen?: string;
  tint: Tinte;
  related: string[];
  keywords: Lista;
  reviews: Resena[];
}

export interface Tienda {
  id: string;
  city: string;
  state: string;
  address: string;
  zip: string;
  lat: number;
  lng: number;
  phone: string;
  hours: Texto;
  stock: Record<string, number>;
}

export interface Impuestos {
  nota: Texto;
  estados: Record<string, { name: string; rate: number }>;
}

export interface DiaPanel {
  date: string;
  sales: number;
  orders: number;
  visitors: number;
}

export interface AvisoPanel {
  id: string;
  severity: "high" | "medium" | "low";
  title: Texto;
  body: Texto;
  action: Texto;
  href?: string;
}

export type Dispositivo = "mobile" | "desktop" | "tablet";
export type Fuente = "instagram" | "google" | "direct" | "facebook" | "email" | "tiktok";

export interface Panel {
  days: DiaPanel[];
  funnel: { visitors: number; productViews: number; addedToCart: number; checkout: number; purchased: number };
  bestSellers: { productId: string; units: number; revenue: number }[];
  alerts: AvisoPanel[];
  /** Por producto en los últimos 30 días: clics (vistas de la ficha), agregados al carrito y vendidos. */
  products: { productId: string; views: number; addedToCart: number; units: number; revenue: number }[];
  searches: { term: string; count: number; results: boolean }[];
  devices: { device: Dispositivo; visitors: number; orders: number }[];
  sources: { source: Fuente; visitors: number; orders: number }[];
  customers: { newOrders: number; returningOrders: number };
  states: { state: string; orders: number; revenue: number }[];
  /** Pedidos por hora del día (0 a 23). */
  hours: number[];
}

/** Lo mínimo de un producto que necesitan el buscador y el carrito en el navegador. */
export interface ProductoLigero {
  id: string;
  slug: string;
  title: Texto;
  price: number;
  illustration: string;
  imagen?: string;
  tint: Tinte;
  ageGroup: GrupoEdad;
  category: Categoria;
  occasions: Ocasion[];
  rating: number;
  reviewCount: number;
  bestSeller: boolean;
  stockOnline: number;
  deliveryDays: number;
  keywords: Lista;
}
