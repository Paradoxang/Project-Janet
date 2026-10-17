// Fotos de producto hechas con IA (encargo 20261017-05; Santiago, 17-10: «vamos a generar imágenes de IA de juguetes»).
// Viven en public/productos-ia/<ilustración>.webp, con un estilo de la casa: el juguete solo, sobre el tinte de su edad.
// - La tienda blanca (la de siempre) sigue con las ilustraciones propias de public/productos/*.svg.
// - La variante colorida (marca/script-variante.ts) enseña la foto.
// - Un producto sin ilustración propia (los del inventario largo) usa la foto en las dos.
// Las fotos se publican marcadas «Imagen ilustrativa (IA)».

/** Las ilustraciones propias que existen en public/productos/. */
export const ILUSTRACIONES = new Set([
  "abc-blocks",
  "activity-cube",
  "art-set",
  "board-game",
  "dinosaurs",
  "magnetic-tiles",
  "map-puzzle",
  "pull-duck",
  "rainbow-stacker",
  "rc-car",
  "ring-stacker",
  "robot-kit",
  "rocket-launcher",
  "science-kit",
  "shape-sorter",
  "tea-set",
  "teddy-bear",
  "telescope",
  "train-set",
  "xylophone",
]);

/** Las fotos con IA que ya están en public/productos-ia/ (se añade cada lote al colocarlo). */
export const FOTOS_IA = new Set<string>([
  "abc-blocks",
  "activity-cube",
  "activity-table",
  "animal-puzzle",
  "art-set",
  "bath-boats",
  "bead-kit",
  "board-game",
  "card-game",
  "delta-kite",
  "dinosaurs",
  "doctor-kit",
  "elephant-lovey",
  "garden-tools",
  "jumbo-crayons",
  "kitchen-food-set",
  "magnetic-tiles",
  "map-puzzle",
  "marble-run",
  "memory-game",
  "microscope",
  "play-gym",
  "plush-dragon",
  "plush-puppy",
  "pull-duck",
  "push-walker",
  "rainbow-stacker",
  "rc-car",
  "ring-stacker",
  "robot-kit",
  "rocket-launcher",
  "science-kit",
  "shape-sorter",
  "soft-book",
  "stacking-cups",
  "tea-set",
  "teddy-bear",
  "telescope",
  "train-set",
  "xylophone",
]);

export const tieneIlustracion = (illustration: string) => ILUSTRACIONES.has(illustration);

/** La foto con IA del juguete, si la hay. */
export const fotoIA = (illustration: string) => (FOTOS_IA.has(illustration) ? `/productos-ia/${illustration}.webp` : null);
