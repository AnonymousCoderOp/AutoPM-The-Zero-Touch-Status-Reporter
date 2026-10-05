"use client";

import React from "react";
import { Sparkles, Bot, Clock, ShieldCheck, RefreshCw, Cpu } from "lucide-react";
import { HealthResponse } from "@/types";

interface HeaderProps {
  health: HealthResponse | null;
  onReset: () => void;
  onOpenSchedule: () => void;
}

export const Header: React.FC<HeaderProps> = ({ health, onReset, onOpenSchedule }) => {
  const isDemoMode = health?.demo_mode_active ?? true;
  const providerLabel = health?.has_api_key
    ? `LLM Engine: ${health.ai_provider.toUpperCase()}`
    : "Zero-Touch Demo Engine";

  return (
    <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Auto<span className="text-cyan-400">PM</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-full">
                MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              The Zero-Touch Weekly Status Reporter · Everyday Automation
            </p>
          </div>
        </div>

        {/* Status Indicators & Actions */}
        <div className="flex items-center gap-3">
          {/* Automation Active Pill */}
          <button
            onClick={onOpenSchedule}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15 transition text-xs font-medium"
            title="Click to view automated recurring schedule"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Fri 4:00 PM (Active)</span>
          </button>

          {/* Engine Mode Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{providerLabel}</span>
            <span className="sm:hidden">{isDemoMode ? "Demo Mode" : "AI"}</span>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
            title="Reset activity to fresh state"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
