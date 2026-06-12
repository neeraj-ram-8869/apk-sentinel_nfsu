"use client";

import React from "react";

export default function SettingsView() {
  return (
    <div className="flex-col gap-5 animate-fade-up w-full max-w-4xl">
      <div className="flex justify-between items-center mb-md">
        <div>
          <h2 className="font-display-lg text-display-lg font-bold text-on-surface">Platform Settings</h2>
          <p className="font-body-base text-body-base text-on-surface-variant mt-1">Configure integrations, API keys, and system preferences</p>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps text-sm hover:bg-primary/90 transition-colors shadow-sm">
          Save Changes
        </button>
      </div>

      <div className="bg-[rgba(255,255,255,0.7)] backdrop-blur-[12px] border border-[rgba(225,227,242,0.8)] shadow-sm rounded-xl p-lg flex flex-col gap-8">
        
        {/* API Keys */}
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">key</span> External Integrations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant">
              <label className="font-label-caps text-xs text-on-surface-variant block mb-2">VirusTotal API Key</label>
              <input 
                type="password" 
                defaultValue="••••••••••••••••••••••••••••" 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-sm font-mono-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant">
              <label className="font-label-caps text-xs text-on-surface-variant block mb-2">Gemini Pro API Key</label>
              <input 
                type="password" 
                defaultValue="AIzaSyA•••••••••••••••••••••" 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-sm font-mono-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/50" />

        {/* Engine Config */}
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">memory</span> Static Analysis Engine
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-5 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <div className="font-body-bold text-on-surface">Deep Decompilation</div>
                <div className="text-sm text-on-surface-variant">Extract and format all Smali to Java where possible</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-5 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <div className="font-body-bold text-on-surface">Auto-Submit Unknown Hashes</div>
                <div className="text-sm text-on-surface-variant">Automatically upload undetected APKs to VirusTotal sandbox</div>
              </div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
