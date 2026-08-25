"use client";

// ===================================================================
// UploadZone — drag & drop APK upload matching v3.0 redesign
// ===================================================================

import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  isAnalyzing: boolean;
  fileName?: string | null;
  fileSize?: number | null;
  /** Collapse the 300px dropzone into a slim file bar so the analysis stays in view. */
  compact?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function UploadZone({ onFileSelected, isAnalyzing, fileName, fileSize, compact = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".apk")) return;
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (isAnalyzing) return;
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile, isAnalyzing]
  );

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept=".apk"
      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      style={{ display: "none" }}
    />
  );

  // Compact bar: shown once a file is loaded, so the progress log and the
  // threat report stay above the fold instead of being pushed off-screen.
  if (compact) {
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); if (!isAnalyzing) setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={onDrop}
        onClick={() => !isAnalyzing && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`border rounded-lg px-lg py-md flex items-center gap-md transition-interactive ${
          isAnalyzing ? "cursor-default border-primary/40 bg-primary/5" : "cursor-pointer border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low"
        } ${isDragging ? "border-primary bg-primary/5" : ""}`}
      >
        {fileInput}

        <span
          className={`material-symbols-outlined text-[22px] text-primary ${isAnalyzing ? "animate-pulse" : ""}`}
          style={{ fontVariationSettings: isAnalyzing ? "'FILL' 1" : undefined }}
        >
          {isAnalyzing ? "sync" : "android"}
        </span>

        <div className="flex-1" style={{ minWidth: 0 }}>
          <div className="font-label-mono text-on-surface truncate" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
            {fileName ?? "APK"}
          </div>
          <div className="font-mono-base text-on-surface-variant" style={{ fontSize: "0.68rem" }}>
            {fileSize ? formatBytes(fileSize) : ""}
            {isAnalyzing ? " · static reverse-engineering pipeline running…" : " · click or drop another APK to re-analyze"}
          </div>
        </div>

        {isAnalyzing && (
          <span className="font-label-mono text-primary" style={{ fontSize: "0.7rem", letterSpacing: "0.08em" }}>
            ANALYZING
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!isAnalyzing) setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={onDrop}
      onClick={() => !isAnalyzing && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      className={`scan-area ${isAnalyzing ? "is-analyzing cursor-default" : ""} border-2 border-dashed rounded-lg p-xl flex flex-col items-center justify-center min-h-[300px] transition-interactive cursor-pointer group ${
        isDragging 
          ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(83,0,183,0.1)]" 
          : "border-outline-variant/50 bg-surface-container-lowest/50 hover:bg-surface-container-low"
      }`}
    >
      {fileInput}

      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-md transition-interactive ${
        isAnalyzing ? "bg-primary/20" : "bg-primary/10 group-hover:scale-110"
      }`}>
        {isAnalyzing ? (
          <span className="material-symbols-outlined text-[48px] text-primary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
            sync
          </span>
        ) : (
          <span className={`material-symbols-outlined text-[48px] transition-interactive ${isDragging ? "text-primary scale-110" : "text-primary/70 group-hover:text-primary"}`}>
            upload_file
          </span>
        )}
      </div>

      <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
        {isAnalyzing ? `Analyzing ${fileName ?? "APK"}...` : fileName ? fileName : "Drag & Drop APK File"}
      </h3>
      
      <p className="font-mono-base text-mono-base text-on-surface-variant mb-lg text-center max-w-md">
        {isAnalyzing 
          ? "Static reverse-engineering pipeline running..."
          : fileSize 
            ? `${formatBytes(fileSize)} · click to re-analyze a different file`
            : "Supported formats: .apk, .xapk, .apks\nMaximum file size: 500MB"}
      </p>

      {!isAnalyzing && !fileName && (
        <button className="bg-surface-container-lowest border border-outline-variant/50 text-primary font-label-caps text-label-caps px-xl py-md rounded-lg hover:bg-primary/5 hover:-translate-y-px transition-interactive flex items-center shadow-sm pointer-events-none">
          <span className="material-symbols-outlined mr-sm text-[18px]">folder_open</span>
          Browse Files
        </button>
      )}

      <div className="mt-xl pt-md border-t border-outline-variant/30 w-full max-w-md flex justify-between items-center text-on-surface-variant font-mono-base text-[11px]">
        <span className="flex items-center"><span className="material-symbols-outlined text-[14px] mr-xs text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Auto-Decompilation</span>
        <span className="flex items-center"><span className="material-symbols-outlined text-[14px] mr-xs text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> YARA Rule Matching</span>
        <span className="flex items-center"><span className="material-symbols-outlined text-[14px] mr-xs text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Malware Heuristics</span>
      </div>
    </div>
  );
}
