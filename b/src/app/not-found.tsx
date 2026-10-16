import Link from "next/link";

// 404 fuera de /en y /es: página mínima que manda al inicio en inglés.
export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
        <p>
          Page not found · Página no encontrada. <Link href="/en/">Go to the store</Link>
        </p>
      </body>
    </html>
  );
}
