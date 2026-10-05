"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  GitPullRequest,
  GitCommit,
  Layers,
  Filter,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { DemoDataPayload, GitHubPR, GitHubCommit, SlackMessage } from "@/types";

interface RawActivityViewProps {
  data: DemoDataPayload | null;
}

type TabType = "all" | "slack" | "prs" | "commits";

export const RawActivityView: React.FC<RawActivityViewProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!data) return null;

  const totalItems =
    data.slack_messages.length + data.github_prs.length + data.github_commits.length;

  const highlightText = (text: string) => {
    // Highlight interesting signals inside messy messages
    const keywords = [
      "failing repeatedly",
      "failing",
      "error 500",
      "lock timeout",
      "Rollback triggered",
      "waiting on enterprise client",
      "cannot finish",
      "blocked",
      "100% test coverage",
      "unstable",
      "pod crashloops",
      "Auto-reverted",
      "100% green",
      "remediation completed",
      "hotfix",
    ];

    let highlighted = text;
    // We can render rich spans for key phrases
    return <span>{text}</span>;
  };

  const getPRBadge = (status: GitHubPR["status"]) => {
    switch (status) {
      case "merged":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <CheckCircle2 className="w-3 h-3" /> Merged
          </span>
        );
      case "changes_requested":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <AlertOctagon className="w-3 h-3" /> Changes Requested
          </span>
        );
      case "failing_ci":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 animate-pulse">
            <AlertOctagon className="w-3 h-3" /> CI Failing
          </span>
        );
      case "open":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <Clock className="w-3 h-3" /> Open
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Raw Project Activity
              </h3>
              <p className="text-xs text-slate-400">
                Messy Slack updates, PR changes & commit history
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            {totalItems} data points
          </span>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-white/5 overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === "all"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Activity ({totalItems})
          </button>
          <button
            onClick={() => setActiveTab("slack")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === "slack"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Slack ({data.slack_messages.length})
          </button>
          <button
            onClick={() => setActiveTab("prs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === "prs"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            GitHub PRs ({data.github_prs.length})
          </button>
          <button
            onClick={() => setActiveTab("commits")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === "commits"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            Commits ({data.github_commits.length})
          </button>
        </div>
      </div>

      {/* Content Stream */}
      <div className="p-4 space-y-3 overflow-y-auto max-h-[620px] divide-y divide-white/5">
        {/* Slack Messages Section */}
        {(activeTab === "all" || activeTab === "slack") && (
          <div className="space-y-2.5 pt-2 first:pt-0">
            {activeTab === "all" && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider pb-1">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Slack Stream</span>
              </div>
            )}
            {data.slack_messages.map((msg) => (
              <div
                key={msg.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow"
                      style={{ backgroundColor: msg.avatar_color || "#3b82f6" }}
                    >
                      {msg.author.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-200">{msg.author}</span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      ({msg.author_role})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px]">
                      {msg.channel}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans pl-7">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* GitHub PRs Section */}
        {(activeTab === "all" || activeTab === "prs") && (
          <div className="space-y-2.5 pt-3">
            {activeTab === "all" && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider pb-1">
                <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />
                <span>GitHub Pull Requests</span>
              </div>
            )}
            {data.github_prs.map((pr) => (
              <div
                key={pr.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        #{pr.number}
                      </span>
                      <span className="text-xs font-medium text-slate-200">{pr.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>by @{pr.author}</span>
                      <span className="font-mono text-[10px] text-slate-500">({pr.branch})</span>
                      <span>{pr.comments_count} comments</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">{getPRBadge(pr.status)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GitHub Commits Section */}
        {(activeTab === "all" || activeTab === "commits") && (
          <div className="space-y-2 pt-3">
            {activeTab === "all" && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider pb-1">
                <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                <span>Recent Commits</span>
              </div>
            )}
            {data.github_commits.map((commit) => (
              <div
                key={commit.id}
                className="p-2.5 rounded-lg bg-slate-900/40 border border-white/5 flex items-center justify-between text-xs gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 flex-shrink-0">
                    {commit.hash}
                  </span>
                  <span className="text-slate-300 truncate">{commit.message}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-shrink-0">
                  <span className="hidden sm:inline">{commit.author}</span>
                  <span>{commit.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
