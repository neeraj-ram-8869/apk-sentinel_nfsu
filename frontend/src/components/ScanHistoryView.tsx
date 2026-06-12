"use client";

import React from "react";

export default function ScanHistoryView({ analysisResult }: { analysisResult: any }) {
  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] opacity-60">
        <span className="material-symbols-outlined text-[64px] text-primary mb-4">terminal</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">No Raw Logs</h2>
        <p className="text-on-surface-variant font-body-base text-body-base">Upload an APK to view raw engine logs.</p>
      </div>
    );
  }

  // Generate some plausible mock log lines based on analysis result
  const mockLogs = [
    `[INFO] apkman v3.0.1 initialized`,
    `[INFO] Target: ${analysisResult.manifest.packageName}`,
    `[INFO] Unpacking APK... [OK]`,
    `[INFO] Analyzing AndroidManifest.xml...`,
    ...analysisResult.manifest.permissions.map((p: string) => `  -> Found Permission: ${p}`),
    `[INFO] Disassembling DEX to Smali...`,
    `[WARN] Detected potentially obfuscated classes`,
    ...analysisResult.analysis.findings.map((f: any) => `[${f.severity}] ${f.title}: ${f.scope}`),
    `[INFO] Cross-referencing VirusTotal Intelligence...`,
    `[INFO] Engine Pipeline Completed. Risk Score: ${analysisResult.riskScore}/100`
  ];

  return (
    <div className="flex-col gap-5 animate-fade-up w-full h-full">
      <div className="flex justify-between items-center mb-md">
        <div>
          <h2 className="font-display-lg text-display-lg font-bold text-on-surface">Raw Engine Output</h2>
          <p className="font-body-base text-body-base text-on-surface-variant mt-1">Direct unformatted stdout trace from analysis engines</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-outline-variant text-primary rounded flex items-center gap-2 hover:bg-primary/5 transition-colors text-sm font-label-caps">
            <span className="material-symbols-outlined text-sm">download</span> Export .log
          </button>
        </div>
      </div>

      <div className="bg-[#0A0A14] border border-[rgba(255,255,255,0.05)] shadow-lg rounded-xl flex flex-col overflow-hidden h-[calc(100vh-220px)] min-h-[500px]">
        {/* Terminal Header */}
        <div className="bg-surface-container-lowest/5 border-b border-white/10 p-3 flex justify-between items-center">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-error"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffb020]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28CA41]"></div>
          </div>
          <span className="font-mono-base text-xs text-outline">apkman-engine.log</span>
        </div>
        
        {/* Terminal Output */}
        <div className="flex-1 overflow-y-auto p-5 font-mono-base text-[13px] leading-relaxed text-[#A8B1C2] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_100%)]">
          <table className="w-full border-collapse">
            <tbody>
              {mockLogs.map((log, i) => {
                const isCritical = log.includes("[CRITICAL]");
                const isHigh = log.includes("[HIGH]");
                const isWarn = log.includes("[WARN]");
                
                let rowStyle = "";
                let textStyle = "text-[#A8B1C2]";
                
                if (isCritical) {
                  rowStyle = "bg-error/10";
                  textStyle = "text-error font-bold";
                } else if (isHigh) {
                  rowStyle = "bg-[#ffb020]/10";
                  textStyle = "text-[#ffb020] font-bold";
                } else if (isWarn) {
                  textStyle = "text-[#ffb020]";
                }

                return (
                  <tr key={i} className={`hover:bg-white/5 transition-colors ${rowStyle}`}>
                    <td className="w-12 text-right pr-4 text-outline/50 select-none border-r border-white/5 py-1">{i + 1}</td>
                    <td className={`pl-4 whitespace-pre-wrap py-1 ${textStyle}`}>
                      {log}
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td className="w-12 text-right pr-4 text-outline/50 select-none border-r border-white/5 py-1">{mockLogs.length + 1}</td>
                <td className="pl-4 py-1 text-primary-fixed animate-pulse">_</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
