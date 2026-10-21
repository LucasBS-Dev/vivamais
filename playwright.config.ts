import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  timeout: 45_000,
  use: {
    baseURL,
    trace: "off",
    screenshot: "off",
    video: "off",
    ...devices["Desktop Chrome"],
  },
  projects: [{ name: "chromium" }],
  webServer: [
    {
      command:
        "node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1 --port 3000",
      cwd: "web",
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        API_BASE_URL: process.env.API_BASE_URL || "http://127.0.0.1:8080",
        APP_ORIGIN: baseURL,
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
    {
      command: "node infra/serve-mobile-preview.mjs",
      url: "http://127.0.0.1:8081",
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
});
