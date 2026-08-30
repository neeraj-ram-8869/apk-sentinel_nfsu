// ===================================================================
// Scan store — persistence behind a swappable interface.
//
// Until now nothing survived a page refresh: the ledger lived in React
// state, so the dashboard emptied itself on reload and a report had no
// identity you could link to. Reports are addressable now.
//
// Backed by localStorage, which means a report is restorable on the
// device that produced it. Sharing a report *link* with somebody else
// needs a server store; every access goes through this module so that
// swap is one file, not a refactor.
// ===================================================================

export interface StoredScan {
  id: string;
  createdAt: number;
  fileName: string;
  fileSize: number;
  packageName: string;
  riskScore: number;
  riskTier: string;
  /** The full AnalyzedApkResult, as produced by the analysis pipeline. */
  result: any;
  narrative?: string;
}

const KEY = "apk-sentinel:scans:v1";
const MAX_SCANS = 25;

// Strings and class names dominate the payload and are only used for the
// asset views. Capped so one large APK cannot fill the whole quota.
const MAX_STRINGS = 800;
const MAX_CLASSES = 800;

function readAll(): StoredScan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Private mode, cleared storage, or corrupt JSON. An empty history is
    // always a safe answer here.
    return [];
  }
}

function writeAll(scans: StoredScan[]): boolean {
  if (typeof window === "undefined") return false;
  let working = scans.slice(0, MAX_SCANS);
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(working));
      return true;
    } catch {
      // Almost certainly the quota. Drop the oldest scan and try again;
      // losing old history beats losing the scan just performed.
      if (working.length <= 1) return false;
      working = working.slice(0, working.length - 1);
    }
  }
  return false;
}

/** Stable id for a scan. Same APK gives the same report URL. */
export function scanIdFor(result: any, fileName: string): string {
  const hash = typeof result?.fileHash === "string" ? result.fileHash : "";
  if (hash.length >= 16) return hash.slice(0, 16).toLowerCase();
  const seed = `${fileName}:${result?.manifest?.packageName ?? ""}`;
  let acc = 0;
  for (let i = 0; i < seed.length; i++) acc = (acc * 31 + seed.charCodeAt(i)) >>> 0;
  return acc.toString(16).padStart(8, "0") + Date.now().toString(16);
}

function trim(result: any): any {
  if (!result || typeof result !== "object") return result;
  return {
    ...result,
    allStrings: Array.isArray(result.allStrings) ? result.allStrings.slice(0, MAX_STRINGS) : result.allStrings,
    classNames: Array.isArray(result.classNames) ? result.classNames.slice(0, MAX_CLASSES) : result.classNames,
  };
}

export function listScans(): StoredScan[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function getScan(id: string): StoredScan | null {
  if (!id) return null;
  return readAll().find((s) => s.id === id) ?? null;
}

export function saveScan(scan: StoredScan): boolean {
  const others = readAll().filter((s) => s.id !== scan.id);
  const next = [{ ...scan, result: trim(scan.result) }, ...others].sort(
    (a, b) => b.createdAt - a.createdAt
  );
  return writeAll(next);
}

/** Attach the AI narrative once it arrives, without rewriting the scan. */
export function attachNarrative(id: string, narrative: string): void {
  const all = readAll();
  const scan = all.find((s) => s.id === id);
  if (!scan) return;
  scan.narrative = narrative;
  writeAll(all);
}

export function deleteScan(id: string): void {
  writeAll(readAll().filter((s) => s.id !== id));
}

export function reportPath(id: string): string {
  return `/report/${id}`;
}
