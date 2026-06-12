"use client";

import React, { useRef, useEffect } from "react";

export default function AiNarrativeView({
  narrative, loading, chatHistory, chatInput, setChatInput, onChatSubmit, chatLoading, hasResult
}: any) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  if (!hasResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] opacity-60">
        <span className="material-symbols-outlined text-[64px] text-primary mb-4">psychology</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">No Threat Data</h2>
        <p className="text-on-surface-variant font-body-base text-body-base">Scan an APK to generate an AI threat report.</p>
      </div>
    );
  }

  return (
    <div className="flex-col gap-5 animate-fade-up w-full h-[calc(100vh-140px)] flex">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="font-display-lg text-display-lg font-bold text-on-surface">AI Threat Intelligence</h2>
          <p className="font-body-base text-body-base text-on-surface-variant mt-1">LLM-powered threat correlation and conversational agent</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
          <span className="material-symbols-outlined text-primary text-[16px]">auto_awesome</span>
          <span className="text-sm font-medium text-primary tracking-wide">GEMINI PRO</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg flex-1 min-h-0">
        
        {/* Left: Summary Report */}
        <div className="md:col-span-5 bg-[rgba(255,255,255,0.7)] backdrop-blur-[12px] border border-[rgba(225,227,242,0.8)] shadow-sm rounded-xl p-6 flex flex-col overflow-y-auto">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">summarize</span> Executive Summary
          </h3>
          {loading ? (
            <div className="flex flex-col gap-3">
              <div className="h-4 bg-outline-variant/30 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-outline-variant/30 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-outline-variant/30 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-outline-variant/30 rounded animate-pulse w-4/5 mt-4"></div>
              <div className="h-4 bg-outline-variant/30 rounded animate-pulse w-full"></div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed">
              {narrative || "No narrative generated yet. Re-scan the APK to trigger generation."}
            </div>
          )}
        </div>

        {/* Right: Conversational Chat */}
        <div className="md:col-span-7 bg-[rgba(255,255,255,0.7)] backdrop-blur-[12px] border border-[rgba(225,227,242,0.8)] shadow-sm rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest/50">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">forum</span> Investigative Chat
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-low/30">
            {chatHistory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-on-surface-variant/50 italic text-sm">
                Ask questions about the decompiled source code or threat behavior...
              </div>
            ) : (
              chatHistory.map((msg: any, idx: number) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center ${
                    msg.role === "user" ? "bg-tertiary-container text-white" : "bg-primary text-white"
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {msg.role === "user" ? "person" : "robot_2"}
                    </span>
                  </div>
                  <div className={`p-3 rounded-2xl ${
                    msg.role === "user" 
                      ? "bg-tertiary-container/10 text-on-surface rounded-tr-none" 
                      : "bg-surface-container-lowest border border-outline-variant text-on-surface rounded-tl-none shadow-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">robot_2</span>
                </div>
                <div className="p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant rounded-tl-none flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={onChatSubmit} className="p-3 bg-surface-container-lowest/80 border-t border-outline-variant/30 flex gap-2">
            <input 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask the AI about specific findings..."
              className="flex-1 bg-surface-container-low border border-outline-variant rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-on-surface"
              disabled={chatLoading}
            />
            <button 
              type="submit" 
              disabled={chatLoading || !chatInput.trim()}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
