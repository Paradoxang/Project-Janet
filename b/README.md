# Maqueta B

La tienda de juguetes de demostración: Next.js estático, datos de ejemplo y sin cobros reales.

**La guía completa está en el [README de la raíz](../README.md):** estado, mapa del código, cómo funciona, pruebas y cómo
publicar. Aquí solo van los comandos.

```bash
npm install
npm run dev        # http://localhost:3000/en/
npm run typecheck && npm run lint
npm test           # unitarias (Vitest)
npm run build      # genera out/: el sitio que se publica
npm run e2e        # Playwright sobre out/ (haz build antes)
```
