import json
import logging
from datetime import datetime
import httpx
from config import settings
from demo_data import RAW_DEMO_DATA, get_demo_payload
from schemas import (
    Blocker,
    DemoDataPayload,
    ExecutiveSummary,
    ReportResponse,
    Risk,
    StakeholderEmail,
    TimeSavedMetric,
)

logger = logging.getLogger("autopm.ai_engine")

SYSTEM_PROMPT = """You are a Principal Technical Project Manager with 15+ years of experience leading complex cloud platform, infrastructure, and fintech initiatives.
Your job is to analyze raw, messy weekly project activity (Slack communications, GitHub PRs, commits) and transform it into an executive-level, zero-touch weekly status report.

CRITICAL INSTRUCTIONS:
1. Ground every statement strictly in the provided data. NEVER invent facts or hallucinate updates.
2. Identify real BLOCKERS (issues actively preventing ongoing development or merges).
3. Evaluate predictive RISKS backed by concrete evidence (e.g., open PRs with failing CI, pod crashloops, pending approvals).
4. Calculate an accurate 'project_health' integer from 0-100 (e.g., 75-85 when key milestones are achieved but critical staging blockers exist).
5. Output ONLY a valid JSON object matching the requested schema. Do NOT include markdown code fences (```json ... ```) or any preamble/postscript text.
"""

def build_user_prompt(payload: DemoDataPayload) -> str:
    slack_text = "\n".join(
        [
            f"[{m.timestamp}] {m.author} ({m.author_role}) in {m.channel}: \"{m.text}\""
            for m in payload.slack_messages
        ]
    )

    pr_text = "\n".join(
        [
            f"PR #{pr.number} [{pr.status.upper()}]: "
            f"\"{pr.title}\" by @{pr.author} "
            f"(branch: {pr.branch}, comments: {pr.comments_count})"
            for pr in payload.github_prs
        ]
    )

    commit_text = "\n".join(
        [
            f"[{c.timestamp}] {c.hash} by {c.author}: {c.message}"
            for c in payload.github_commits
        ]
    )

    repository_context_text = ""

    if payload.repository_context:
        context = payload.repository_context

        repository_text = context.get("repository", {})
        issues = context.get("issues", [])
        workflows = context.get("workflows", {})

        issue_lines = []

        for issue in issues[:20]:
            issue_lines.append(
                f"Issue #{issue.get('number')}: "
                f"\"{issue.get('title')}\" "
                f"by @{issue.get('user', {}).get('login', 'unknown')} "
                f"(state: {issue.get('state', 'unknown')})"
            )

        workflow_runs = workflows.get("workflow_runs", [])

        workflow_lines = []

        for run in workflow_runs[:20]:
            workflow_lines.append(
                f"Workflow \"{run.get('name', 'unknown')}\" "
                f"status={run.get('status', 'unknown')} "
                f"conclusion={run.get('conclusion', 'unknown')} "
                f"branch={run.get('head_branch', 'unknown')}"
            )

        repository_context_text = f"""
================ GITHUB REPOSITORY METADATA ================
Repository: {repository_text.get("full_name", "Unknown")}
Description: {repository_text.get("description", "No description")}
Default Branch: {repository_text.get("default_branch", "Unknown")}
Stars: {repository_text.get("stargazers_count", 0)}
Forks: {repository_text.get("forks_count", 0)}
Open Issues: {repository_text.get("open_issues_count", 0)}
Language: {repository_text.get("language", "Unknown")}

================ GITHUB ISSUES ================
{chr(10).join(issue_lines) if issue_lines else "No open issues detected."}

================ GITHUB ACTIONS / CI ================
{chr(10).join(workflow_lines) if workflow_lines else "No workflow runs available."}
"""

    return f"""PROJECT CONTEXT:
Project Name: {payload.project_name}
Reporting Period: {payload.week_range}

================ RAW SLACK ACTIVITY ===============
{slack_text if slack_text else "No Slack activity available."}

================ RAW GITHUB PULL REQUESTS ===============
{pr_text if pr_text else "No pull requests available."}

================ RAW GITHUB COMMITS ===============
{commit_text if commit_text else "No commits available."}

{repository_context_text}

================ REQUIRED OUTPUT JSON SCHEMA ===============
Return a JSON object with this EXACT structure:
{{
  "project_health": <integer 0-100>,
  "health_verdict": "<Short 2-4 word executive status, e.g. Moderate Risk · Action Required>",
  "executive_summary": {{
    "progress": "<High level narrative summarizing the week's key momentum and friction points>",
    "achievements": [
      "<Achievement 1>",
      "<Achievement 2>",
      "<Achievement 3>"
    ],
    "next_steps": [
      "<Next step 1>",
      "<Next step 2>",
      "<Next step 3>"
    ]
  }},
  "blockers": [
    {{
      "issue": "<Clear description of blocking problem>",
      "severity": "high" | "medium" | "low",
      "source": "<Specific source such as GitHub Issue #12, PR #42, or CI workflow>"
    }}
  ],
  "risks": [
    {{
      "description": "<Risk description>",
      "confidence": "high" | "medium" | "low",
      "severity": "high" | "medium" | "low",
      "potential_impact": "<Downstream business or technical impact>"
    }}
  ],
  "email": {{
    "subject": "<Executive Subject Line>",
    "body": "<Complete, professionally formatted stakeholder update email with clean sections>"
  }}
}}

IMPORTANT:
- Use ONLY evidence present in the supplied repository/activity data.
- Do NOT invent Slack conversations for real GitHub repositories.
- Do NOT claim an issue is resolved unless the data demonstrates resolution.
- Treat failing GitHub Actions as engineering risks.
- Treat large numbers of open issues or stale PRs as potential risks when evidence supports it.
- Distinguish between confirmed blockers and predictive risks.
"""
def generate_fallback_report(payload: DemoDataPayload) -> ReportResponse:
    """Repository-aware deterministic fallback used when an AI provider is unavailable."""

    repository_context = payload.repository_context or {}
    repository = repository_context.get("repository", {})
    issues = repository_context.get("issues", [])
    workflows = repository_context.get("workflows", {})

    repo_name = (
        repository.get("full_name")
        or repository.get("name")
        or payload.project_name
        or "GitHub Repository"
    )

    default_branch = repository.get("default_branch", "main")
    language = repository.get("language") or "Unknown"
    stars = repository.get("stargazers_count", 0)
    open_issue_count = repository.get("open_issues_count", 0)

    prs = payload.github_prs
    commits = payload.github_commits

    merged_prs = [pr for pr in prs if pr.status == "merged"]
    open_prs = [pr for pr in prs if pr.status == "open"]
    changes_requested_prs = [
        pr for pr in prs if pr.status == "changes_requested"
    ]
    failing_prs = [pr for pr in prs if pr.status == "failing_ci"]

    workflow_runs = workflows.get("workflow_runs", []) if isinstance(workflows, dict) else []
    failed_workflows = [
        run for run in workflow_runs
        if run.get("conclusion") in {"failure", "timed_out", "cancelled"}
    ]

    blockers = []
    risks = []
    achievements = []
    next_steps = []

    # Evidence-based achievements
    if commits:
        achievements.append(
            f"{len(commits)} recent commit(s) were detected on {repo_name}."
        )

    if merged_prs:
        achievements.append(
            f"{len(merged_prs)} pull request(s) in the supplied activity were merged."
        )

    if not merged_prs and commits:
        achievements.append(
            f"Recent development activity is present on the {default_branch} branch."
        )

    if language != "Unknown":
        achievements.append(
            f"The repository is primarily identified as {language} in GitHub metadata."
        )

    if not achievements:
        achievements.append(
            "The repository was successfully analyzed, but limited recent activity was available."
        )

    # Confirmed PR blockers
    for pr in changes_requested_prs[:3]:
        blockers.append(
            Blocker(
                issue=f"PR #{pr.number} has requested changes: {pr.title}.",
                severity="high",
                source=f"GitHub PR #{pr.number}",
            )
        )

    for pr in failing_prs[:3]:
        blockers.append(
            Blocker(
                issue=f"PR #{pr.number} is associated with failing CI: {pr.title}.",
                severity="high",
                source=f"GitHub PR #{pr.number}",
            )
        )

    # Confirmed failing CI
    for run in failed_workflows[:3]:
        workflow_name = run.get("name", "GitHub Actions workflow")
        branch = run.get("head_branch", "unknown branch")
        blockers.append(
            Blocker(
                issue=f"{workflow_name} has a failed CI run on {branch}.",
                severity="high",
                source="GitHub Actions",
            )
        )

    # Open issues are risks unless there is stronger evidence they are blockers
    if open_issue_count > 0:
        risks.append(
            Risk(
                description=(
                    f"GitHub reports {open_issue_count} open issue(s) for {repo_name}. "
                    "Their individual priority and impact should be reviewed."
                ),
                confidence="medium",
                severity="medium" if open_issue_count < 10 else "high",
                potential_impact=(
                    "Unaddressed issues may increase maintenance load, delay planned work, "
                    "or introduce unresolved technical debt."
                ),
            )
        )

    # Open PRs are predictive risks, not automatically blockers
    if open_prs:
        risks.append(
            Risk(
                description=(
                    f"{len(open_prs)} open pull request(s) are currently visible in the "
                    "supplied GitHub activity."
                ),
                confidence="medium",
                severity="medium",
                potential_impact=(
                    "Pending reviews or merges could delay dependent development and releases."
                ),
            )
        )

    if failed_workflows:
        risks.append(
            Risk(
                description=(
                    f"{len(failed_workflows)} recent GitHub Actions workflow run(s) "
                    "reported failure, timeout, or cancellation."
                ),
                confidence="high",
                severity="high",
                potential_impact=(
                    "Continued CI instability can delay merges and reduce release confidence."
                ),
            )
        )

    # Repository-specific next steps
    if changes_requested_prs:
        next_steps.append(
            f"Address requested changes on PR #{changes_requested_prs[0].number} "
            "and request another review."
        )

    if failing_prs:
        next_steps.append(
            f"Investigate failing CI associated with PR #{failing_prs[0].number} "
            "before merging."
        )

    if failed_workflows:
        next_steps.append(
            "Review the latest failed GitHub Actions runs and restore a passing CI pipeline."
        )

    if open_prs and len(next_steps) < 3:
        next_steps.append(
            "Review the remaining open pull requests and prioritize dependencies."
        )

    if open_issue_count > 0 and len(next_steps) < 3:
        next_steps.append(
            "Prioritize the highest-impact open GitHub issues before the next release cycle."
        )

    if len(next_steps) < 3:
        next_steps.append(
            f"Continue monitoring recent activity on the {default_branch} branch."
        )

    # Conservative deterministic health score.
    health_score = 85

    health_score -= min(len(changes_requested_prs) * 8, 20)
    health_score -= min(len(failing_prs) * 12, 25)
    health_score -= min(len(failed_workflows) * 10, 25)

    if open_prs:
        health_score -= min(len(open_prs) * 2, 10)

    if open_issue_count >= 20:
        health_score -= 10
    elif open_issue_count >= 10:
        health_score -= 5

    health_score = max(35, min(95, health_score))

    if health_score >= 85:
        verdict = "Healthy · On Track"
    elif health_score >= 70:
        verdict = "On Track · Monitor"
    elif health_score >= 50:
        verdict = "Moderate Risk · Needs Attention"
    else:
        verdict = "Critical · Action Required"

    if blockers:
        progress = (
            f"{repo_name} shows active engineering work across recent commits and "
            f"pull requests, but {len(blockers)} evidence-backed issue(s) require attention."
        )
    else:
        progress = (
            f"{repo_name} shows active development with no confirmed blocking issue "
            "identified from the supplied GitHub activity."
        )

    blocker_summary = (
        f"{len(blockers)} confirmed blocker(s) were identified from GitHub evidence."
        if blockers
        else "No confirmed blockers were identified from the supplied GitHub evidence."
    )

    email_lines = [
        f"Hello Project Stakeholders,",
        "",
        f"Here is the automated GitHub status update for {repo_name}.",
        "",
        f"PROJECT HEALTH: {health_score} / 100 ({verdict})",
        "",
        "ACTIVITY:",
        f"• Recent commits analyzed: {len(commits)}",
        f"• Pull requests analyzed: {len(prs)}",
        f"• Open pull requests: {len(open_prs)}",
        f"• Open GitHub issues: {open_issue_count}",
        f"• Failed CI runs detected: {len(failed_workflows)}",
        "",
        "KEY FINDINGS:",
    ]

    for item in achievements[:4]:
        email_lines.append(f"• {item}")

    email_lines.extend(["", "BLOCKERS:"])

    if blockers:
        for index, blocker in enumerate(blockers[:5], start=1):
            email_lines.append(
                f"{index}. {blocker.issue} [{blocker.source}]"
            )
    else:
        email_lines.append("• No confirmed blockers identified from the supplied data.")

    email_lines.extend(["", "NEXT STEPS:"])

    for item in next_steps[:4]:
        email_lines.append(f"• {item}")

    email_lines.extend(
        [
            "",
            "This report was generated automatically from the supplied GitHub evidence.",
            "",
            "Best regards,",
            "AutoPM Automated Executive Engine",
        ]
    )

    return ReportResponse(
        project_name=payload.project_name,
        week_range=payload.week_range,
        project_health=health_score,
        health_verdict=verdict,
        executive_summary=ExecutiveSummary(
            progress=progress,
            achievements=achievements[:4],
            next_steps=next_steps[:4],
        ),
        blockers=blockers[:5],
        risks=risks[:5],
        email=StakeholderEmail(
            subject=f"[GitHub Status] {repo_name} · {verdict}",
            body="\\n".join(email_lines),
        ),
        time_saved=TimeSavedMetric(),
        mode="demo_fallback",
        provider_used="Deterministic Repository Engine",
        generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
    )

def _clean_json_str(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text

async def call_openrouter_llm(prompt: str) -> dict:
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AutoPM Status Reporter"
    }
    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }
    async with httpx.AsyncClient(timeout=35.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        return json.loads(_clean_json_str(content))

async def call_openai_llm(prompt: str) -> dict:
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": settings.OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        return json.loads(_clean_json_str(content))

async def call_anthropic_llm(prompt: str) -> dict:
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": settings.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    payload = {
        "model": settings.ANTHROPIC_MODEL,
        "max_tokens": 3000,
        "system": SYSTEM_PROMPT,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        text = data["content"][0]["text"].strip()
        return json.loads(_clean_json_str(text))

async def generate_project_report(payload: DemoDataPayload) -> ReportResponse:
    has_openrouter = bool(settings.OPENROUTER_API_KEY and len(settings.OPENROUTER_API_KEY) > 10)
    has_openai = bool(settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"))
    has_anthropic = bool(settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_API_KEY.startswith("sk-ant-"))

    if settings.FORCE_DEMO_MODE or (not has_openrouter and not has_openai and not has_anthropic):
        logger.info("Using reliable fallback demo engine.")
        return generate_fallback_report(payload)

    user_prompt = build_user_prompt(payload)

    try:
        if has_openrouter:
            logger.info("Calling OpenRouter API...")
            raw_json = await call_openrouter_llm(user_prompt)
            provider_name = f"OpenRouter ({settings.OPENROUTER_MODEL})"
        elif settings.AI_PROVIDER == "anthropic" and has_anthropic:
            logger.info("Calling Anthropic Claude API...")
            raw_json = await call_anthropic_llm(user_prompt)
            provider_name = f"Anthropic ({settings.ANTHROPIC_MODEL})"
        elif has_openai:
            logger.info("Calling OpenAI API...")
            raw_json = await call_openai_llm(user_prompt)
            provider_name = f"OpenAI ({settings.OPENAI_MODEL})"
        elif has_anthropic:
            logger.info("Calling Anthropic Claude API...")
            raw_json = await call_anthropic_llm(user_prompt)
            provider_name = f"Anthropic ({settings.ANTHROPIC_MODEL})"
        else:
            return generate_fallback_report(payload)

        # Validate with Pydantic
        exec_summary = ExecutiveSummary(**raw_json.get("executive_summary", {}))
        blockers = [Blocker(**b) for b in raw_json.get("blockers", [])]
        risks = [Risk(**r) for r in raw_json.get("risks", [])]
        email = StakeholderEmail(**raw_json.get("email", {}))
        health_score = int(raw_json.get("project_health", 80))
        verdict = raw_json.get("health_verdict", "Moderate Risk · Action Required")

        return ReportResponse(
            project_name=payload.project_name,
            week_range=payload.week_range,
            project_health=max(0, min(100, health_score)),
            health_verdict=verdict,
            executive_summary=exec_summary,
            blockers=blockers,
            risks=risks,
            email=email,
            time_saved=TimeSavedMetric(),
            mode="ai_generated",
            provider_used=provider_name,
            generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        )
    except Exception as e:
        logger.error(f"LLM generation error ({e}). Gracefully falling back to deterministic demo report.")
        fallback = generate_fallback_report(payload)
        fallback.provider_used = f"Fallback (LLM Error: {str(e)[:40]}...)"
        return fallback
