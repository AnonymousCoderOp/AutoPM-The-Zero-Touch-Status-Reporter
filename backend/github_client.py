import os

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

GITHUB_API_URL = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")


def get_headers():
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    return headers


def parse_github_url(repository_url: str):
    url = repository_url.strip().rstrip("/")

    if url.endswith(".git"):
        url = url[:-4]

    parts = url.split("/")

    if len(parts) < 2 or parts[-3] != "github.com":
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub repository URL."
        )

    owner = parts[-2]
    repository = parts[-1]

    if not owner or not repository:
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub repository URL."
        )

    return owner, repository


async def github_get(endpoint: str):
    url = f"{GITHUB_API_URL}{endpoint}"

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(
            url,
            headers=get_headers()
        )

    if response.status_code == 404:
        raise HTTPException(
            status_code=404,
            detail=f"GitHub resource not found: {endpoint}"
        )

    if response.status_code == 401:
        raise HTTPException(
            status_code=401,
            detail="GitHub token is invalid or expired."
        )

    if response.status_code == 403:
        remaining = response.headers.get("X-RateLimit-Remaining")
        reset = response.headers.get("X-RateLimit-Reset")

        raise HTTPException(
            status_code=429,
            detail=(
                f"GitHub API access denied. "
                f"Rate limit remaining: {remaining}, "
                f"reset: {reset}, "
                f"response: {response.text}"
            )
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"GitHub API error: {response.text}"
        )

    return response.json()

async def get_repository(owner: str, repository: str):
    return await github_get(
        f"/repos/{owner}/{repository}"
    )


async def get_commits(
    owner: str,
    repository: str,
    per_page: int = 20
):
    return await github_get(
        f"/repos/{owner}/{repository}/commits?per_page={per_page}"
    )

async def get_pull_requests(owner, repository, state="open", per_page=20):
    try:
        return await github_get(
            f"/repos/{owner}/{repository}/pulls?state={state}&per_page={per_page}&sort=updated&direction=desc"
        )
    except HTTPException:
        return []


async def get_recent_pull_requests(owner, repository, per_page=20):
    open_prs = await get_pull_requests(owner, repository, "open", per_page)
    closed_prs = await get_pull_requests(owner, repository, "closed", per_page)

    combined = {}

    for pr in open_prs + closed_prs:
        number = pr.get("number")
        if number is not None:
            combined[number] = pr

    return list(combined.values())

async def get_issues(
    owner: str,
    repository: str,
    state: str = "open",
    per_page: int = 20
):
    issues = await github_get(
        f"/repos/{owner}/{repository}/issues"
        f"?state={state}&per_page={per_page}"
    )

    return [
        issue
        for issue in issues
        if "pull_request" not in issue
    ]


async def get_contributors(
    owner: str,
    repository: str,
    per_page: int = 20
):
    try:
        return await github_get(
            f"/repos/{owner}/{repository}/contributors"
            f"?per_page={per_page}"
        )
    except HTTPException:
        return []


async def get_workflows(owner, repository):
    try:
        data = await github_get(
            f"/repos/{owner}/{repository}/actions/runs?per_page=20"
        )

        workflow_runs = []

        for run in data.get("workflow_runs", []):
            workflow_runs.append({
                "id": run.get("id"),
                "name": run.get("name"),
                "status": run.get("status"),
                "conclusion": run.get("conclusion"),
                "branch": run.get("head_branch"),
                "created_at": run.get("created_at"),
                "updated_at": run.get("updated_at"),
                "html_url": run.get("html_url"),
            })

        return {
            "total_count": data.get("total_count", len(workflow_runs)),
            "workflow_runs": workflow_runs,
        }

    except HTTPException:
        return {"total_count": 0, "workflow_runs": []}

async def get_repository_snapshot(repository_url: str):
    owner, repository = parse_github_url(repository_url)

    repo = await get_repository(owner, repository)
    commits = await get_commits(owner, repository)
    pull_requests = await get_recent_pull_requests(owner, repository)
    issues = await get_issues(owner, repository)
    contributors = await get_contributors(owner, repository)
    workflows = await get_workflows(owner, repository)

    return {
        "repository": repo,
        "commits": commits,
        "pull_requests": pull_requests,
        "issues": issues,
        "contributors": contributors,
        "workflows": workflows,
    }