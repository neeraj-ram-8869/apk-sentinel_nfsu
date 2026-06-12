"use client";

import React, { useState } from "react";

export default function CodeForensicsView({ analysisResult }: { analysisResult: any }) {
  const [selectedScope, setSelectedScope] = useState<string | null>(null);

  const findings = analysisResult?.analysis?.findings?.filter((f: any) => f.severity === "CRITICAL" || f.severity === "HIGH") ?? [];

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] opacity-60">
        <span className="material-symbols-outlined text-[64px] text-primary mb-4">terminal</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">No APK Loaded</h2>
        <p className="text-on-surface-variant font-body-base text-body-base">Upload an APK in the Scanner to see decompiled code forensics.</p>
      </div>
    );
  }

  // Extract unique file scopes from findings
  const uniqueScopes = Array.from(new Set(findings.map((f: any) => {
    // If scope is like "Lcom/example/App;->method()V", extract "com/example/App.smali"
    let scopeStr = f.scope || "UnknownScope";
    if (scopeStr.startsWith("L")) {
      scopeStr = scopeStr.substring(1);
    }
    const classPart = scopeStr.split(";")[0];
    return classPart ? `${classPart}.smali` : "AndroidManifest.xml";
  }))).filter(Boolean) as string[];

  // If no findings, mock some files just to show the UI
  if (uniqueScopes.length === 0) {
    uniqueScopes.push("com/example/MainActivity.smali", "AndroidManifest.xml");
  }

  const activeScope = selectedScope || uniqueScopes[0];

  // Filter findings for the right pane based on selected scope
  const activeFindings = findings.filter((f: any) => {
    let scopeStr = f.scope || "";
    if (scopeStr.startsWith("L")) scopeStr = scopeStr.substring(1);
    const classPart = scopeStr.split(";")[0];
    return activeScope.includes(classPart);
  });

  return (
    <div className="flex flex-col gap-5 w-full h-full min-h-[800px]">
      {/* Page Header */}
      <div className="mb-md flex justify-between items-end shrink-0">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Target: <span className="font-mono-base text-primary">{analysisResult.fileName || "analyzed.apk"}</span></h2>
          <p className="font-body-base text-body-base text-on-surface-variant mt-1">Inspecting decompiled sources (Smali / Java)</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-outline-variant text-primary rounded flex items-center gap-2 hover:bg-primary/5 transition-colors text-sm font-label-caps">
            <span className="material-symbols-outlined text-sm">download</span> Export
          </button>
        </div>
      </div>

      {/* Three Pane Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg flex-1 min-h-[600px] pb-8">
        
        {/* Left Pane: File Explorer */}
        <div className="md:col-span-3 bg-[rgba(255,255,255,0.7)] backdrop-blur-[12px] border border-[rgba(225,227,242,0.8)] shadow-sm rounded-xl flex flex-col overflow-hidden max-h-[800px]">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low/50 flex justify-between items-center shrink-0">
            <span className="font-label-caps text-label-caps text-on-surface-variant">File Structure</span>
            <span className="material-symbols-outlined text-outline text-sm cursor-pointer hover:text-primary">unfold_more</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 font-mono-base text-mono-base text-sm custom-scrollbar">
            <ul className="space-y-1">
              {uniqueScopes.map((scope, idx) => {
                const isSelected = activeScope === scope;
                const isXml = scope.endsWith(".xml");
                return (
                  <li key={idx}>
                    <div 
                      onClick={() => setSelectedScope(scope)}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-primary/10 text-primary font-bold border-l-2 border-primary" 
                          : "hover:bg-primary/5 text-on-surface-variant border-l-2 border-transparent"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-sm ${isSelected ? "text-primary" : "text-outline"}`}>
                        {isXml ? "code" : "description"}
                      </span>
                      <span className="truncate" title={scope}>{scope.split("/").pop()}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Middle Pane: Code Viewer */}
        <div className="md:col-span-6 bg-[rgba(255,255,255,0.7)] backdrop-blur-[12px] border border-[rgba(225,227,242,0.8)] shadow-sm rounded-xl p-1 flex flex-col max-h-[800px]">
          <div className="bg-[#0A0A14] border border-[rgba(255,255,255,0.05)] rounded-lg flex-1 flex flex-col overflow-hidden relative group">
            {/* Terminal Header */}
            <div className="bg-surface-container-lowest/5 border-b border-white/10 p-3 flex justify-between items-center text-xs font-mono-base text-outline shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>/{activeScope}</span>
              </div>
              <span>Read Only</span>
            </div>
            
            {/* Code Content */}
            <div className="flex-1 overflow-y-auto p-4 font-mono-base text-[13px] leading-relaxed text-[#A8B1C2] relative custom-scrollbar">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="w-8 text-right pr-4 text-outline select-none border-r border-white/5 py-0.5">1</td>
                    <td className="pl-4 whitespace-pre py-0.5"><span className="text-[#7b7486] italic"># Decompiled source for {activeScope}</span></td>
                  </tr>
                  <tr>
                    <td className="w-8 text-right pr-4 text-outline select-none border-r border-white/5 py-0.5">2</td>
                    <td className="pl-4 whitespace-pre py-0.5"><span className="text-[#d3bbff]">.class public</span> L{activeScope.replace(".smali", "")};</td>
                  </tr>
                  <tr>
                    <td className="w-8 text-right pr-4 text-outline select-none border-r border-white/5 py-0.5">3</td>
                    <td className="pl-4 whitespace-pre py-0.5"><span className="text-[#d3bbff]">.super</span> Ljava/lang/Object;</td>
                  </tr>
                  <tr>
                    <td className="w-8 text-right pr-4 text-outline select-none border-r border-white/5 py-0.5">4</td>
                    <td className="pl-4 whitespace-pre py-0.5"></td>
                  </tr>
                  
                  {activeFindings.map((finding: any, idx: number) => (
                    <React.Fragment key={idx}>
                      <tr>
                        <td className="w-8 text-right pr-4 text-outline select-none border-r border-white/5 py-0.5">{5 + idx*4}</td>
                        <td className="pl-4 whitespace-pre py-0.5">    <span className="text-[#d3bbff]">.method public</span> suspiciousMethod()V</td>
                      </tr>
                      <tr className={finding.severity === "CRITICAL" ? "bg-error/10" : "bg-[#ffb020]/10"}>
                        <td className={`w-8 text-right pr-4 select-none border-r py-0.5 font-bold ${finding.severity === "CRITICAL" ? "text-error border-error/50" : "text-[#ffb020] border-[#ffb020]/50"}`}>
                          {6 + idx*4}
                        </td>
                        <td className="pl-4 whitespace-pre py-0.5">
                          <span className="text-[#7b7486] italic">        # {finding.severity} RISK: {finding.title}</span>
                        </td>
                      </tr>
                      <tr className={finding.severity === "CRITICAL" ? "bg-error/10" : "bg-[#ffb020]/10"}>
                        <td className={`w-8 text-right pr-4 select-none border-r py-0.5 font-bold ${finding.severity === "CRITICAL" ? "text-error border-error/50" : "text-[#ffb020] border-[#ffb020]/50"}`}>
                          {7 + idx*4}
                        </td>
                        <td className="pl-4 whitespace-pre py-0.5">
                                  <span className="text-[#d3bbff]">invoke-virtual</span> {`{v0}, ${finding.scope}`}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-8 text-right pr-4 text-outline select-none border-r border-white/5 py-0.5">{8 + idx*4}</td>
                        <td className="pl-4 whitespace-pre py-0.5">    <span className="text-[#d3bbff]">.end method</span></td>
                      </tr>
                    </React.Fragment>
                  ))}
                  
                  <tr>
                    <td className="w-8 text-right pr-4 text-outline select-none border-r border-white/5 py-0.5">99</td>
                    <td className="pl-4 whitespace-pre py-0.5"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Pane: Analysis Tools */}
        <div className="md:col-span-3 flex flex-col gap-md max-h-[800px]">
          <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-[12px] border border-[rgba(225,227,242,0.8)] shadow-sm rounded-xl p-4 flex-1 flex flex-col overflow-hidden">
            <span className="font-label-caps text-label-caps text-on-surface-variant mb-4 shrink-0">Findings in {activeScope.split("/").pop()}</span>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {activeFindings.length > 0 ? (
                activeFindings.map((finding: any, idx: number) => (
                  <div key={idx} className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    finding.severity === "CRITICAL" ? "bg-error/10 border-error/20 hover:bg-error/20" : "bg-[#ffb020]/10 border-[#ffb020]/20 hover:bg-[#ffb020]/20"
                  }`}>
                    <div className={`flex items-center gap-2 mb-1 ${finding.severity === "CRITICAL" ? "text-error" : "text-[#b27b16]"}`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {finding.severity === "CRITICAL" ? "dangerous" : "warning"}
                      </span>
                      <span className="font-body-bold text-sm">{finding.title}</span>
                    </div>
                    <p className="font-mono-base text-xs text-on-surface-variant line-clamp-3">
                      {finding.description || "Detected potentially dangerous code pattern."}
                    </p>
                    <p className="font-mono-base text-[10px] text-outline mt-2 break-all">
                      {finding.scope}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-sm text-outline italic p-4 text-center border border-dashed border-outline-variant rounded-lg">
                  No explicit findings detected in this specific file scope.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
