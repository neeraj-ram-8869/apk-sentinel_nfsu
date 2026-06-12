"use client";

import React from "react";

export default function PolicyEngineView({ policyWeights, setPolicyWeights }: { policyWeights: any, setPolicyWeights: any }) {
  const updateWeight = (key: string, value: string) => {
    setPolicyWeights((prev: any) => ({ ...prev, [key]: Number(value) }));
  };

  return (
    <div className="flex-col gap-5 animate-fade-up w-full">
      <div className="flex justify-between items-center mb-md">
        <div>
          <h2 className="font-display-lg text-display-lg font-bold text-on-surface">Policy Engine Tuning</h2>
          <p className="font-body-base text-body-base text-on-surface-variant mt-1">Adjust heuristic weights to control the Risk Score algorithm</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">save</span> Apply Policy
          </button>
        </div>
      </div>

      <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-[12px] border border-[rgba(225,227,242,0.8)] shadow-sm rounded-xl p-lg">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">tune</span> Risk Score Modifiers
        </h3>
        
        <div className="space-y-8 max-w-3xl">
          {[
            { key: "crypto", label: "Cryptographic Violations", desc: "Hardcoded keys, weak IVs, broken algorithms", color: "error" },
            { key: "network", label: "Suspicious Network Calls", desc: "Cleartext HTTP, known malicious domains", color: "warning" },
            { key: "permissions", label: "Dangerous Permissions", desc: "SMS, Camera, Contacts requested without justification", color: "primary" },
          ].map(setting => {
            const val = policyWeights[setting.key] || 0;
            const barWidth = (val / 50) * 100;
            
            return (
              <div key={setting.key} className="flex flex-col gap-3">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="font-body-bold text-on-surface">{setting.label}</h4>
                    <p className="font-body-base text-sm text-on-surface-variant mt-1">{setting.desc}</p>
                  </div>
                  <div className="font-mono-stat text-2xl font-black text-on-surface">{val}</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="font-mono-base text-xs text-outline">0</span>
                  <div className="relative flex-1 h-8 flex items-center">
                    {/* Visual Bar Background */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-3 bg-surface-container-high rounded-full overflow-hidden pointer-events-none">
                      <div 
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${barWidth}%`,
                          backgroundColor: setting.color === "error" ? "var(--error)" : setting.color === "warning" ? "var(--accent-orange)" : "var(--primary)"
                        }}
                      />
                    </div>
                    {/* Interactive Input */}
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={val}
                      onChange={(e) => updateWeight(setting.key, e.target.value)}
                      className="w-full opacity-0 cursor-pointer relative z-10 h-full m-0"
                    />
                  </div>
                  <span className="font-mono-base text-xs text-outline">50</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
