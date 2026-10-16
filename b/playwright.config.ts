import { defineConfig, devices } from "@playwright/test";

// Pruebas sobre el sitio estático ya construido (out/), en tamaño de celular.
// Solo hay Chromium en el entorno: el «iPhone» es Chromium con pantalla y user agent de iPhone.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npx serve out -l 4173 --no-clipboard",
    url: "http://localhost:4173/en/",
    reuseExistingServer: true,
  },
  projects: [
    { name: "iphone", use: { ...devices["iPhone 13"], browserName: "chromium" } },
    { name: "android", use: { ...devices["Pixel 7"] } },
  ],
});
