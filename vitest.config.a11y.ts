import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["components/**/*.a11y.test.tsx"],
    environment: "jsdom",
    setupFiles: ["./tests/a11y-setup.ts"],
  },
});
