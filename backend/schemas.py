from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class SlackMessage(BaseModel):
    id: str
    channel: str
    author: str
    author_role: str
    timestamp: str
    text: str
    avatar_color: Optional[str] = "blue"


class GitHubPR(BaseModel):
    id: str
    number: int
    title: str
    author: str
    status: Literal["merged", "open", "changes_requested", "failing_ci"]
    branch: str
    created_at: str
    comments_count: int


class GitHubCommit(BaseModel):
    id: str
    hash: str
    message: str
    author: str
    timestamp: str
    branch: str


class DemoDataPayload(BaseModel):
    project_name: str = "Project Nova (Q4 Cloud Platform & Billing Migration)"
    week_range: str = "Week 40 · Oct 01 - Oct 07, 2026"
    slack_messages: List[SlackMessage] = Field(default_factory=list)
    github_prs: List[GitHubPR] = Field(default_factory=list)
    github_commits: List[GitHubCommit] = Field(default_factory=list)

    # Extra context used by Real GitHub Repository Mode.
    # Demo Mode simply leaves this empty.
    repository_context: Optional[dict] = None


class RepositoryAnalysisRequest(BaseModel):
    repository_url: str = Field(
        min_length=1,
        description="Public GitHub repository URL"
    )


class ExecutiveSummary(BaseModel):
    progress: str = Field(description="High level status overview of the week")
    achievements: List[str] = Field(
        description="List of concrete completed deliverables this week"
    )
    next_steps: List[str] = Field(
        description="Immediate prioritized next steps for upcoming sprint"
    )


class Blocker(BaseModel):
    issue: str = Field(
        description="Clear description of the blocking problem"
    )
    severity: Literal["high", "medium", "low"] = Field(
        description="Severity level: high, medium, or low"
    )
    source: str = Field(
        description="Where this was detected, e.g. #ops-alerts or PR #142"
    )


class Risk(BaseModel):
    description: str = Field(
        description="Identified risk scenario based on the activity"
    )
    confidence: Literal["high", "medium", "low"] = Field(
        description="Confidence rating: high, medium, or low"
    )
    severity: Literal["high", "medium", "low"] = Field(
        description="Impact severity: high, medium, or low"
    )
    potential_impact: str = Field(
        description="Explanation of downstream impact on timeline or stability"
    )


class StakeholderEmail(BaseModel):
    subject: str = Field(
        description="Concise, executive email subject line"
    )
    body: str = Field(
        description="Complete, well-formatted stakeholder status update email"
    )


class TimeSavedMetric(BaseModel):
    manual_minutes: int = 100
    automated_seconds: float = 1.8
    minutes_saved: int = 99
    hours_saved_week: float = 6.5
    breakdown: dict = {
        "collect_updates_mins": 20,
        "review_github_mins": 25,
        "write_summary_mins": 35,
        "prepare_email_mins": 20,
    }


class ReportResponse(BaseModel):
    activity_data: Optional[DemoDataPayload] = None
    project_name: str
    week_range: str
    project_health: int = Field(
        ge=0,
        le=100,
        description="Project health score from 0-100"
    )
    health_verdict: str = Field(
        description="Short verdict e.g. Needs Attention, On Track, At Risk"
    )
    executive_summary: ExecutiveSummary
    blockers: List[Blocker]
    risks: List[Risk]
    email: StakeholderEmail
    time_saved: TimeSavedMetric = Field(default_factory=TimeSavedMetric)
    mode: Literal["ai_generated", "demo_fallback"]
    provider_used: str
    generated_at: str
    automation_schedule: dict = {
        "cadence": "Every Friday · 4:00 PM",
        "status": "Active",
        "last_run": "Friday, 4:00 PM",
        "next_run": "Upcoming Friday, 4:00 PM",
        "target_recipients": [
            "leadership@nova.corp",
            "eng-leads@nova.corp",
            "product-ops@nova.corp",
        ],
    }


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "AutoPM Engine API"
    ai_provider: str
    has_api_key: bool
    demo_mode_active: bool