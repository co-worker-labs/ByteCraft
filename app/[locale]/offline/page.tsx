import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import OfflineClient from "./offline-page";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function OfflineRoute() {
  return <OfflineClient />;
}
