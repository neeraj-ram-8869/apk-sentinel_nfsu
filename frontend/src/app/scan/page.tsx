import type { Metadata } from "next";

import ConsoleRoute from "@/components/ConsoleRoute";

export const metadata: Metadata = {
  title: "Scan an APK — APK Sentinel",
  description: "Upload an Android app and get a static and dynamic security analysis.",
};

// Deep-link target for anything sending a citizen here to check an APK,
// including the Citizens App handoff. Opens straight on the uploader rather
// than the dashboard.
export default function ScanPage() {
  return <ConsoleRoute initialView="APK Scanner" />;
}
