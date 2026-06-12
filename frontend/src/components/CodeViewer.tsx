"use client";
// ===================================================================
// Session 6 — CodeViewer Component
// Displays DEX class names and suspicious API strings with filtering.
// ===================================================================
import { useState } from "react";

interface CodeViewerProps {
  classNames?: string[];
  suspiciousStrings?: string[];
  urls?: string[];
  ips?: string[];
  apis?: Array<{ name: string; category: string; danger: "low" | "medium" | "high"; details?: string }>;
}

type Tab = "classes" | "strings" | "network" | "apis";

const DANGER_COLOR = {
  high:   "var(--accent-red)",
  medium: "var(--accent-yellow)",
  low:    "var(--accent-green)",
};

export default function CodeViewer({
  classNames = [],
  suspiciousStrings = [],
  urls = [],
  ips = [],
  apis = [],
}: CodeViewerProps) {
  const [tab, setTab] = useState<Tab>("classes");
  const [search, setSearch] = useState("");

  const TABS: Array<{ id: Tab; label: string; count: number }> = [
    { id: "classes",  label: "Classes",     count: classNames.length },
    { id: "strings",  label: "Suspicious",  count: suspiciousStrings.length },
    { id: "network",  label: "Network",     count: urls.length + ips.length },
    { id: "apis",     label: "APIs",        count: apis.length },
  ];

  const filter = (items: string[]) =>
    search ? items.filter((s) => s.toLowerCase().includes(search.toLowerCase())) : items;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--border-subtle)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: tab === t.id ? "rgba(99,102,241,0.08)" : "transparent",
              color: tab === t.id ? "var(--accent-purple)" : "var(--text-secondary)",
              border: "none",
              borderBottom: `2px solid ${tab === t.id ? "var(--accent-purple)" : "transparent"}`,
              padding: "6px 12px", cursor: "pointer",
              fontSize: "0.75rem", fontWeight: 700,
              borderRadius: "4px 4px 0 0",
              display: "flex", alignItems: "center", gap: "5px",
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                background: tab === t.id ? "rgba(99,102,241,0.15)" : "var(--bg-elevated)",
                color: tab === t.id ? "var(--accent-purple)" : "var(--text-muted)",
                borderRadius: "3px", padding: "0 5px", fontSize: "0.62rem", fontWeight: 800,
              }}>
                {t.count > 999 ? "999+" : t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      {(tab === "classes" || tab === "strings") && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${tab}…`}
          style={{
            background: "#f8fafc", border: "1px solid var(--border-subtle)",
            borderRadius: "4px", padding: "7px 12px",
            fontSize: "0.78rem", color: "var(--text-primary)", outline: "none",
            fontFamily: "var(--font-mono)",
          }}
        />
      )}

      {/* Content */}
      <div style={{
        background: "#F6F8FA", borderRadius: "6px", padding: "14px",
        maxHeight: "300px", overflowY: "auto",
        fontFamily: "var(--font-mono)", fontSize: "0.72rem", lineHeight: 1.7,
      }}>
        {tab === "classes" && (
          filter(classNames).length > 0 ? filter(classNames).map((cls, i) => {
            const isDangerous = /AccessibilityService|DexClassLoader|Runtime|SmsManager|Crypto/.test(cls);
            return (
              <div key={`class-${cls}-${i}`} style={{ color: isDangerous ? "#B9770E" : "#5B6472", marginBottom: "1px" }}>
                <span style={{ color: "#A1A8B3" }}>L</span>
                {cls.replace(/\./g, "/")}
                <span style={{ color: "#A1A8B3" }}>;</span>
                {isDangerous && <span style={{ color: "#D14343", marginLeft: "8px" }}>⚠</span>}
              </div>
            );
          }) : <div style={{ color: "#A1A8B3" }}>No class names extracted.</div>
        )}

        {tab === "strings" && (
          filter(suspiciousStrings).length > 0 ? filter(suspiciousStrings).map((s, i) => (
            <div key={`str-${i}`} style={{ color: "#B9770E", marginBottom: "2px" }}>
              <span style={{ color: "#A1A8B3" }}>&quot;</span>{s}<span style={{ color: "#A1A8B3" }}>&quot;</span>
            </div>
          )) : <div style={{ color: "#A1A8B3" }}>No suspicious strings flagged.</div>
        )}

        {tab === "network" && (
          urls.length + ips.length > 0 ? (
            <>
              {urls.map((url, i) => (
                <div key={`url-${i}`} style={{ color: "#D14343", marginBottom: "2px" }}>
                  <span style={{ color: "#0E9CA8" }}>URL: </span>{url}
                </div>
              ))}
              {ips.map((ip, i) => (
                <div key={`ip-${i}`} style={{ color: "#C8631E", marginBottom: "2px" }}>
                  <span style={{ color: "#0E9CA8" }}>IP:  </span>{ip}
                </div>
              ))}
            </>
          ) : <div style={{ color: "#A1A8B3" }}>No network indicators found.</div>
        )}

        {tab === "apis" && (
          apis && apis.length > 0 ? apis.map((api, i) => (
            <div key={`api-${i}`} style={{ marginBottom: "6px" }}>
              <span style={{ color: DANGER_COLOR[api.danger] }}>{api.name}</span>
              <span style={{ color: "#9AA1AC", marginLeft: "8px" }}>{`// ${api.category}`}</span>
              {api.details && <div style={{ color: "#A1A8B3", marginLeft: "12px", fontSize: "0.68rem" }}>{api.details}</div>}
            </div>
          )) : <div style={{ color: "#A1A8B3" }}>No suspicious API patterns detected.</div>
        )}
      </div>
    </div>
  );
}
