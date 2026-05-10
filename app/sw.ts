/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Worker types come from tsconfig.sw.json, not the root tsconfig —
// avoids leaking WebWorker types into regular components (Cache, Client name collisions).

import { defaultCache } from "@serwist/turbopack/worker";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope;

const LOCALES_WITH_PREFIX = ["zh-CN", "zh-TW", "ja", "ko", "es", "pt-BR", "fr", "de", "ru"];

const offlinePrecacheEntries = [
  { url: "/offline", revision: "1" },
  ...LOCALES_WITH_PREFIX.map((locale) => ({ url: `/${locale}/offline`, revision: "1" })),
];

const serwist = new Serwist({
  precacheEntries: offlinePrecacheEntries,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.setCatchHandler(async ({ request }) => {
  if (request.mode === "navigate") {
    const url = new URL(request.url);
    const firstSegment = url.pathname.split("/")[1] ?? "";
    const offlineUrl = LOCALES_WITH_PREFIX.includes(firstSegment)
      ? `/${firstSegment}/offline`
      : "/offline";
    const response =
      (await serwist.matchPrecache(offlineUrl)) ?? (await serwist.matchPrecache("/offline"));
    if (response) return response;
  }
  return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
});

serwist.addEventListeners();
