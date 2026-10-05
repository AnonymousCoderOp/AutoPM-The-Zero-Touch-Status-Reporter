"use client";

import React, { useMemo, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  X,
  ShieldAlert,
  GitPullRequest,
  Target,
  Activity,
} from "lucide-react";

import { ReportResponse } from "@/types";

interface AskAutoPMProps {
  report: ReportResponse | null;
  analysisMode: "demo" | "github";
  isOpen: boolean;
  onClose: () => void;
}

function generateAnswer(
  question: string,
  report: ReportResponse,
  analysisMode: "demo" | "github"
): string {
  const q = question.toLowerCase();

  const health = report.project_health;
  const blockers = report.blockers || [];
  const risks = report.risks || [];
  const achievements = report.executive_summary?.achievements || [];
  const nextSteps = report.executive_summary?.next_steps || [];

  const activity = report.activity_data;

  const prs = activity?.github_prs || [];
  const workflows =
    (activity?.repository_context as any)?.workflows?.workflow_runs ||
    (activity?.repository_context as any)?.workflow_runs ||
    [];

  const openPRs = prs.filter((pr) => pr.status === "open").length;
  const changedPRs = prs.filter(
    (pr) => pr.status === "changes_requested"
  ).length;
  const failingPRs = prs.filter(
    (pr) => pr.status === "failing_ci"
  ).length;

  const failedWorkflows = workflows.filter(
    (run: any) => run.conclusion === "failure"
  ).length;

  const successfulWorkflows = workflows.filter(
    (run: any) => run.conclusion === "success"
  ).length;

  const highBlockers = blockers.filter(
    (item) => item.severity === "high"
  );

  const highRisks = risks.filter(
    (item) => item.severity === "high"
  );

  const projectName =
    report.project_name || "the project";

  if (
    q.includes("why") &&
    (q.includes("health") ||
      q.includes("score") ||
      q.includes("rating"))
  ) {
    return `AutoPM currently rates ${projectName} at ${health}/100.

The main factors influencing that assessment are:

${highBlockers.length > 0
  ? `• ${highBlockers.length} high-severity blocker${highBlockers.length > 1 ? "s" : ""} requiring intervention.`
  : "• No high-severity blockers were detected."}

${highRisks.length > 0
  ? `• ${highRisks.length} high-severity risk${highRisks.length > 1 ? "s" : ""} affecting delivery confidence.`
  : "• No high-severity risks were detected."}

${openPRs > 0
  ? `• ${openPRs} open pull request${openPRs > 1 ? "s" : ""} contributing to delivery activity.`
  : "• No open pull requests were detected."}

${changedPRs > 0
  ? `• ${changedPRs} PR${changedPRs > 1 ? "s have" : " has"} requested changes.`
  : "• No PR review-change friction was detected."}

${failedWorkflows > 0
  ? `• ${failedWorkflows} failed CI workflow${failedWorkflows > 1 ? "s" : ""}.`
  : successfulWorkflows > 0
    ? `• CI is currently showing ${successfulWorkflows} successful workflow run${successfulWorkflows > 1 ? "s" : ""}.`
    : "• No recent workflow failures were detected."}

Overall, the score reflects delivery confidence rather than simply counting activity. AutoPM recommends resolving the highest-severity blocker first, then addressing the risks and work items that can delay dependent teams.`;
  }

  if (
    q.includes("block") ||
    q.includes("blocking") ||
    q.includes("stuck") ||
    q.includes("blocked")
  ) {
    if (blockers.length === 0) {
      return `AutoPM did not identify any explicit blockers in the current ${analysisMode === "github" ? "repository analysis" : "project data"}.

The project may still have risks, but there is no blocker currently classified as preventing delivery.`;
    }

    return `AutoPM identified ${blockers.length} blocker${blockers.length > 1 ? "s" : ""}:

${blockers
  .map(
    (blocker, index) =>
      `${index + 1}. [${blocker.severity.toUpperCase()}] ${blocker.issue}
   Source: ${blocker.source}`
  )
  .join("\n\n")}

Priority: resolve the highest-severity blocker first because it has the greatest potential to affect the delivery timeline.`;
  }

  if (
    q.includes("risk") ||
    q.includes("danger") ||
    q.includes("concern")
  ) {
    if (risks.length === 0) {
      return "AutoPM did not detect any explicit delivery risks in the current report.";
    }

    return `AutoPM detected ${risks.length} delivery risk${risks.length > 1 ? "s" : ""}:

${risks
  .map(
    (risk, index) =>
      `${index + 1}. [${risk.severity.toUpperCase()}] ${risk.description}
   Confidence: ${risk.confidence}
   Potential impact: ${risk.potential_impact}`
  )
  .join("\n\n")}

The highest-severity risks should be reviewed before the next delivery milestone.`;
  }

  if (
    q.includes("priorit") ||
    q.includes("next") ||
    q.includes("what should") ||
    q.includes("focus")
  ) {
    const steps = nextSteps.slice(0, 4);

    return `If I were acting as the project manager, I would prioritize the following:

${steps.length
  ? steps
      .map((step, index) => `${index + 1}. ${step}`)
      .join("\n\n")
  : "1. Resolve the highest-severity blocker.\n\n2. Review high-confidence risks.\n\n3. Unblock dependent pull requests.\n\n4. Verify CI stability before the next release milestone."}

The guiding principle is simple: **remove the work that can block other work first, then optimize everything else.**`;
  }

  if (
    q.includes("pr") ||
    q.includes("pull request") ||
    q.includes("review")
  ) {
    return `Current pull-request picture:

• ${prs.length} recent PRs analyzed
• ${openPRs} currently open
• ${changedPRs} with requested changes
• ${failingPRs} associated with failing CI

${changedPRs > 0
  ? "The biggest PR-related concern is review friction. PRs with requested changes should be prioritized when downstream work depends on them."
  : openPRs > 0
    ? "There are active PRs in the repository, but no explicit review-change bottleneck was detected."
    : "There is currently little open PR activity requiring intervention."}`;
  }

  if (
    q.includes("ci") ||
    q.includes("workflow") ||
    q.includes("build") ||
    q.includes("github action")
  ) {
    return `CI / workflow status:

• ${workflows.length} workflow runs analyzed
• ${successfulWorkflows} successful
• ${failedWorkflows} failed

${failedWorkflows > 0
  ? `AutoPM recommends investigating the ${failedWorkflows} failed workflow${failedWorkflows > 1 ? "s" : ""} before treating the repository as release-ready.`
  : successfulWorkflows > 0
    ? "The available workflow evidence is currently healthy. The main delivery concerns appear to be outside CI."
    : "There is not enough recent workflow data to make a strong CI-health conclusion."}`;
  }

  if (
    q.includes("achievement") ||
    q.includes("done") ||
    q.includes("progress")
  ) {
    if (!achievements.length) {
      return "The current report does not contain enough achievement data to summarize completed work.";
    }

    return `This is what AutoPM considers the strongest completed progress:

${achievements
  .slice(0, 5)
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n\n")}`;
  }

  if (
    q.includes("leadership") ||
    q.includes("executive") ||
    q.includes("manager") ||
    q.includes("summarize") ||
    q.includes("summary")
  ) {
    return `Executive summary:

${report.executive_summary.progress}

Health: ${health}/100 — ${report.health_verdict}

Key blockers: ${blockers.length}
Key risks: ${risks.length}

Recommended focus:
${nextSteps
  .slice(0, 3)
  .map((step, index) => `${index + 1}. ${step}`)
  .join("\n")}

Bottom line: the team has measurable progress, but leadership should focus attention on the highest-severity delivery blockers and risks rather than monitoring every engineering event individually.`;
  }

  return `I can help you investigate this project using the data AutoPM has already analyzed.

Try asking me:

• "Why is the health score ${health}%?"
• "What is blocking the release?"
• "What are the biggest risks?"
• "Which PRs need attention?"
• "What should the team prioritize next?"
• "Summarize this for leadership"
• "How is CI doing?"

I will answer using the current ${analysisMode === "github" ? "GitHub repository analysis" : "Project Nova demo dataset"}.`;
}

export function AskAutoPM({
  report,
  analysisMode,
  isOpen,
  onClose,
}: AskAutoPMProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const suggestions = useMemo(
    () => [
      "Why is the health score low?",
      "What is blocking the release?",
      "What should we prioritize next?",
      "Summarize this for leadership",
    ],
    []
  );

  if (!isOpen) {
    return null;
  }

  const askQuestion = async (value?: string) => {
    const text = (value ?? question).trim();

    if (!text || !report) {
      return;
    }

    setQuestion(text);
    setIsThinking(true);
    setAnswer("");

    await new Promise((resolve) => setTimeout(resolve, 650));

    setAnswer(generateAnswer(text, report, analysisMode));
    setIsThinking(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        aria-label="Close Ask AutoPM"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-3xl border border-indigo-400/20 bg-[#090d1b]/95 shadow-2xl shadow-indigo-950/40 backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Ask AutoPM
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                  Live Context
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-0.5">
                Ask questions about the current project intelligence.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(88vh-85px)] space-y-5">
          {!report ? (
            <div className="py-14 text-center">
              <Bot className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <p className="text-sm text-slate-400">
                Generate a report first.
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Ask AutoPM needs project intelligence to answer questions.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                  <Activity className="w-4 h-4 text-cyan-400 mb-2" />
                  <p className="text-[10px] text-slate-500 uppercase">
                    Health
                  </p>
                  <p className="text-lg font-bold text-white">
                    {report.project_health}%
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                  <ShieldAlert className="w-4 h-4 text-rose-400 mb-2" />
                  <p className="text-[10px] text-slate-500 uppercase">
                    Blockers
                  </p>
                  <p className="text-lg font-bold text-white">
                    {report.blockers.length}
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                  <GitPullRequest className="w-4 h-4 text-indigo-400 mb-2" />
                  <p className="text-[10px] text-slate-500 uppercase">
                    Risks
                  </p>
                  <p className="text-lg font-bold text-white">
                    {report.risks.length}
                  </p>
                </div>
              </div>

              {!answer && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                    <p className="text-xs font-semibold text-slate-300">
                      Suggested questions
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    {suggestions.map((item) => (
                      <button
                        key={item}
                        onClick={() => askQuestion(item)}
                        className="text-left px-3 py-3 rounded-xl border border-white/5 bg-white/[0.025] hover:bg-indigo-500/10 hover:border-indigo-400/20 transition"
                      >
                        <span className="text-xs text-slate-300">
                          {item}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {answer && (
                <div className="rounded-2xl border border-indigo-400/15 bg-indigo-500/[0.05] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Bot className="w-4 h-4 text-indigo-300" />
                    <span className="text-xs font-bold text-indigo-200">
                      AutoPM Intelligence
                    </span>
                  </div>

                  <div className="whitespace-pre-line text-sm leading-7 text-slate-300">
                    {answer}
                  </div>
                </div>
              )}

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  askQuestion();
                }}
                className="flex gap-2"
              >
                <input
                  value={question}
                  onChange={(event) =>
                    setQuestion(event.target.value)
                  }
                  placeholder="Ask AutoPM anything about this project..."
                  className="flex-1 h-11 rounded-xl bg-black/20 border border-white/10 px-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-400/40 focus:ring-1 focus:ring-indigo-400/10 transition"
                />

                <button
                  type="submit"
                  disabled={!question.trim() || isThinking}
                  className="w-11 h-11 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center transition disabled:opacity-40"
                >
                  {isThinking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>

              <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <Target className="w-3 h-3" />
                Answers are grounded in the currently loaded AutoPM report.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
