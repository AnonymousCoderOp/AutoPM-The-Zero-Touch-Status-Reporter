"use client";

import React from "react";
import { X, CalendarCheck, Clock, CheckCircle2, ShieldCheck, Mail, ArrowRight } from "lucide-react";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card rounded-2xl border border-white/10 max-w-lg w-full bg-slate-900/95 p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/20">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Zero-Touch Autonomous Execution</span>
          </div>
          <h3 className="text-xl font-bold text-white">Automation Schedule</h3>
          <p className="text-xs text-slate-400">
            AutoPM eliminates human babysitting by autonomously running on a scheduled cron trigger at the close of every business week.
          </p>
        </div>

        {/* Schedule Spec Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="text-xs text-slate-400">Cadence</span>
            <span className="text-xs font-bold text-white">Every Friday · 4:00 PM EST</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="text-xs text-slate-400">Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active (Zero-Touch)
            </span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="text-xs text-slate-400">Last Execution</span>
            <span className="text-xs font-mono text-slate-300">Friday, 4:00 PM (Success)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Next Scheduled Trigger</span>
            <span className="text-xs font-mono text-cyan-300">Upcoming Friday, 4:00 PM</span>
          </div>
        </div>

        {/* 3 Step Workflow */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Autonomous Pipeline Workflow:
          </h4>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
              <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">1. Trigger & Ingest: </span>
                <span>Scrapes connected Slack channels and repository activity from the past 7 days.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">2. Synthesize & Audit: </span>
                <span>Evaluates blockers, calculates project health score, and isolates predictive risks.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/80 border border-white/5">
              <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">3. Dispatched Delivery: </span>
                <span>Prepares and transmits formatted email directly to leadership and engineering leads.</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
