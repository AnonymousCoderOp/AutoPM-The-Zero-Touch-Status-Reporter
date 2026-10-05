# ⚡ AutoPM – The Zero-Touch Weekly Status Reporter
> **Everyday Automation Track** · 30-Hour Hackathon Project MVP

AutoPM transforms hours of messy weekly project communications across Slack channels, GitHub PRs, and commit logs into executive-ready status reports, blocker maps, and stakeholder update emails in **seconds**—with **zero human babysitting**.

---

## 🎯 The Problem & The ROI
In real-world engineering teams, a Technical Project Manager or Engineering Lead spends **90–120 minutes every Friday** manually collecting team updates, checking pull request statuses, identifying blockers, evaluating deployment risks, and drafting stakeholder update emails.

### ⏱️ Time-Saved Breakdown:
| Task | Manual PM Workflow | AutoPM Zero-Touch |
| :--- | :--- | :--- |
| Collect Slack & DM updates | 20 minutes | Automated ingestion (<1s) |
| Review GitHub PRs & CI logs | 25 minutes | Automated ingestion (<1s) |
| Synthesize Executive Summary | 35 minutes | AI LLM Reasoning (1.2s) |
| Draft & Format Stakeholder Email | 20 minutes | Auto-templated (<0.5s) |
| **Total per Report** | **100 minutes** | **~1.8 seconds (99.8% Faster)** |
| **Weekly Savings (4 squads)** | **~6.5 hours / week** | **Instantaneous** |

---

## 🏗️ Architecture & Tech Stack

```
AutoPM/
├── backend/                  # Python FastAPI Backend
│   ├── main.py               # API entrypoint, CORS, routes
│   ├── config.py             # Settings & provider selector
│   ├── schemas.py            # Pydantic data contracts
│   ├── demo_data.py          # Realistic messy Project Nova dataset
│   ├── ai_engine.py          # Strict JSON prompt + OpenAI/Anthropic/Fallback engine
│   ├── requirements.txt      # FastAPI, Uvicorn, Pydantic, HTTPX
│   └── .env.example          # Environment configuration template
│
├── frontend/                 # Next.js 16 + React + TypeScript Dashboard
│   ├── src/app/              # Next.js App Router (page, layout, globals)
│   ├── src/components/       # Header, HeroMetrics, RawActivityView, AiReportView, Modals
│   ├── src/lib/api.ts        # Resilient API client with offline safety
│   ├── src/types/index.ts    # Shared TypeScript interfaces
│   └── package.json          # Next.js, Tailwind CSS, Lucide icons, Canvas Confetti
│
└── README.md
```

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti, Dark Modern Glassmorphism.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Uvicorn, HTTPX.
- **AI Engine**: Flexible multi-provider support (**OpenAI** GPT-4o / GPT-4o-mini, **Anthropic** Claude 3.5 Sonnet) with a **100% reliable deterministic fallback engine** when API keys are absent or offline.

---

## 🚀 Quick Start Guide

### 1. Start the Backend API (Port 8000)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# (Optional) Add your OpenAI or Anthropic API key to .env
cp .env.example .env

# Run FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend runs at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).*

### 2. Start the Frontend Dashboard (Port 3000)

```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## ⚙️ Environment Variables (`backend/.env`)

```env
PORT=8000
AI_PROVIDER=openai                    # "openai" or "anthropic"
OPENAI_API_KEY=                       # Leave empty to activate 100% reliable Demo Fallback
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
FORCE_DEMO_MODE=false
```

> **Note on Demo Reliability**: If no API key is provided or the network is unavailable, AutoPM automatically uses its deterministic demo engine for Project Nova. The hackathon demo will **never fail** due to missing keys.

---

## 📡 Backend API Endpoints

- `GET /health`: Health status, AI provider status, and demo mode indicator.
- `GET /demo-data`: Returns the raw, chaotic Slack messages and GitHub PRs/Commits for Project Nova.
- `POST /generate-report`: Analyzes the activity stream and returns the structured JSON report (Project Health, Executive Summary, Blockers, Predictive Risks, Stakeholder Email, and ROI metrics).

---

## 🎪 Hackathon Demo Walkthrough Flow

1. **Dashboard First Impression**:
   - Point out the **AutoPM - Zero-Touch Weekly Status Reporter** branding and **Active Friday 4:00 PM** schedule indicator.
   - Highlight the **6.5 Hours Saved / 99+ Min ROI Metric**.
2. **Left Column ("Raw Project Activity")**:
   - Show the messy reality: Database migration failing on staging with Error 500, ACME Corp client legal approval delayed, checkout UI blocked on PR #142, and us-east-2 auth crashloops.
3. **Trigger Zero-Touch Generation**:
   - Click **"Generate Weekly Report"**.
   - Watch the multi-step real-time progress indicator (*Ingesting activity → Detecting blockers → Evaluating risks → Synthesizing report*).
4. **Right Column ("AI Project Report")**:
   - Review the calculated **Project Health Score (78% - Moderate Risk · Action Required)**.
   - Inspect detected **High Severity Blockers** tagged with exact source channels.
   - Inspect **Predictive Risks** (e.g. auth container OOM limits impacting deployment).
   - Switch to the **"Stakeholder Email"** tab.
5. **Simulated Email Dispatch**:
   - Click **"Send Email (Demo Mode)"** to trigger the confirmation toast and confetti feedback.
6. **ROI & Time-Saved Modal**:
   - Click **"View ROI Details"** to show the 100-minute manual PM time vs 1.8-second AutoPM execution.

---

## 🛡️ Everyday Automation Core Principle
> **"AutoPM turns hours of manual weekly project reporting into seconds of automated work."**
