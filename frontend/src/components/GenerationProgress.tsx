"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, CircleDot, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface GenerationProgressProps {
  isGenerating: boolean;
  onComplete?: () => void;
}

const STEPS = [
  { id: 1, text: "Collecting raw Slack discussions & GitHub PR activity..." },
  { id: 2, text: "Analyzing team updates, sentiment & milestone velocity..." },
  { id: 3, text: "Detecting technical blockers, lockouts & review bottlenecks..." },
  { id: 4, text: "Evaluating predictive deployment risks & downstream impact..." },
  { id: 5, text: "Synthesizing executive report & drafting stakeholder email..." },
];

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ isGenerating }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="rounded-2xl glass-card border border-cyan-500/30 p-6 bg-slate-950/80 shadow-2xl relative overflow-hidden animate-fadeIn">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 animate-pulse" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Zero-Touch Autonomous Analysis in Progress
          </h3>
        </div>
        <span className="text-xs text-cyan-300 font-mono font-medium">
          Step {currentStep + 1} of {STEPS.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 text-xs sm:text-sm p-2 rounded-lg transition-all duration-300 ${
                isCurrent
                  ? "bg-cyan-500/10 text-cyan-200 font-medium border border-cyan-500/20"
                  : isDone
                  ? "text-slate-300"
                  : "text-slate-500"
              }`}
            >
              {isDone ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
              ) : (
                <CircleDot className="w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
              <span className="truncate">{step.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
