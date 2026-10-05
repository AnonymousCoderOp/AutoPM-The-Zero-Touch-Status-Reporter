from datetime import datetime, timezone


def analyze_github_snapshot(snapshot: dict) -> dict:
    repo = snapshot.get("repository", {})
    commits = snapshot.get("commits", [])
    pull_requests = snapshot.get("pull_requests", [])
    issues = snapshot.get("issues", [])
    contributors = snapshot.get("contributors", [])
    workflows = snapshot.get("workflows", {})

    # -----------------------------
    # Basic repository metrics
    # -----------------------------

    stars = repo.get("stargazers_count", 0)
    forks = repo.get("forks_count", 0)
    open_issues = repo.get("open_issues_count", 0)

    # -----------------------------
    # Commit metrics
    # -----------------------------

    commit_count = len(commits)

    active_contributors = set()

    for commit in commits:
        author = commit.get("author")

        if author and author.get("login"):
            active_contributors.add(author["login"])

    # -----------------------------
    # Pull request metrics
    # -----------------------------

    open_prs = len(pull_requests)

    # -----------------------------
    # Issue metrics
    # -----------------------------

    active_issues = len(issues)

    # -----------------------------
    # CI / workflow metrics
    # -----------------------------

    workflow_runs = workflows.get("workflow_runs", [])
    total_workflow_runs = len(workflow_runs)

    successful_runs = 0
    failed_runs = 0

    for run in workflow_runs:
        conclusion = run.get("conclusion")

        if conclusion == "success":
            successful_runs += 1

        elif conclusion == "failure":
            failed_runs += 1

    # -----------------------------
    # Health score
    # -----------------------------

    health_score = 100

    # Too many open PRs
    if open_prs >= 10:
        health_score -= 15
    elif open_prs >= 5:
        health_score -= 8

    # Too many open issues
    if active_issues >= 20:
        health_score -= 15
    elif active_issues >= 10:
        health_score -= 8

    # Failed CI
    if failed_runs >= 5:
        health_score -= 20
    elif failed_runs >= 2:
        health_score -= 10

    # Low recent activity
    if commit_count == 0:
        health_score -= 20
    elif commit_count < 3:
        health_score -= 10

    health_score = max(0, min(100, health_score))

    # -----------------------------
    # Verdict
    # -----------------------------

    if health_score >= 80:
        verdict = "Healthy"
    elif health_score >= 60:
        verdict = "Caution"
    else:
        verdict = "At Risk"

    # -----------------------------
    # Return normalized metrics
    # -----------------------------

    return {
        "repository": {
            "name": repo.get("name"),
            "full_name": repo.get("full_name"),
            "description": repo.get("description"),
            "url": repo.get("html_url"),
            "stars": stars,
            "forks": forks,
            "language": repo.get("language"),
        },
        "activity": {
            "commits": commit_count,
            "active_contributors": len(active_contributors),
        },
        "pull_requests": {
            "open": open_prs,
        },
        "issues": {
            "open": active_issues,
        },
        "ci": {
            "workflow_runs": total_workflow_runs,
            "successful": successful_runs,
            "failed": failed_runs,
        },
        "health": {
            "score": health_score,
            "verdict": verdict,
        },
    }
