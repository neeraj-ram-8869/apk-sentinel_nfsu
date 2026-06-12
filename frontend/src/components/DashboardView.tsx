"use client";

import React from "react";

export default function DashboardView({ ledger, onNavigate }: { ledger: any[], onNavigate: () => void }) {
  const threatsFound = ledger.reduce((acc, l) => acc + (l.result?.analysis?.findings?.filter((f: any) => f.severity === "CRITICAL" || f.severity === "HIGH")?.length || 0), 0);
  const avgRisk = ledger.length > 0 ? Math.round(ledger.reduce((acc, l) => acc + (l.result?.riskScore || 0), 0) / ledger.length) : 0;
  const cleanApks = ledger.filter(l => l.result?.riskScore < 30).length;

  return (
    <div className="flex-1 w-full animate-fade-up">
      {/* Header */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-display-lg text-display-lg font-bold text-on-surface">Dashboard</h2>
        </div>
        <div className="flex items-center gap-2 bg-tertiary-container/10 px-3 py-1.5 rounded-full border border-tertiary-container/20">
          <div className="w-2.5 h-2.5 rounded-full bg-tertiary-container animate-pulse"></div>
          <span className="text-sm font-medium text-tertiary-container">Engine Online</span>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col relative overflow-hidden group hover:border-primary transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full opacity-50 group-hover:scale-110 transition-transform blur-xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-on-surface-variant font-medium text-sm">Total Scans</h3>
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-lg">microbiology</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-on-surface relative z-10">{ledger.length}</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col relative overflow-hidden group hover:border-error transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-error/10 rounded-full opacity-50 group-hover:scale-110 transition-transform blur-xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-on-surface-variant font-medium text-sm">Threats Found</h3>
            <div className="w-8 h-8 rounded-lg bg-error/5 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-lg">bug_report</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-on-surface relative z-10">{threatsFound}</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col relative overflow-hidden group hover:border-[#ffb020] transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ffb020]/10 rounded-full opacity-50 group-hover:scale-110 transition-transform blur-xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-on-surface-variant font-medium text-sm">Average Risk</h3>
            <div className="w-8 h-8 rounded-lg bg-[#ffb020]/5 flex items-center justify-center text-[#ffb020]">
              <span className="material-symbols-outlined text-lg">warning</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-4xl font-bold text-on-surface">{avgRisk}</span>
            <span className="text-sm font-medium text-on-surface-variant">/100</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col relative overflow-hidden group hover:border-tertiary-container transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-container/10 rounded-full opacity-50 group-hover:scale-110 transition-transform blur-xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-on-surface-variant font-medium text-sm">Clean APKs</h3>
            <div className="w-8 h-8 rounded-lg bg-tertiary-container/5 flex items-center justify-center text-tertiary-container">
              <span className="material-symbols-outlined text-lg">verified</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-on-surface relative z-10">{cleanApks}</div>
        </div>
      </section>

      {/* Master Scan Ledger */}
      <section className="animate-fade-up">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-on-surface">Master Scan Ledger</h3>
            <p className="text-sm text-on-surface-variant mt-1">All APKs analyzed in this session</p>
          </div>
          <button 
            onClick={onNavigate}
            className="bg-primary hover:bg-primary/90 text-on-primary px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 overflow-hidden relative"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Scan
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[scanSweep_3s_infinite_linear]"></div>
          </button>
        </div>

        {ledger.length === 0 ? (
          <div className="bg-surface-container-lowest/50 backdrop-blur-md border border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-2xl mb-4 shadow-inner text-primary">
              <span className="material-symbols-outlined text-[32px]">science</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">No APKs analyzed yet.</h4>
            <p className="text-on-surface-variant max-w-sm font-body-base text-body-base">
              Upload your first APK to begin threat analysis, code forensics, and dynamic behavior monitoring.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ledger.map((entry, idx) => (
              <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex justify-between items-center hover:border-primary transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    entry.result?.riskTier === "CRITICAL" ? "bg-error/10 text-error" :
                    entry.result?.riskTier === "HIGH" ? "bg-[#ffb020]/10 text-[#ffb020]" :
                    "bg-tertiary-container/10 text-tertiary-container"
                  }`}>
                    <span className="material-symbols-outlined">
                      {entry.result?.riskTier === "CRITICAL" ? "dangerous" : entry.result?.riskTier === "HIGH" ? "warning" : "verified"}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-body-bold text-on-surface">{entry.file.name}</h4>
                    <p className="text-on-surface-variant text-sm mt-1">
                      {new Date(entry.timestamp).toLocaleTimeString()} • {Math.round(entry.file.size / 1024 / 1024 * 10) / 10} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <p className="text-on-surface-variant text-xs mb-1 uppercase tracking-wider font-bold">Risk Score</p>
                    <p className="font-mono-stat text-xl font-black text-on-surface">{entry.result?.riskScore}/100</p>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
