import { defineConfig } from "@playwright/test";
import { randomUUID } from "node:crypto";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3100",
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100/api/health",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      DATABASE_PATH: `./data/e2e-${randomUUID()}.sqlite`,
      APP_ORIGIN: "http://localhost:3100",
    },
  },
});
