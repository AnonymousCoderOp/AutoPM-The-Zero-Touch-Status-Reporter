"use client";

import React, { useState } from "react";
import {
  FileText,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Mail,
  Copy,
  Check,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import { ReportResponse } from "@/types";

interface AiReportViewProps {
  report: ReportResponse | null;
  onOpenEmail: () => void;
  onSendEmailDemo: () => void;
}

export const AiReportView: React.FC<AiReportViewProps> = ({
  report,
  onOpenEmail,
  onSendEmailDemo,
}) => {
  const [copied, setCopied] = useState(false);
  const [reportTab, setReportTab] = useState<"overview" | "blockers" | "email">("overview");

  if (!report) {
    return (
      <div className="glass-card rounded-2xl border border-white/10 p-10 flex flex-col items-center justify-center text-center h-[500px] space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 animate-pulse">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-base font-bold text-white">No Report Generated Yet</h3>
          <p className="text-xs text-slate-400">
            Generate a report above to automatically transform engineering activity
            into an executive-ready status report.
          </p>
        </div>
      </div>
    );
  }

  const handleCopyMarkdown = () => {
    const md = `# ${report.project_name} – Weekly Status Report
**Period**: ${report.week_range}
**Project Health**: ${report.project_health}% (${report.health_verdict})

## Executive Progress Summary
${report.executive_summary.progress}

### Key Achievements
${report.executive_summary.achievements.map((a) => `- ${a}`).join("\n")}

## Critical Blockers
${report.blockers.map((b) => `- [${b.severity.toUpperCase()}] ${b.issue} (Source: ${b.source})`).join("\n")}

## Evaluated Risks
${report.risks.map((r) => `- [${r.severity.toUpperCase()}] ${r.description} (Impact: ${r.potential_impact})`).join("\n")}

## Planned Next Steps
${report.executive_summary.next_steps.map((n) => `- ${n}`).join("\n")}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highBlockersCount = report.blockers.filter((b) => b.severity === "high").length;
  const highRisksCount = report.risks.filter((r) => r.severity === "high").length;

  return (
    <div className="glass-card rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden">
      {/* Header with Navigation */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  AI Project Status Report
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Zero-Touch
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Engine: {report.provider_used} · Generated {report.generated_at}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Copy complete report as Markdown"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-white/5">
          <button
            onClick={() => setReportTab("overview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              reportTab === "overview"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Overview</span>
          </button>
          <button
            onClick={() => setReportTab("blockers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              reportTab === "blockers"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>
              Blockers & Risks ({report.blockers.length + report.risks.length})
            </span>
          </button>
          <button
            onClick={() => setReportTab("email")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              reportTab === "email"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>Stakeholder Email</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[620px]">
        {reportTab === "overview" && (
          <div className="space-y-6">
            {/* Health Banner */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Health Verdict
                </span>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{report.health_verdict}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Score: {report.project_health}/100
                  </span>
                </h4>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div className="text-xs text-slate-400">
                  <p className="text-rose-400 font-semibold">{highBlockersCount} High Blockers</p>
                  <p className="text-amber-400">{highRisksCount} Active Risk</p>
                </div>
              </div>
            </div>

            {/* Executive Narrative */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Executive Progress Summary</span>
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-white/5">
                {report.executive_summary.progress}
              </p>
            </div>

            {/* Key Achievements */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Key Deliverables & Achievements</span>
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {report.executive_summary.achievements.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs sm:text-sm text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                <span>Prioritized Next Steps</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {report.executive_summary.next_steps.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs sm:text-sm text-slate-300"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {reportTab === "blockers" && (
          <div className="space-y-6">
            {/* Blockers Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Detected Technical Blockers ({report.blockers.length})</span>
                </h4>
                <span className="text-[11px] text-slate-500">Requires Immediate Resolution</span>
              </div>
              <div className="space-y-2.5">
                {report.blockers.map((blocker, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          blocker.severity === "high"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {blocker.severity} Severity
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Source: {blocker.source}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-100">
                      {blocker.issue}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Predictive Risk Assessment ({report.risks.length})</span>
                </h4>
                <span className="text-[11px] text-slate-500">Evidence-Backed Predictions</span>
              </div>
              <div className="space-y-2.5">
                {report.risks.map((risk, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {risk.severity} Impact
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Confidence: {risk.confidence.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-100">
                      {risk.description}
                    </p>
                    <div className="text-xs text-amber-200/80 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      <span className="font-semibold text-amber-300">Downstream Impact: </span>
                      {risk.potential_impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {reportTab === "email" && (
          <div className="space-y-4">
            {/* Email Header Preview */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-400 pb-3 border-b border-white/5">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-slate-300 flex-shrink-0">To:</span>
                  <span className="font-mono text-cyan-300 text-right break-words">
                    {report.automation_schedule?.target_recipients?.length
                      ? report.automation_schedule.target_recipients.join(", ")
                      : "No recipients configured · Manual delivery"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-slate-300 flex-shrink-0">Subject:</span>
                  <span className="font-semibold text-white text-right sm:text-left">
                    {report.email.subject}
                  </span>
                </div>
              </div>

              {/* Email Body */}
              <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed bg-slate-950 p-4 rounded-lg border border-white/5 max-h-[350px] overflow-y-auto">
                {report.email.body}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Subject: ${report.email.subject}\n\n${report.email.body}`
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  {copied ? "Copied to Clipboard!" : "Copy Email Text"}
                </button>

                <button
                  onClick={onOpenEmail}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <Mail className="w-3.5 h-3.5 fill-current" />
                  <span>Preview Email</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
