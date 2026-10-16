import "./globals.css";

// El <html> lo pone app/[locale]/layout.tsx (cada idioma tiene su lang).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
