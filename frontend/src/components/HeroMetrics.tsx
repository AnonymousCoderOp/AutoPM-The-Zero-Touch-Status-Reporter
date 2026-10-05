"use client";

import React from "react";
import {
  Activity,
  Zap,
  Clock,
  CalendarCheck,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { ReportResponse } from "@/types";

interface HeroMetricsProps {
  report: ReportResponse | null;
  isGenerating: boolean;
  analysisMode: "demo" | "github";
  onGenerate: () => void;
  onOpenRoiModal: () => void;
  onOpenScheduleModal: () => void;
}

export const HeroMetrics: React.FC<HeroMetricsProps> = ({
  report,
  isGenerating,
  analysisMode,
  onGenerate,
  onOpenRoiModal,
  onOpenScheduleModal,
}) => {
  const healthScore = report ? report.project_health : 78;

  const isHealthy = healthScore >= 85;
  const isModerate = healthScore >= 70 && healthScore < 85;

  const healthColor = isHealthy
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : isModerate
    ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-rose-400 bg-rose-500/10 border-rose-500/20";

  const projectName = report?.project_name || "Project Nova";

  /*
   * The page already knows whether the user selected Demo Mode
   * or GitHub Repository mode.
   *
   * Using analysisMode here is more reliable than trying to infer
   * the mode from nested API response data.
   */
  const isGitHubRepository = analysisMode === "github";

  const dashboardTitle = isGitHubRepository
    ? `${projectName} – Repository Status Dashboard`
    : `${projectName} – Q4 Status Dashboard`;

  const blockerCount = report?.blockers.length ?? 3;

  const weekRange =
    report?.week_range ||
    "Week 40 · Oct 01 - Oct 07, 2026";

  return (
    <div className="space-y-6">
      {/* Top Banner Hero */}
      <div className="relative overflow-hidden rounded-2xl glass-card border border-white/10 p-6 sm:p-8 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/90">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />

              <span>
                {isGitHubRepository
                  ? "GitHub Intelligence · Real Repository"
                  : "Everyday Automation · Zero-Touch Mode"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white break-words">
              {dashboardTitle}
            </h2>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              {isGitHubRepository
                ? "AutoPM analyzes real GitHub commits, pull requests, issues, and workflow activity to generate an executive-ready project status report, blocker map, and stakeholder insights."
                : "AutoPM synthesizes chaotic team Slack messages, PR reviews, and commit histories into an executive-ready status report, blocker map, and stakeholder email in seconds."}
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 min-w-[240px]">
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className={`relative group px-6 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xl ${
                isGenerating
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Report...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />

                  <span>
                    {isGitHubRepository
                      ? "Re-analyze Repository"
                      : "Generate Weekly Report"}
                  </span>

                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <span className="text-[11px] text-slate-500 text-center lg:text-right">
              {report
                ? "Report up-to-date · Click to re-run"
                : isGitHubRepository
                ? "Ready to analyze repository"
                : "Ready to process Week 40 updates"}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Project Health */}
        <div className="glass-card rounded-xl p-5 border border-white/5 space-y-3 relative overflow-hidden group hover:border-white/10 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Project Health
            </span>

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${healthColor}`}
            >
              {report ? report.health_verdict : "Evaluated"}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {healthScore}%
            </span>

            <div className="flex items-center text-xs text-amber-400 font-medium gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />

              <span>
                {blockerCount}{" "}
                {blockerCount === 1 ? "Blocker" : "Blockers"} Active
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isHealthy
                  ? "bg-emerald-500"
                  : isModerate
                  ? "bg-gradient-to-r from-amber-500 to-emerald-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Hours Saved This Week */}
        <div
          onClick={onOpenRoiModal}
          className="glass-card rounded-xl p-5 border border-white/5 space-y-3 relative overflow-hidden cursor-pointer group hover:border-cyan-500/30 transition hover:bg-slate-900/80"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Time Saved
            </span>

            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition">
              View ROI Details ↗
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              6.5
            </span>

            <span className="text-sm font-medium text-slate-400">
              hours saved / week
            </span>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />

            <span>
              Manual: 100 min → AutoPM: 1.8 sec
            </span>
          </p>
        </div>

        {/* Metric 3: Report Status */}
        <div className="glass-card rounded-xl p-5 border border-white/5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Report Status
            </span>

            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                report
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />

              <span>
                {report ? "Report Ready" : "Standby"}
              </span>
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {report ? "Generated" : "Ready"}
            </span>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />

            <span>{weekRange}</span>
          </p>
        </div>

        {/* Metric 4: Automation Schedule */}
        <div
          onClick={onOpenScheduleModal}
          className="glass-card rounded-xl p-5 border border-white/5 space-y-3 relative overflow-hidden cursor-pointer group hover:border-emerald-500/30 transition hover:bg-slate-900/80"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Automation Schedule
            </span>

            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
              isGitHubRepository
                ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
            }`}>
              {isGitHubRepository ? "On Demand" : "Active 🟢"}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              {isGitHubRepository ? "Manual Analysis" : "Every Friday"}
            </span>

            {!isGitHubRepository && (
              <span className="text-xs text-slate-400 font-medium">
                @ 4:00 PM
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />

            <span>
              {isGitHubRepository
                ? "Run analysis whenever repository status is needed"
                : "Zero-touch delivery to 3 leads"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};