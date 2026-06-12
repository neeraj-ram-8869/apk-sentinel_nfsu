import React, { useRef, useEffect } from "react";

export function AiNarrativeView({ narrative, loading, chatHistory, chatInput, setChatInput, onChatSubmit, chatLoading, hasResult }: any) {
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatHistory]);

  return (
    <div className="flex flex-col gap-xl h-full pb-xl">
      <div className="flex justify-between items-end border-b border-outline-variant pb-md pt-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">AI Threat Report</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">NVIDIA NIM Llama-3.1-70B generative threat narrative & interactive Q&A.</p>
        </div>
        <div className="hidden md:flex items-center gap-sm bg-primary-container text-on-primary-fixed-variant px-sm py-[4px] rounded font-label-mono text-label-mono">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>smart_toy</span>
          AI-Powered
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter flex-1 min-h-[500px]">
        {/* Narrative Panel */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant bg-surface-bright/50 flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">article</span>
            <h3 className="font-headline-sm text-headline-sm">Generated Threat Narrative</h3>
            {loading && (
              <span className="ml-auto flex items-center gap-xs font-code-sm text-code-sm text-primary">
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: "14px" }}>autorenew</span>
                Generating...
              </span>
            )}
          </div>
          <div className="p-lg flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col gap-md animate-pulse">
                {[0.9, 0.75, 0.85, 0.6].map((w, i) => (
                  <div key={i} className="h-4 bg-surface-variant rounded" style={{ width: `${w * 100}%` }} />
                ))}
              </div>
            ) : narrative ? (
              <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed">{narrative}</p>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <span className="material-symbols-outlined mb-sm" style={{ fontSize: "48px" }}>psychology_alt</span>
                <p className="font-code-sm text-code-sm">Upload an APK to generate a threat narrative.</p>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Chat Panel */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant bg-surface-bright/50 flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">chat</span>
            <h3 className="font-headline-sm text-headline-sm">Ask the AI Analyst</h3>
          </div>
          
          <div ref={chatRef} className="flex-1 p-lg overflow-y-auto flex flex-col gap-md">
            {chatHistory.length === 0 && (
              <div className="flex flex-col gap-sm text-on-surface-variant font-code-sm text-code-sm">
                <p>Suggested questions about the analyzed APK:</p>
                {["Why is this rated malicious?", "Explain the SMS permission risk", "What is DexClassLoader?"].map(q => (
                  <button key={q} className="text-left text-primary hover:underline hover:bg-surface-container py-[2px] px-sm rounded transition-colors" onClick={() => { if (hasResult) { onChatSubmit(q); } }}>
                    → {q}
                  </button>
                ))}
              </div>
            )}
            
            {chatHistory.map((msg: any, i: number) => (
              <div key={`chat-${i}`} className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "self-end items-end" : "self-start items-start"}`}>
                <div className={`p-sm rounded-lg font-body-md text-body-md ${
                  msg.role === "user" 
                    ? "bg-primary text-on-primary rounded-tr-none" 
                    : "bg-surface-variant text-on-surface-variant rounded-tl-none border border-outline-variant"
                }`}>
                  {msg.text}
                </div>
                <span className="font-label-mono text-[10px] text-outline mt-xs">
                  {msg.role === "user" ? "You" : "NIM AI"}
                </span>
              </div>
            ))}
            
            {chatLoading && (
              <div className="self-start flex items-center gap-xs text-primary font-code-sm text-code-sm">
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: "14px" }}>autorenew</span>
                NIM is thinking...
              </div>
            )}
          </div>

          <div className="p-md border-t border-outline-variant bg-surface-bright/50">
            <div className="flex gap-sm">
              <input
                type="text"
                className="flex-1 border border-outline-variant rounded px-md py-sm font-body-md text-body-md bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface placeholder:text-outline"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && onChatSubmit()}
                placeholder={hasResult ? "Ask about this APK..." : "Upload an APK first..."}
                disabled={!hasResult || chatLoading}
              />
              <button 
                className="bg-primary text-on-primary px-lg py-sm rounded font-label-mono text-label-mono hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={onChatSubmit} 
                disabled={!hasResult || chatLoading || !chatInput.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
