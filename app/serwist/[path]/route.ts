import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

// SW revision: git HEAD captured at build time. The route is statically generated,
// so this IIFE runs once during `next build`. Vercel build env has git access; the
// fallback only fires for local dev or detached HEAD states.
const revision =
  process.env.NODE_ENV === "development"
    ? crypto.randomUUID()
    : (spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ??
      crypto.randomUUID());

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute(
  {
    swSrc: "app/sw.ts",
    useNativeEsbuild: true,
    additionalPrecacheEntries: [{ url: "/", revision }],
  }
);
