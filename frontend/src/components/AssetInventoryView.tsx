import React, { useState } from "react";

export function AssetInventoryView({ analysisResult }: { analysisResult: any | null }) {
  const [tab, setTab] = useState<"strings" | "classes" | "urls" | "ips">("strings");
  
  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-50">
        <span className="material-symbols-outlined mb-sm" style={{ fontSize: "48px" }}>inventory_2</span>
        <p className="font-code-sm text-code-sm">Upload an APK to browse extracted assets.</p>
      </div>
    );
  }

  const tabData: Record<string, string[]> = {
    strings: analysisResult.allStrings.slice(0, 200),
    classes: analysisResult.classNames.slice(0, 200),
    urls:    analysisResult.analysis.urls,
    ips:     analysisResult.analysis.ips,
  };
  
  const tabLabels = [
    { id: "strings", label: `Strings (${analysisResult.allStrings.length})`, icon: "match_word" },
    { id: "classes", label: `Classes (${analysisResult.classNames.length})`, icon: "data_object" },
    { id: "urls",    label: `URLs (${analysisResult.analysis.urls.length})`, icon: "link" },
    { id: "ips",     label: `IPs (${analysisResult.analysis.ips.length})`, icon: "dns" },
  ];

  return (
    <div className="flex flex-col gap-xl h-full pb-xl">
      <div className="flex justify-between items-end border-b border-outline-variant pb-md pt-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Asset Inventory</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Extracted DEX strings, class names, and network indicators from apkman parser.</p>
        </div>
        <div className="hidden md:flex items-center gap-sm border border-outline-variant text-on-surface-variant px-sm py-[4px] rounded font-label-mono text-label-mono">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>storage</span>
          apkman extraction
        </div>
      </div>

      <div className="flex gap-sm border-b border-outline-variant overflow-x-auto hide-scrollbar pb-[1px]">
        {tabLabels.map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-xs px-md py-sm font-label-mono text-label-mono whitespace-nowrap transition-colors border-b-2 ${
              tab === t.id 
                ? "border-primary text-primary" 
                : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col flex-1 min-h-[400px]">
        <div className="px-md py-sm border-b border-outline-variant bg-surface-bright/50 flex items-center gap-sm">
          <div className="flex gap-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#28CA41]"></div>
          </div>
          <span className="font-label-mono text-[11px] text-outline ml-sm">apkman_parser — {tab}.log</span>
        </div>
        
        <div className="p-lg flex-1 overflow-y-auto bg-[#F6F8FA] font-code-sm text-code-sm leading-relaxed">
          {tabData[tab].length === 0 ? (
            <div className="text-outline italic">No {tab} found in this APK.</div>
          ) : (
            tabData[tab].map((item, i) => {
              const colorClass = tab === "urls" ? "text-[#0ea5e9]" : tab === "ips" ? "text-[#d9981b]" : "text-[#3c4453]";
              return (
                <div key={`${tab}-${i}`} className="flex gap-md py-[2px] hover:bg-[#F1F5F9] rounded px-sm transition-colors">
                  <span className="text-outline select-none w-8 text-right shrink-0">{String(i + 1).padStart(4, "0")}</span>
                  <span className={`${colorClass} break-all`}>{item}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
