// Fotos que sube la dueña: se achican en el navegador (máx. 640 px, JPEG) antes de guardarlas,
// para que quepan varias en el almacenamiento del navegador (unos 5 MB en total).

const LADO_MAXIMO = 640;

export async function reducirFoto(archivo: File): Promise<string> {
  const url = URL.createObjectURL(archivo);
  try {
    const imagen = new Image();
    imagen.src = url;
    await imagen.decode();
    const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.naturalWidth, imagen.naturalHeight));
    const lienzo = document.createElement("canvas");
    lienzo.width = Math.max(1, Math.round(imagen.naturalWidth * escala));
    lienzo.height = Math.max(1, Math.round(imagen.naturalHeight * escala));
    const ctx = lienzo.getContext("2d");
    if (!ctx) throw new Error("Sin canvas 2D");
    // Las zonas transparentes (PNG) quedan blancas en el JPEG, no negras.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    return lienzo.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}
