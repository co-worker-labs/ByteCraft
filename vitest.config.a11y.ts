import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["components/**/*.a11y.test.tsx", "components/ui/__tests__/*.test.tsx"],
    environment: "jsdom",
    setupFiles: ["./tests/a11y-setup.ts"],
  },
});
