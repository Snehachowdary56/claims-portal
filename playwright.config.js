import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://localhost:3001", viewport: { width: 1200, height: 800 } },
  webServer: { command: "node server/server.js", port: 3001, reuseExistingServer: false },
});
