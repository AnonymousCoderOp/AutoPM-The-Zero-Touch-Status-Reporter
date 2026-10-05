"use client";

import React from "react";
import { X, Clock, Zap, TrendingUp, CheckCircle2, DollarSign } from "lucide-react";

interface RoiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoiModal: React.FC<RoiModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card rounded-2xl border border-white/10 max-w-xl w-full bg-slate-900/95 p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-semibold border border-cyan-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Time-Saved & ROI Metric</span>
          </div>
          <h3 className="text-xl font-bold text-white">Manual Reporting vs. AutoPM</h3>
          <p className="text-xs text-slate-400">
            A Senior Technical Project Manager spends nearly 2 hours every week compiling status reports across distributed repositories and chat channels.
          </p>
        </div>

        {/* Side by side comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Manual Workflow */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Manual Reporting
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">100 min</span>
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Collect Slack & DM updates</span>
                <span className="font-mono text-slate-300">20 min</span>
              </div>
              <div className="flex justify-between">
                <span>Review GitHub PRs & CI</span>
                <span className="font-mono text-slate-300">25 min</span>
              </div>
              <div className="flex justify-between">
                <span>Draft executive summary</span>
                <span className="font-mono text-slate-300">35 min</span>
              </div>
              <div className="flex justify-between">
                <span>Prepare stakeholder email</span>
                <span className="font-mono text-slate-300">20 min</span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between font-bold text-xs text-white">
              <span>Total Time Spent:</span>
              <span className="text-rose-400">100 minutes</span>
            </div>
          </div>

          {/* AutoPM Autonomous Workflow */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-cyan-950/30 to-emerald-950/30 border border-cyan-500/30 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" />
                AutoPM Zero-Touch
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">1.8 sec</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Autonomous ingestion</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Real blocker extraction</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Evidence-based risk rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Executive email ready</span>
              </div>
            </div>
            <div className="pt-2 border-t border-cyan-500/20 flex justify-between font-bold text-xs text-white">
              <span>Time Saved / Run:</span>
              <span className="text-emerald-400">99+ minutes (99.8%)</span>
            </div>
          </div>
        </div>

        {/* Weekly Impact summary */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">6.5 Hours Saved This Week</h4>
              <p className="text-xs text-emerald-300/80">
                Calculated across 4 engineering squads and Q4 leadership updates.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
        >
          Close Breakdown
        </button>
      </div>
    </div>
  );
};
