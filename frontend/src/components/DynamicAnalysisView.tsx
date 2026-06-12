"use client";

import React from "react";

export default function DynamicAnalysisView({ analysisResult }: { analysisResult: any }) {
  const hasCritical = analysisResult?.analysis?.findings?.some((f: any) => f.severity === "CRITICAL");

  return (
    <div className="flex-col gap-5 animate-fade-up w-full">
      <div className="flex justify-between items-center mb-md">
        <div>
          <h2 className="font-display-lg text-display-lg font-bold text-on-surface">Aparoid Dynamic Execution Trace</h2>
          <p className="font-body-base text-body-base text-on-surface-variant mt-1">Emulated runtime sandbox — network hooks, filesystem, API intercepts</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-sm font-medium text-primary tracking-wide">LIVE EMULATOR</span>
        </div>
      </div>

      {/* Tracer modules */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-lg">
        {[
          { code: "AP-D1", label: "Network Beacon", icon: "language", status: analysisResult?.analysis?.urls?.length ? "error" : "active" },
          { code: "AP-D2", label: "UI Overlay",     icon: "layers", status: analysisResult?.analysis?.findings?.some((f: any) => f.title.includes("Overlay")) ? "error" : "active" },
          { code: "AP-D3", label: "Filesystem",     icon: "folder", status: "active" },
          { code: "AP-D4", label: "A11y Abuse",     icon: "accessibility", status: analysisResult?.analysis?.findings?.some((f: any) => f.title.includes("Keystroke") || f.title.includes("Accessibility")) ? "error" : "active" },
          { code: "AP-D5", label: "DEX Tracer",     icon: "science", status: analysisResult?.classNames?.some((c: string) => c.includes("DexClassLoader")) ? "warning" : "active" },
        ].map(t => (
          <div key={t.code} className={`bg-[rgba(255,255,255,0.7)] backdrop-blur-[12px] border border-[rgba(225,227,242,0.8)] shadow-sm rounded-xl p-4 flex flex-col items-center gap-2 transition-transform hover:-translate-y-1 ${
            t.status === "error" ? "border-error/50 shadow-[0_4px_12px_rgba(186,26,26,0.1)]" : 
            t.status === "warning" ? "border-[#ffb020]/50 shadow-[0_4px_12px_rgba(255,176,32,0.1)]" : ""
          }`}>
            <span className={`material-symbols-outlined text-[32px] ${
              t.status === "error" ? "text-error" : 
              t.status === "warning" ? "text-[#ffb020]" : 
              "text-[#059669]"
            }`}>{t.icon}</span>
            <div className={`font-mono-base font-bold text-xs ${
              t.status === "error" ? "text-error" : 
              t.status === "warning" ? "text-[#ffb020]" : 
              "text-[#059669]"
            }`}>{t.code}</div>
            <div className="text-xs text-on-surface-variant font-medium text-center">{t.label}</div>
            <div className={`w-2 h-2 rounded-full mt-1 ${
              t.status === "error" ? "bg-error animate-pulse shadow-[0_0_8px_rgba(186,26,26,0.8)]" : 
              t.status === "warning" ? "bg-[#ffb020] shadow-[0_0_8px_rgba(255,176,32,0.8)]" : 
              "bg-[#00D15A] animate-pulse shadow-[0_0_12px_rgba(0,209,90,0.8)]"
            }`} />
          </div>
        ))}
      </div>

      {/* Terminal Sandbox */}
      <div className="bg-[#0A0A14] border border-[rgba(255,255,255,0.05)] rounded-xl flex flex-col overflow-hidden shadow-lg min-h-[400px]">
        {/* Terminal Header */}
        <div className="bg-surface-container-lowest/5 border-b border-white/10 p-3 flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-error"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffb020]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28CA41]"></div>
          </div>
          <span className="font-mono-base text-xs text-outline tracking-wider">
            aparoid-sandbox — {analysisResult?.manifest?.packageName ?? "waiting for connection…"}
          </span>
        </div>
        
        {/* Terminal Output */}
        <div className="flex-1 overflow-y-auto p-5 font-mono-base text-[13px] leading-relaxed text-[#A8B1C2]">
          {analysisResult ? (
            <div className="space-y-2">
              <div className="text-primary-fixed">&gt; aparoid v3.0.1 — attaching to {analysisResult.manifest.packageName}…</div>
              <div>&gt; Hooking Android API layer… <span className="text-tertiary-fixed">OK</span></div>
              <div>&gt; Frida instrumentation active. Tracing calls…</div>
              
              {analysisResult.analysis.urls.length > 0 && (
                <div className="mt-4 border-l-2 border-error pl-3 py-1 bg-error/5">
                  <div className="text-error font-bold">[!] NETWORK BEACON DETECTED</div>
                  {analysisResult.analysis.urls.slice(0, 3).map((u: string, i: number) => (
                    <div key={i} className="text-error/90 mt-1">  =&gt; GET {u}</div>
                  ))}
                </div>
              )}

              {hasCritical && (
                <div className="mt-4 border-l-2 border-error pl-3 py-1 bg-error/5">
                  <div className="text-error font-bold">[!] CRITICAL BEHAVIOR FLAG</div>
                  <div className="text-error/90 mt-1">  =&gt; Triggered heuristic rule: Suspicious Execution Flow</div>
                </div>
              )}

              <div className="mt-4 text-outline animate-pulse">_</div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full opacity-50 flex-col gap-3">
              <span className="material-symbols-outlined text-[48px] animate-pulse">terminal</span>
              <span>Awaiting APK injection…</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
