"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Cpu,
  RefreshCw,
  Sun,
  Moon,
} from "lucide-react";
import { HealthResponse } from "@/types";

interface HeaderProps {
  health: HealthResponse | null;
  onReset: () => void;
  onOpenSchedule: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  onReset,
  onOpenSchedule,
}) => {
  const isDemoMode = health?.demo_mode_active ?? true;

  const providerLabel = health?.has_api_key
    ? `LLM Engine: ${health.ai_provider.toUpperCase()}`
    : "Zero-Touch Demo Engine";

  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("autopm-theme");

    if (savedTheme === "light") {
      setLightMode(true);
      document.documentElement.classList.add("autopm-light");
    }
  }, []);

  const toggleTheme = () => {
    const next = !lightMode;

    setLightMode(next);

    if (next) {
      document.documentElement.classList.add("autopm-light");
      localStorage.setItem("autopm-theme", "light");
    } else {
      document.documentElement.classList.remove("autopm-light");
      localStorage.setItem("autopm-theme", "dark");
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${
        lightMode
          ? "border-slate-200 bg-white/85"
          : "border-white/10 bg-slate-950/70"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">

          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-cyan-500/20">
            <div
              className={`w-full h-full rounded-[11px] flex items-center justify-center ${
                lightMode ? "bg-white" : "bg-slate-950"
              }`}
            >
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">

              <h1
                className={`text-xl font-bold tracking-tight flex items-center gap-1.5 ${
                  lightMode ? "text-slate-900" : "text-white"
                }`}
              >
                Auto<span className="text-cyan-500">PM</span>
              </h1>

              <span className="px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 rounded-full">
                MVP
              </span>

            </div>

            <p
              className={`text-xs hidden sm:block ${
                lightMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              The Zero-Touch Weekly Status Reporter · Everyday Automation
            </p>
          </div>

        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Automation */}
          <button
            onClick={onOpenSchedule}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg transition text-xs font-medium ${
              lightMode
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15"
            }`}
            title="Click to view automated recurring schedule"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Fri 4:00 PM (Active)</span>
          </button>

          {/* Engine */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
              lightMode
                ? "bg-slate-100 border-slate-200 text-slate-700"
                : "bg-slate-900 border-slate-800 text-slate-300"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden sm:inline">
              {providerLabel}
            </span>
            <span className="sm:hidden">
              {isDemoMode ? "Demo" : "AI"}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`relative p-2 rounded-lg border transition-all duration-300 ${
              lightMode
                ? "bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100"
                : "bg-slate-900 border-slate-800 text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/10"
            }`}
            title={
              lightMode
                ? "Switch to dark mode"
                : "Switch to light mode"
            }
          >
            {lightMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className={`p-2 rounded-lg border transition ${
              lightMode
                ? "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
            title="Reset activity to fresh state"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
