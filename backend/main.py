import logging
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from demo_data import get_demo_payload
from schemas import (
    DemoDataPayload,
    HealthResponse,
    ReportResponse,
    RepositoryAnalysisRequest,
    GitHubPR,
    GitHubCommit,
)
from ai_engine import generate_project_report
from github_client import get_repository_snapshot


# --------------------------------------------------
# LOGGING
# --------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger("autopm.main")


# --------------------------------------------------
# FASTAPI APP
# --------------------------------------------------

app = FastAPI(
    title="AutoPM – The Zero-Touch Status Reporter API",
    description=(
        "Backend engine transforming messy Slack and GitHub activity "
        "into structured weekly executive reports."
    ),
    version="1.2.0",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# HEALTH
# --------------------------------------------------

@app.get("/health", response_model=HealthResponse)
async def health_check():
    has_key = bool(
        settings.OPENROUTER_API_KEY
        or settings.OPENAI_API_KEY
        or settings.ANTHROPIC_API_KEY
    )

    active_provider = (
        "openrouter"
        if settings.OPENROUTER_API_KEY
        else settings.AI_PROVIDER
    )

    return HealthResponse(
        status="ok",
        service="AutoPM Engine API",
        ai_provider=active_provider,
        has_api_key=has_key,
        demo_mode_active=settings.FORCE_DEMO_MODE or not has_key,
    )


# --------------------------------------------------
# DEMO DATA
# --------------------------------------------------

@app.get("/demo-data", response_model=DemoDataPayload)
async def get_demo_data():
    """
    Returns the mocked Project Nova Slack and GitHub activity.
    """
    return get_demo_payload()


# --------------------------------------------------
# DEMO REPORT GENERATION
# --------------------------------------------------

@app.post("/generate-report", response_model=ReportResponse)
async def generate_report(
    payload: Optional[DemoDataPayload] = None,
):
    """
    Main demo report generation endpoint.

    Loads Project Nova demo activity unless a valid
    payload is supplied.
    """

    if payload is None or (
        not payload.slack_messages
        and not payload.github_prs
        and not payload.github_commits
    ):
        data = get_demo_payload()
    else:
        data = payload

    try:
        report = await generate_project_report(data)

        # Attach the activity used to generate the report.
        report.activity_data = data

        return report

    except Exception as e:
        logger.error(
            f"Error during report generation: {e}",
            exc_info=True,
        )

        raise HTTPException(
            status_code=500,
            detail=f"Report generation error: {str(e)}",
        )


# --------------------------------------------------
# REAL GITHUB REPOSITORY ANALYSIS
# --------------------------------------------------

@app.post(
    "/analyze-repository",
    response_model=ReportResponse,
)
async def analyze_repository(
    request: RepositoryAnalysisRequest,
):
    """
    Analyze a real GitHub repository and generate
    an AutoPM executive report.

    Flow:

    1. Validate GitHub URL
    2. Fetch repository metadata
    3. Fetch recent commits
    4. Fetch pull requests
    5. Fetch issues
    6. Fetch contributors
    7. Fetch GitHub Actions
    8. Convert data into AutoPM's common activity format
    9. Run the same AI report engine used by Demo Mode
    10. Return both the AI report and real activity data
    """

    repository_url = request.repository_url.strip()

    logger.info(
        f"Starting real GitHub repository analysis: "
        f"{repository_url}"
    )

    try:
        # ------------------------------------------
        # FETCH GITHUB SNAPSHOT
        # ------------------------------------------

        snapshot = await get_repository_snapshot(
            repository_url
        )

        repo = snapshot["repository"]
        raw_commits = snapshot["commits"]
        raw_prs = snapshot["pull_requests"]
        raw_issues = snapshot["issues"]
        workflows = snapshot["workflows"]

        repository_name = repo.get(
            "full_name",
            repository_url,
        )

        default_branch = repo.get(
            "default_branch",
            "main",
        )

        # ------------------------------------------
        # CONVERT COMMITS
        # ------------------------------------------

        github_commits = []

        for index, commit in enumerate(
            raw_commits[:20]
        ):
            commit_data = commit.get(
                "commit",
                {},
            )

            author_data = (
                commit_data.get("author")
                or {}
            )

            github_author = (
                commit.get("author", {}) or {}
            ).get(
                "login",
                author_data.get(
                    "name",
                    "Unknown",
                ),
            )

            github_commits.append(
                GitHubCommit(
                    id=str(
                        commit.get(
                            "sha",
                            f"commit-{index}",
                        )
                    ),
                    hash=str(
                        commit.get(
                            "sha",
                            "",
                        )
                    )[:7],
                    message=commit_data.get(
                        "message",
                        "No commit message",
                    ).split("\n")[0][:200],
                    author=github_author,
                    timestamp=author_data.get(
                        "date",
                        datetime.utcnow().isoformat(),
                    ),
                    branch=default_branch,
                )
            )

        # ------------------------------------------
        # CONVERT PULL REQUESTS
        # ------------------------------------------

        github_prs = []

        for index, pr in enumerate(
            raw_prs[:20]
        ):
            author = (
                pr.get("user", {}) or {}
            ).get(
                "login",
                "Unknown",
            )

            # Map GitHub PR state into AutoPM's PR status.
            # Merged PRs are detected using GitHub's merged_at field.
            if pr.get("merged_at"):
                status = "merged"
            elif pr.get("draft"):
                status = "changes_requested"
            else:
                status = "open"

            github_prs.append(
                GitHubPR(
                    id=str(
                        pr.get(
                            "id",
                            f"pr-{index}",
                        )
                    ),
                    number=int(
                        pr.get(
                            "number",
                            index + 1,
                        )
                    ),
                    title=pr.get(
                        "title",
                        "Untitled pull request",
                    ),
                    author=author,
                    status=status,
                    branch=(
                        pr.get(
                            "head",
                            {},
                        )
                        or {}
                    ).get(
                        "ref",
                        "unknown",
                    ),
                    created_at=pr.get(
                        "created_at",
                        datetime.utcnow().isoformat(),
                    ),
                    comments_count=int(
                        pr.get(
                            "comments",
                            0,
                        )
                    ),
                )
            )

        # ------------------------------------------
        # BUILD REAL REPOSITORY PAYLOAD
        # ------------------------------------------

        repository_context = {
            "repository": repo,
            "issues": raw_issues[:20],
            "workflows": workflows,
            "source_url": repository_url,
            "analysis_type": "real_github_repository",
        }

        activity_payload = DemoDataPayload(
            project_name=repository_name,
            week_range="Recent GitHub Activity",
            slack_messages=[],
            github_prs=github_prs,
            github_commits=github_commits,
            repository_context=repository_context,
        )

        logger.info(
            "GitHub snapshot loaded: "
            f"{len(github_commits)} commits, "
            f"{len(github_prs)} PRs, "
            f"{len(raw_issues)} issues, "
            f"{len(workflows.get('workflow_runs', []))} workflow runs"
        )

        # ------------------------------------------
        # AI REPORT GENERATION
        # ------------------------------------------

        report = await generate_project_report(
            activity_payload
        )

        # ------------------------------------------
        # ATTACH REAL ACTIVITY TO RESPONSE
        # ------------------------------------------

        report.project_name = repository_name
        report.week_range = "Recent GitHub Activity"

        report.activity_data = activity_payload

        # Real GitHub analysis must never inherit Demo/Nova automation data.
        report.automation_schedule = {
            "cadence": "On demand · GitHub repository analysis",
            "status": "Ready",
            "last_run": "Just now",
            "next_run": "Run manually when needed",
            "target_recipients": [],
        }


        return report

    except HTTPException:
        raise

    except Exception as e:
        logger.error(
            f"GitHub repository analysis failed: {e}",
            exc_info=True,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Repository analysis failed: "
                f"{str(e)}"
            ),
        )


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
async def root():
    return {
        "service": "AutoPM",
        "status": "running",
        "version": "1.2.0",
        "modes": [
            "demo",
            "real_github",
        ],
        "endpoints": {
            "health": "/health",
            "demo_data": "/demo-data",
            "generate_report": "/generate-report",
            "analyze_repository": "/analyze-repository",
        },
    }


# --------------------------------------------------
# LOCAL DEVELOPMENT
# --------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.API_PORT,
        reload=True,
    )