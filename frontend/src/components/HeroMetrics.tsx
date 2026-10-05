"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  Zap,
  Clock,
  CalendarCheck,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ShieldAlert,
  GitPullRequest,
  Workflow,
  CircleAlert,
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
  const isGitHubRepository = analysisMode === "github";

  const dashboardTitle = isGitHubRepository
    ? `${projectName} – Repository Status Dashboard`
    : `${projectName} – Q4 Status Dashboard`;

  const blockerCount = report?.blockers.length ?? 0;

  const weekRange =
    report?.week_range || "Week 40 · Oct 01 - Oct 07, 2026";

  const [showScoreDetails, setShowScoreDetails] = useState(false);

  /*
   * Delivery signals
   *
   * Demo mode:
   *   blockers + risks
   *
   * GitHub mode:
   *   blockers + risks + problematic PRs + failed workflows
   */
  const deliverySignalCount = useMemo(() => {
    if (!report) return 3;

    if (!isGitHubRepository) {
      return Math.max(
        report.blockers.length + report.risks.length,
        1
      );
    }

    const activity = report.activity_data;
    const prs = activity?.github_prs ?? [];

    const repositoryContext = activity?.repository_context as
      | {
          workflows?: {
            total_count?: number;
            workflow_runs?: Array<{
              id?: number;
              name?: string;
              status?: string;
              conclusion?: string | null;
              branch?: string;
              created_at?: string;
              updated_at?: string;
              html_url?: string;
            }>;
          };
          workflow_runs?: Array<{
            id?: number;
            name?: string;
            status?: string;
            conclusion?: string | null;
            branch?: string;
            created_at?: string;
            updated_at?: string;
            html_url?: string;
          }>;
        }
      | undefined;

    const workflows =
      repositoryContext?.workflows?.workflow_runs ??
      repositoryContext?.workflow_runs ??
      [];

    const problematicPrs = prs.filter(
      (pr) =>
        pr.status === "changes_requested" ||
        pr.status === "failing_ci"
    ).length;

    const failedWorkflows = workflows.filter(
      (workflow) => workflow.conclusion === "failure"
    ).length;

    return Math.max(
      report.blockers.length +
        report.risks.length +
        problematicPrs +
        failedWorkflows,
      1
    );
  }, [report, isGitHubRepository]);

  /*
   * Score explanation
   *
   * This deliberately reads the same real GitHub activity
   * returned by the backend.
   */
  const scoreFactors = useMemo(() => {
    const blockers = report?.blockers ?? [];
    const risks = report?.risks ?? [];
    const activity = report?.activity_data;

    const prs = activity?.github_prs ?? [];

    const repositoryContext = activity?.repository_context as
      | {
          workflows?: {
            total_count?: number;
            workflow_runs?: Array<{
              id?: number;
              name?: string;
              status?: string;
              conclusion?: string | null;
              branch?: string;
              created_at?: string;
              updated_at?: string;
              html_url?: string;
            }>;
          };
          workflow_runs?: Array<{
            id?: number;
            name?: string;
            status?: string;
            conclusion?: string | null;
            branch?: string;
            created_at?: string;
            updated_at?: string;
            html_url?: string;
          }>;
        }
      | undefined;

    const workflows =
      repositoryContext?.workflows?.workflow_runs ??
      repositoryContext?.workflow_runs ??
      [];

    const openPrs = prs.filter(
      (pr) => pr.status === "open"
    ).length;

    const changedPrs = prs.filter(
      (pr) => pr.status === "changes_requested"
    ).length;

    const failingPrs = prs.filter(
      (pr) => pr.status === "failing_ci"
    ).length;

    const failedWorkflows = workflows.filter(
      (workflow) => workflow.conclusion === "failure"
    ).length;

    const successfulWorkflows = workflows.filter(
      (workflow) => workflow.conclusion === "success"
    ).length;

    const highBlockers = blockers.filter(
      (blocker) => blocker.severity === "high"
    ).length;

    const highRisks = risks.filter(
      (risk) => risk.severity === "high"
    ).length;

    return {
      openPrs,
      changedPrs,
      failingPrs,
      failedWorkflows,
      successfulWorkflows,
      highBlockers,
      highRisks,
    };
  }, [report]);

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
                  : "autopm-primary-button text-white hover:scale-[1.02] active:scale-[0.98]"
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
        <div
          onClick={() => setShowScoreDetails((value) => !value)}
          className="glass-card rounded-xl p-5 border border-white/5 space-y-3 relative overflow-hidden group hover:border-indigo-500/30 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Project Health
            </span>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${healthColor}`}
              >
                {report ? report.health_verdict : "Evaluated"}
              </span>

              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  showScoreDetails ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {healthScore}%
            </span>

            <div className="flex items-center text-xs text-amber-400 font-medium gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />

              <span>
                {isGitHubRepository
                  ? `${deliverySignalCount} ${
                      deliverySignalCount === 1
                        ? "Delivery Signal"
                        : "Delivery Signals"
                    }`
                  : `${blockerCount} ${
                      blockerCount === 1 ? "Blocker" : "Blockers"
                    } Active`}
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

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {showScoreDetails
                ? "Score breakdown"
                : "Click to see why"}
            </span>

            <span className="text-indigo-400 font-medium">
              {showScoreDetails ? "Hide details" : "Why this score?"}
            </span>
          </div>

          {showScoreDetails && (
            <div className="pt-3 mt-2 border-t border-white/10 space-y-2.5">
              {/* Blockers */}
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />

                <div>
                  <p className="text-xs font-semibold text-white">
                    {scoreFactors.highBlockers} high-severity blocker
                    {scoreFactors.highBlockers === 1 ? "" : "s"}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Unresolved blockers reduce delivery confidence.
                  </p>
                </div>
              </div>

              {isGitHubRepository ? (
                <>
                  {/* Pull Requests */}
                  <div className="flex items-start gap-2.5">
                    <GitPullRequest className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />

                    <div>
                      <p className="text-xs font-semibold text-white">
                        {scoreFactors.openPrs} open PR
                        {scoreFactors.openPrs === 1 ? "" : "s"}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {scoreFactors.changedPrs} requested changes ·{" "}
                        {scoreFactors.failingPrs} failing CI
                      </p>
                    </div>
                  </div>

                  {/* GitHub Workflows */}
                  <div className="flex items-start gap-2.5">
                    <Workflow className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />

                    <div>
                      <p className="text-xs font-semibold text-white">
                        {scoreFactors.failedWorkflows} failed workflow
                        {scoreFactors.failedWorkflows === 1 ? "" : "s"}
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {scoreFactors.successfulWorkflows} successful workflow
                        {scoreFactors.successfulWorkflows === 1
                          ? ""
                          : "s"}{" "}
                        balance the signal.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                /* Demo Mode */
                <div className="flex items-start gap-2.5">
                  <CircleAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />

                  <div>
                    <p className="text-xs font-semibold text-white">
                      {blockerCount} active delivery signal
                      {blockerCount === 1 ? "" : "s"}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Blockers and risks detected across team activity.
                    </p>
                  </div>
                </div>
              )}

              {/* Risks */}
              <div className="flex items-start gap-2.5">
                <Activity className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />

                <div>
                  <p className="text-xs font-semibold text-white">
                    {scoreFactors.highRisks} high-severity risk
                    {scoreFactors.highRisks === 1 ? "" : "s"}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Risk signals influence the final delivery confidence.
                  </p>
                </div>
              </div>

              {/* AutoPM Assessment */}
              <div className="pt-2">
                <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-2.5">
                  <p className="text-[11px] text-indigo-300 leading-relaxed">
                    <strong className="text-indigo-200">
                      AutoPM assessment:
                    </strong>{" "}
                    {healthScore >= 85
                      ? "Delivery signals are strong and the project is on a healthy trajectory."
                      : healthScore >= 70
                        ? "Delivery is progressing, but active blockers and risk signals should be monitored."
                        : healthScore >= 50
                          ? "The project has meaningful delivery risk and needs intervention on the highlighted blockers."
                          : "Multiple critical delivery signals indicate that immediate intervention is required."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Metric 2: Time Saved */}
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

            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                isGitHubRepository
                  ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                  : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              }`}
            >
              {isGitHubRepository ? "On Demand" : "Active 🟢"}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              {isGitHubRepository
                ? "Manual Analysis"
                : "Every Friday"}
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
