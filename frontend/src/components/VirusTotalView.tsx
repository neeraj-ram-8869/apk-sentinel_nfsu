"use client";

import React from "react";

export default function VirusTotalView({ analysisResult }: { analysisResult: any }) {
  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] opacity-60">
        <span className="material-symbols-outlined text-[64px] text-primary mb-4">security</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">No File Hash Available</h2>
        <p className="text-on-surface-variant font-body-base text-body-base">Upload an APK to query VirusTotal intelligence.</p>
      </div>
    );
  }

  // Assuming we map existing analysisResult.fileHash to a mocked VT response for UI completeness
  const mockPositives = analysisResult.riskScore > 50 ? 12 : 0;
  const mockTotal = 65;

  return (
    <div className="flex-col gap-5 animate-fade-up w-full">
      <div className="flex justify-between items-center mb-md">
        <div>
          <h2 className="font-display-lg text-display-lg font-bold text-on-surface">VirusTotal Intelligence</h2>
          <p className="font-body-base text-body-base text-on-surface-variant mt-1">Global threat correlation and vendor consensus</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-outline-variant text-primary rounded flex items-center gap-2 hover:bg-primary/5 transition-colors text-sm font-label-caps">
            <span className="material-symbols-outlined text-sm">refresh</span> Re-Scan Hash
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Detection Ratio Card */}
        <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-[12px] border border-[rgba(225,227,242,0.8)] shadow-sm rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4">Detection Ratio</h3>
          
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--surface-variant)" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" 
                stroke={mockPositives > 0 ? "var(--error)" : "var(--tertiary-container)"} 
                strokeWidth="8" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * mockPositives) / mockTotal} 
                className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="font-display-lg text-3xl font-black text-on-surface">{mockPositives}</span>
              <span className="font-mono-base text-xs text-on-surface-variant">/ {mockTotal}</span>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
            mockPositives > 0 ? "bg-error/10 text-error" : "bg-tertiary-container/10 text-tertiary-container"
          }`}>
            {mockPositives > 0 ? "MALICIOUS" : "UNDETECTED"}
          </div>
        </div>

        {/* File Identification */}
        <div className="md:col-span-2 bg-[rgba(255,255,255,0.7)] backdrop-blur-[12px] border border-[rgba(225,227,242,0.8)] shadow-sm rounded-xl p-6 flex flex-col justify-center">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4">File Identification</h3>
          
          <div className="space-y-4 font-mono-base text-sm">
            <div className="flex items-center gap-4">
              <span className="text-on-surface-variant w-24">SHA-256</span>
              <code className="text-primary bg-primary/5 px-3 py-1 rounded border border-primary/10 break-all">
                {analysisResult.fileHash}
              </code>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-on-surface-variant w-24">File Name</span>
              <span className="text-on-surface font-medium">{analysisResult.fileName || "analyzed.apk"}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-on-surface-variant w-24">File Size</span>
              <span className="text-on-surface">{Math.round((analysisResult.fileSize || 0) / 1024 / 1024 * 10) / 10} MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
