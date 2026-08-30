import type { Metadata } from "next";

import ConsoleRoute from "@/components/ConsoleRoute";

export const metadata: Metadata = {
  title: "Threat report — APK Sentinel",
  description: "Static analysis, risk score and threat narrative for a scanned Android app.",
};

// A scan's own address. The report is restored from the device that produced
// it; see src/lib/scan-store.ts for why, and what changes when a server store
// is added.
export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ConsoleRoute initialView="APK Scanner" scanId={id} />;
}
