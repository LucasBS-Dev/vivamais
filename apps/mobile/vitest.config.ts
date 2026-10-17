import { defineConfig } from "vitest/config";

export default defineConfig({
  // Workers keep transforms in memory instead of temporary fork IPC files on Windows.
  test: { environment: "node", pool: "threads" },
});
