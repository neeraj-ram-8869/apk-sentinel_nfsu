import React from "react";
import AnimatedCount from "./AnimatedCount";

export interface LedgerItem {
  id: string;
  pkg: string;
  time: string;
  score: number;
  tier: string;
  critCount: number;
  fileSize?: number;
}

export function DashboardView({ ledger, onNavigate }: { ledger: LedgerItem[]; onNavigate: () => void }) {
  const totalScans = ledger.length;
  const malCount   = ledger.filter(l => l.tier === "MALICIOUS" || l.tier === "FRAUDULENT").length;
  const avgScore   = ledger.length ? Math.round(ledger.reduce((s, l) => s + l.score, 0) / ledger.length) : 0;
  const cleanCount = ledger.filter(l => l.tier === "BENIGN").length;

  return (
    <div className="flex flex-col gap-xl">
      {/* Header Section */}
      <div className="flex justify-between items-end border-b border-outline-variant pb-md pt-lg md:pt-xl">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Dashboard</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">System overview and master analysis ledger.</p>
        </div>
        <div className="hidden md:block">
          <button onClick={onNavigate} className="bg-primary text-on-primary font-label-mono text-label-mono px-lg py-sm rounded hover:bg-primary-container transition-colors flex items-center gap-sm">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
            Scan New APK
          </button>
        </div>
      </div>

      {/* Summary Metrics (Bento Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-lg">
            <span className="font-label-mono text-label-mono text-on-surface-variant uppercase">Total Scans</span>
            <span className="material-symbols-outlined text-outline">query_stats</span>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg"><AnimatedCount value={totalScans} /></div>
            <div className="font-code-sm text-code-sm text-outline mt-xs flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "14px" }}>trending_up</span>
              Session Total
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-error rounded p-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-error-container/20 to-transparent pointer-events-none"></div>
          <div className="flex justify-between items-start mb-lg relative z-10">
            <span className="font-label-mono text-label-mono text-error uppercase">Threats Found</span>
            <span className="material-symbols-outlined text-error">bug_report</span>
          </div>
          <div className="relative z-10">
            <div className="font-headline-lg text-headline-lg text-error"><AnimatedCount value={malCount} /></div>
            <div className="font-code-sm text-code-sm text-outline mt-xs">Requires immediate attention</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded p-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-lg">
            <span className="font-label-mono text-label-mono text-on-surface-variant uppercase">Average Risk</span>
            <span className="material-symbols-outlined text-outline">speed</span>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg"><AnimatedCount value={avgScore} /><span className="text-headline-sm text-outline">/100</span></div>
            <div className="font-code-sm text-code-sm text-outline mt-xs">Stable index</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded p-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-lg">
            <span className="font-label-mono text-label-mono text-on-surface-variant uppercase">Clean APKs</span>
            <span className="material-symbols-outlined text-outline">verified_user</span>
          </div>
          <div>
            <div className="font-headline-lg text-headline-lg"><AnimatedCount value={cleanCount} /></div>
            <div className="font-code-sm text-code-sm text-outline mt-xs">Passing rate</div>
          </div>
        </div>
      </div>

      {/* Master Scan Ledger */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col flex-1">
        <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-bright/50">
          <h3 className="font-headline-sm text-headline-sm">Master Scan Ledger</h3>
          <div className="flex gap-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: "16px" }}>search</span>
              <input className="pl-[28px] pr-sm py-[4px] border border-outline-variant rounded font-code-sm text-code-sm bg-transparent focus:border-primary focus:ring-0 focus:outline-none w-48 text-on-surface placeholder:text-outline transition-colors" placeholder="Filter SHA-256..." type="text" />
            </div>
            <button className="border border-outline-variant rounded px-sm py-[4px] font-label-mono text-label-mono hover:bg-surface-container transition-colors flex items-center gap-xs">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>filter_list</span>
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {ledger.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-xl opacity-50">
               <span className="material-symbols-outlined" style={{ fontSize: "48px" }}>science</span>
               <div className="mt-sm font-code-sm">No APKs analyzed yet.</div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low/50">
                  <th className="px-lg py-md font-label-mono text-label-mono text-on-surface-variant font-medium">Package Name</th>
                  <th className="px-lg py-md font-label-mono text-label-mono text-on-surface-variant font-medium">Time Scanned</th>
                  <th className="px-lg py-md font-label-mono text-label-mono text-on-surface-variant font-medium">Status</th>
                  <th className="px-lg py-md font-label-mono text-label-mono text-on-surface-variant font-medium text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="font-code-sm text-code-sm">
                {ledger.map((item, i) => {
                  const isBad = item.tier === "MALICIOUS" || item.tier === "FRAUDULENT";
                  const isSuspicious = item.tier === "SUSPICIOUS";
                  
                  return (
                    <tr key={`${item.time}-${i}`} className="border-b border-outline-variant table-row-hover cursor-pointer transition-colors">
                      <td className="px-lg py-md">
                        <div className="font-medium text-on-surface">{item.pkg}</div>
                        <div className="text-outline text-[10px] mt-xs">{item.id}</div>
                      </td>
                      <td className="px-lg py-md text-outline font-mono">{item.time}</td>
                      <td className="px-lg py-md">
                        {isBad ? (
                          <span className="inline-flex items-center gap-xs px-sm py-[2px] bg-[#FEF2F2] text-[#B91C1C] border border-[#B91C1C] rounded-sm font-label-mono text-[11px]">
                            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>warning</span>
                            High Risk
                          </span>
                        ) : isSuspicious ? (
                          <span className="inline-flex items-center gap-xs px-sm py-[2px] bg-[#FFFBEB] text-[#B45309] border border-[#B45309] rounded-sm font-label-mono text-[11px]">
                            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>privacy_tip</span>
                            Suspicious
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-xs px-sm py-[2px] bg-[#ECFDF5] text-[#047857] border border-[#047857] rounded-sm font-label-mono text-[11px]">
                            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>check_circle</span>
                            Clean
                          </span>
                        )}
                      </td>
                      <td className={`px-lg py-md text-right font-mono ${isBad ? 'text-error font-bold' : isSuspicious ? 'text-[#B45309] font-medium' : ''}`}>
                        {item.score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
