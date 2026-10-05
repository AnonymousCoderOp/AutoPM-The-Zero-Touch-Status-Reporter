
import json
import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel

from demo_data import get_demo_payload


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY:
    print("WARNING: OPENROUTER_API_KEY is not configured.")


# ============================================================
# OPENROUTER CLIENT
# ============================================================

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="AutoPM API",
    description="Zero-Touch Weekly Status Reporter",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class AIRequest(BaseModel):
    prompt: str


class GenerateReportRequest(BaseModel):
    project_name: str
    week_range: str
    slack_messages: list
    github_prs: list
    github_commits: list


# ============================================================
# HEALTH ENGINE
# ============================================================

def calculate_project_health(
    slack_messages: list,
    github_prs: list,
    github_commits: list,
) -> tuple[int, str]:

    score = 100

    merged_prs = 0
    changes_requested = 0
    failing_ci = 0
    open_prs = 0

    for pr in github_prs:

        status = str(
            pr.get("status", "")
            if isinstance(pr, dict)
            else getattr(pr, "status", "")
        ).lower()

        if status == "merged":
            merged_prs += 1

        elif status == "changes_requested":
            changes_requested += 1

        elif status == "failing_ci":
            failing_ci += 1

        elif status == "open":
            open_prs += 1

    blocker_count = 0
    risk_count = 0

    for message in slack_messages:

        text = str(
            message.get("text", "")
            if isinstance(message, dict)
            else getattr(message, "text", "")
        ).lower()

        if any(
            keyword in text
            for keyword in [
                "failing",
                "blocked",
                "cannot finish",
                "waiting on",
                "lock timeout",
                "crashloop",
                "unstable",
                "failed",
            ]
        ):
            blocker_count += 1

        if any(
            keyword in text
            for keyword in [
                "waiting",
                "unstable",
                "crashloop",
                "failed",
                "rollback",
            ]
        ):
            risk_count += 1

    if failing_ci > 0:
        score -= 10

    if changes_requested > 0:
        score -= 8

    if blocker_count >= 3:
        score -= 7

    if risk_count >= 2:
        score -= 5

    if open_prs > 0:
        score -= 5

    score = max(0, min(100, score))

    if score >= 85:
        verdict = "Healthy"
    elif score >= 70:
        verdict = "On Track"
    elif score >= 50:
        verdict = "Caution"
    else:
        verdict = "Critical"

    return score, verdict


# ============================================================
# HELPERS
# ============================================================

def serialize_items(items):

    result = []

    for item in items:

        if hasattr(item, "model_dump"):
            result.append(item.model_dump())

        elif hasattr(item, "dict"):
            result.append(item.dict())

        elif isinstance(item, dict):
            result.append(item)

        else:
            result.append(vars(item))

    return result


def build_project_context(request: GenerateReportRequest):

    slack = serialize_items(request.slack_messages)
    prs = serialize_items(request.github_prs)
    commits = serialize_items(request.github_commits)

    return {
        "project_name": request.project_name,
        "week_range": request.week_range,
        "slack_messages": slack,
        "github_prs": prs,
        "github_commits": commits,
    }


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "name": "AutoPM",
        "description": "Zero-Touch Weekly Status Reporter",
        "status": "online",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "AutoPM API",
        "ai_provider": "OpenRouter",
    }


# ============================================================
# DEMO DATA
# ============================================================

@app.get("/demo-data")
def demo_data():

    return get_demo_payload()


# ============================================================
# SIMPLE AI ENDPOINT
# ============================================================

@app.post("/ask-ai")
def ask_ai(request: AIRequest):

    if not OPENROUTER_API_KEY:

        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY is not configured.",
        )

    try:

        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are AutoPM, an enterprise project-management "
                        "intelligence assistant. Give concise, accurate and "
                        "actionable answers."
                    ),
                },
                {
                    "role": "user",
                    "content": request.prompt,
                },
            ],
            temperature=0.2,
        )

        return {
            "response": response.choices[0].message.content
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"AI request failed: {str(exc)}",
        )


# ============================================================
# GENERATE WEEKLY REPORT
# ============================================================

@app.post("/generate-report")
def generate_report(request: GenerateReportRequest):

    # --------------------------------------------------------
    # 1. Calculate deterministic health
    # --------------------------------------------------------

    health_score, health_verdict = calculate_project_health(
        request.slack_messages,
        request.github_prs,
        request.github_commits,
    )

    # --------------------------------------------------------
    # 2. Build AI context
    # --------------------------------------------------------

    project_context = build_project_context(request)

    context_json = json.dumps(
        project_context,
        indent=2,
        default=str,
    )

    # --------------------------------------------------------
    # 3. AI instructions
    # --------------------------------------------------------

    system_prompt = """
You are AutoPM, an AI-powered zero-touch project status reporter.

Your job is to analyze raw Slack messages, GitHub pull requests,
and GitHub commits and produce an executive-level weekly project report.

IMPORTANT:

The project health score and health verdict have ALREADY been
calculated by AutoPM's deterministic health engine.

DO NOT change them.

You MUST use exactly the supplied project_health and health_verdict.

Your job is to intelligently analyze the activity and generate:

1. Executive summary
2. Achievements
3. Blockers
4. Risks
5. Next steps
6. Stakeholder email
7. Time-saving calculation

Do not invent unrelated facts.

Return ONLY valid JSON.

Required JSON structure:

{
  "project_name": "string",
  "week_range": "string",
  "project_health": 0,
  "health_verdict": "string",

  "executive_summary": {
    "progress": "string",
    "achievements": ["string"],
    "next_steps": ["string"]
  },

  "blockers": [
    {
      "issue": "string",
      "severity": "high | medium | low",
      "source": "Slack | GitHub | Both"
    }
  ],

  "risks": [
    {
      "description": "string",
      "confidence": "high | medium | low",
      "severity": "high | medium | low",
      "potential_impact": "string"
    }
  ],

  "email": {
    "subject": "string",
    "body": "string"
  },

  "time_saved": {
    "manual_minutes": 100,
    "automated_seconds": 1.8,
    "minutes_saved": 99,
    "hours_saved_week": 6.5,
    "breakdown": {
      "collect_updates_mins": 25,
      "review_github_mins": 25,
      "write_summary_mins": 25,
      "prepare_email_mins": 25
    }
  }
}

Make the report professional enough for engineering leadership.
"""

    user_prompt = f"""
Analyze this project activity.

PROJECT:

{context_json}

DETERMINISTIC PROJECT HEALTH:

project_health = {health_score}

health_verdict = "{health_verdict}"

Again:

DO NOT modify these two values.

Return only JSON.
"""

    # --------------------------------------------------------
    # 4. Call OpenRouter
    # --------------------------------------------------------

    if not OPENROUTER_API_KEY:

        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY is not configured.",
        )

    try:

        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",

            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],

            temperature=0.1,

            response_format={
                "type": "json_object"
            },
        )

        raw_content = response.choices[0].message.content

        if not raw_content:
            raise ValueError("AI returned an empty response.")

        report = json.loads(raw_content)

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Report generation failed: {str(exc)}",
        )

    # --------------------------------------------------------
    # 5. SERVER-SIDE ENFORCEMENT
    # --------------------------------------------------------

    report["project_name"] = request.project_name
    report["week_range"] = request.week_range

    report["project_health"] = health_score
    report["health_verdict"] = health_verdict

    report["mode"] = "ai_generated"
    report["provider_used"] = "OpenRouter"

    report["generated_at"] = (
        datetime.now(timezone.utc).isoformat()
    )

    # --------------------------------------------------------
    # 6. DETERMINISTIC TIME SAVING
    # --------------------------------------------------------

    report["time_saved"] = {
        "manual_minutes": 100,
        "automated_seconds": 1.8,
        "minutes_saved": 99,
        "hours_saved_week": 6.5,
        "breakdown": {
            "collect_updates_mins": 25,
            "review_github_mins": 25,
            "write_summary_mins": 25,
            "prepare_email_mins": 25,
        },
    }

    # --------------------------------------------------------
    # 7. AUTOMATION SCHEDULE
    # --------------------------------------------------------

    report["automation_schedule"] = {
        "cadence": "Weekly",
        "status": "Active",
        "last_run": "Friday, 4:00 PM",
        "next_run": "Upcoming Friday, 4:00 PM",
        "target_recipients": [
            "leadership@nova.corp",
            "eng-leads@nova.corp",
            "product-ops@nova.corp",
        ],
    }

    return report