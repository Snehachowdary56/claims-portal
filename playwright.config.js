import { defineConfig } from "@playwright/test";

// DEMO=1 tests the static GitHub Pages build; otherwise the production build with the Express server.
const demo = Boolean(process.env.DEMO);

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: demo ? "http://localhost:3002" : "http://localhost:3001", viewport: { width: 1200, height: 800 } },
  webServer: demo
    ? { command: "npx http-server dist-demo -p 3002 -s", port: 3002, reuseExistingServer: false }
    : { command: "node server/server.js", port: 3001, reuseExistingServer: false },
});
