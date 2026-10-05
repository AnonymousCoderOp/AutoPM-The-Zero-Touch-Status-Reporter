"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";

import { Header } from "@/components/Header";
import { HeroMetrics } from "@/components/HeroMetrics";
import { GenerationProgress } from "@/components/GenerationProgress";
import { RawActivityView } from "@/components/RawActivityView";
import { AiReportView } from "@/components/AiReportView";
import { RoiModal } from "@/components/RoiModal";
import { ScheduleModal } from "@/components/ScheduleModal";
import { EmailModal } from "@/components/EmailModal";
import { Toast } from "@/components/Toast";

import {
  fetchDemoData,
  fetchHealth,
  generateReport,
  analyzeRepository,
  FALLBACK_DEMO_DATA,
  FALLBACK_REPORT_DATA,
} from "@/lib/api";

import {
  DemoDataPayload,
  HealthResponse,
  ReportResponse,
} from "@/types";

import {
  GitBranch,
  FlaskConical,
  ArrowRight,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";

type AnalysisMode = "demo" | "github";

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const [demoData, setDemoData] =
    useState<DemoDataPayload | null>(FALLBACK_DEMO_DATA);

  const [report, setReport] =
    useState<ReportResponse | null>(null);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [analysisMode, setAnalysisMode] =
    useState<AnalysisMode>("demo");

  const [repositoryUrl, setRepositoryUrl] =
    useState("");

  const [analyzedRepository, setAnalyzedRepository] =
    useState<string | null>(null);

  // Modals & Notifications
  const [isRoiOpen, setIsRoiOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const [h, d] = await Promise.all([
        fetchHealth(),
        fetchDemoData(),
      ]);

      setHealth(h);

      if (d) {
        setDemoData(d);
      }
    }

    init();
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.7 },
        colors: [
          "#06b6d4",
          "#10b981",
          "#6366f1",
          "#f59e0b",
        ],
      });
    } catch {
      // Safe fallback.
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage((prev) =>
        prev === msg ? null : prev
      );
    }, 4000);
  };

  // --------------------------------------------------
  // DEMO MODE
  // --------------------------------------------------

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    const startTime = Date.now();

    try {
      const result = await generateReport(
        demoData || undefined
      );

      const elapsed = Date.now() - startTime;

      if (elapsed < 1800) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1800 - elapsed)
        );
      }

      setReport(result);
      setAnalyzedRepository(null);

      triggerConfetti();

      showToast(
        "Weekly Status Report synthesized successfully!"
      );
    } catch {
      setReport(FALLBACK_REPORT_DATA);

      showToast(
        "Report generated using High-Fidelity Demo Fallback."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // --------------------------------------------------
  // REAL GITHUB MODE
  // --------------------------------------------------

  const handleAnalyzeRepository = async () => {
    const url = repositoryUrl.trim();

    if (!url) {
      showToast(
        "Enter a GitHub repository URL first."
      );
      return;
    }

    const githubUrlPattern =
      /^https?:\/\/github\.com\/[^/]+\/[^/]+\/?$/i;

    if (!githubUrlPattern.test(url)) {
      showToast(
        "Please enter a valid GitHub repository URL."
      );
      return;
    }

    setIsGenerating(true);
    setReport(null);

    const startTime = Date.now();

    try {
      const result = await analyzeRepository(url);

      const elapsed = Date.now() - startTime;

      // Keep loading animation visible briefly
      // so the analysis feels intentional during the demo.
      if (elapsed < 1800) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1800 - elapsed)
        );
      }

      setReport(result);
      setAnalyzedRepository(url);

      triggerConfetti();

      showToast(
        "Real GitHub repository analyzed successfully!"
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Repository analysis failed.";

      showToast(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // --------------------------------------------------
  // MODE SWITCHING
  // --------------------------------------------------

  const handleModeChange = (
    mode: AnalysisMode
  ) => {
    if (isGenerating) {
      return;
    }

    setAnalysisMode(mode);
    setReport(null);
    setAnalyzedRepository(null);

    if (mode === "demo") {
      setRepositoryUrl("");
    }
  };

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------

  const handleReset = async () => {
    setReport(null);
    setAnalyzedRepository(null);
    setAnalysisMode("demo");
    setRepositoryUrl("");

    const d = await fetchDemoData();

    setDemoData(d);

    showToast(
      "Project activity reset to fresh state."
    );
  };

  // --------------------------------------------------
  // DEMO EMAIL
  // --------------------------------------------------

  const handleSendEmailDemo = () => {
    triggerConfetti();

    setIsEmailOpen(false);

    showToast(
      "Email sent successfully in Demo Mode."
    );
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
   <div className="autopm-page min-h-screen text-slate-100 flex flex-col">

      {/* Top Header */}
      <Header
        health={health}
        onReset={handleReset}
        onOpenSchedule={() =>
          setIsScheduleOpen(true)
        }
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* -------------------------------------------- */}
        {/* ANALYSIS SOURCE                              */}
        {/* -------------------------------------------- */}

        <section className="autopm-control-panel rounded-2xl overflow-hidden autopm-section">
          <div className="p-5 sm:p-6">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              {/* Heading */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">

                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                      Analysis Source
                    </h2>

                    <p className="text-xs text-slate-500">
                      Choose where AutoPM gets engineering activity.
                    </p>
                  </div>

                </div>
              </div>

              {/* Mode Buttons */}
              <div className="autopm-mode-selector flex items-center gap-1 p-1 rounded-xl">

                {/* Demo Mode */}
                <button
                  onClick={() =>
                    handleModeChange("demo")
                  }
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    analysisMode === "demo"
                      ? "autopm-mode-active bg-indigo-500/20 text-indigo-200 border border-indigo-400/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Demo Mode
                </button>

                {/* GitHub Mode */}
                <button
                  onClick={() =>
                    handleModeChange("github")
                  }
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    analysisMode === "github"
                      ? "autopm-mode-active bg-cyan-500/20 text-cyan-200 border border-cyan-400/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  GitHub Repository
                </button>

              </div>

            </div>

            {/* ---------------------------------------- */}
            {/* DEMO MODE PANEL                         */}
            {/* ---------------------------------------- */}

            {analysisMode === "demo" && (
              <div className="mt-5 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                  <div>
                    <p className="text-xs font-semibold text-indigo-300">
                      Project Nova Demo Environment
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Preloaded Slack + GitHub activity for a reliable hackathon demonstration.
                    </p>
                  </div>

                  <button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="autopm-primary-button flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Generate Report
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                </div>

              </div>
            )}

            {/* ---------------------------------------- */}
            {/* GITHUB MODE PANEL                       */}
            {/* ---------------------------------------- */}

            {analysisMode === "github" && (
              <div className="mt-5 space-y-4">

                {/* Information Box */}
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">

                  <div className="flex items-start gap-3">

                    <GitBranch className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />

                    <div>
                      <p className="text-xs font-semibold text-cyan-300">
                        Analyze a real GitHub repository
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        AutoPM will inspect recent commits, pull requests, issues, contributors and CI activity, then generate an executive engineering report.
                      </p>
                    </div>

                  </div>

                </div>

                {/* Repository Input */}
                <div className="flex flex-col sm:flex-row gap-3">

                  <div className="relative flex-1">

                    <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                    <input
                      value={repositoryUrl}
                      onChange={(event) =>
                        setRepositoryUrl(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !isGenerating
                        ) {
                          handleAnalyzeRepository();
                        }
                      }}
                      placeholder="https://github.com/owner/repository"
                      disabled={isGenerating}
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-950/80 border border-white/10 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition disabled:opacity-50"
                    />

                  </div>

                  <button
                    onClick={handleAnalyzeRepository}
                    disabled={
                      isGenerating ||
                      !repositoryUrl.trim()
                    }
                    className="autopm-primary-button h-11 px-5 rounded-xl text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >

                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Repository...
                      </>
                    ) : (
                      <>
                        Analyze Repository
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}

                  </button>

                </div>

                {/* Example Repository */}
                <p className="text-[11px] text-slate-600">

                  Example:{" "}

                  <button
                    onClick={() =>
                      setRepositoryUrl(
                        "https://github.com/torvalds/linux"
                      )
                    }
                    className="text-cyan-500/70 hover:text-cyan-400 transition"
                  >
                    github.com/torvalds/linux
                  </button>

                </p>

              </div>
            )}

          </div>
        </section>

        {/* -------------------------------------------- */}
        {/* ANALYZED REPOSITORY BANNER                  */}
        {/* -------------------------------------------- */}

        {analyzedRepository && (
          <div className="autopm-live-banner flex items-center justify-between gap-3 px-4 py-3 rounded-xl autopm-section-delay-1">

            <div className="flex items-center gap-2 min-w-0">

              <span className="autopm-live-dot flex-shrink-0" />

              <GitBranch className="w-4 h-4 text-emerald-400 flex-shrink-0" />

              <div className="min-w-0">

                <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
                  Live GitHub Analysis
                </p>

                <p className="text-xs text-slate-300 truncate">
                  {analyzedRepository}
                </p>

              </div>

            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-200 transition flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>

          </div>
        )}

        {/* -------------------------------------------- */}
        {/* HERO SECTION                                */}
        {/* -------------------------------------------- */}

        <HeroMetrics
          report={report}
          isGenerating={isGenerating}
          analysisMode={analysisMode}
          onGenerate={
            analysisMode === "github"
              ? handleAnalyzeRepository
              : handleGenerateReport
          }
          onOpenRoiModal={() =>
            setIsRoiOpen(true)
          }
          onOpenScheduleModal={() =>
            setIsScheduleOpen(true)
          }
        />

        {/* -------------------------------------------- */}
        {/* GENERATION PROGRESS                         */}
        {/* -------------------------------------------- */}

        <GenerationProgress
          isGenerating={isGenerating}
        />

        {/* -------------------------------------------- */}
        {/* TWO COLUMN DASHBOARD                        */}
        {/* -------------------------------------------- */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column */}
          <div className="lg:col-span-5 h-full">

            <RawActivityView
              data={
                analysisMode === "github" &&
                report?.activity_data
                  ? report.activity_data
                  : demoData
              }
            />

          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 h-full">

            <AiReportView
              report={report}
              onOpenEmail={() =>
                setIsEmailOpen(true)
              }
              onSendEmailDemo={
                handleSendEmailDemo
              }
            />

          </div>

        </div>

      </main>

      {/* -------------------------------------------- */}
      {/* FOOTER                                      */}
      {/* -------------------------------------------- */}

      <footer className="border-t border-white/5 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">

        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">

          <p>
            AutoPM – The Zero-Touch Weekly Status Reporter · Built for Hackathon Everyday Automation Track
          </p>

          <p className="text-slate-400 font-mono text-[11px]">
            Zero Human Babysitting · 99.8% Faster
          </p>

        </div>

      </footer>

      {/* -------------------------------------------- */}
      {/* MODALS                                      */}
      {/* -------------------------------------------- */}

      <RoiModal
        isOpen={isRoiOpen}
        onClose={() =>
          setIsRoiOpen(false)
        }
      />

      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() =>
          setIsScheduleOpen(false)
        }
      />

      <EmailModal
        isOpen={isEmailOpen}
        email={report?.email || null}
        onClose={() =>
          setIsEmailOpen(false)
        }
        onSendEmail={
          handleSendEmailDemo
        }
      />

      {/* -------------------------------------------- */}
      {/* TOAST                                       */}
      {/* -------------------------------------------- */}

      <Toast
        message={toastMessage}
        onClose={() =>
          setToastMessage(null)
        }
      />

    </div>
  );
}