from schemas import DemoDataPayload, SlackMessage, GitHubPR, GitHubCommit

RAW_DEMO_DATA: DemoDataPayload = DemoDataPayload(
    project_name="Project Nova (Q4 Cloud Platform & Billing Migration)",
    week_range="Week 40 · Oct 01 - Oct 07, 2026",
    slack_messages=[
        SlackMessage(
            id="msg-101",
            channel="#eng-core",
            author="Dave Miller",
            author_role="Staff Backend Eng",
            timestamp="Monday 09:42 AM",
            text="Heads up team: the Postgres 16 database migration is failing repeatedly on staging with error 500 (lock timeout on accounts table). Rollback triggered automatically.",
            avatar_color="#ef4444"
        ),
        SlackMessage(
            id="msg-102",
            channel="#product-sync",
            author="Sarah Chen",
            author_role="Lead Product Manager",
            timestamp="Monday 11:15 AM",
            text="Still waiting on enterprise client sign-off for the custom invoice tax schema. Sent follow-up email #3 to ACME Corp legal.",
            avatar_color="#f59e0b"
        ),
        SlackMessage(
            id="msg-103",
            channel="#eng-core",
            author="Priya Patel",
            author_role="Senior Frontend Eng",
            timestamp="Tuesday 02:20 PM",
            text="We cannot finish the checkout UI flow until the v2 billing API endpoints in PR #142 are merged and unblocked. Currently mocking responses locally.",
            avatar_color="#e11d48"
        ),
        SlackMessage(
            id="msg-104",
            channel="#payments-squad",
            author="Alex Rivera",
            author_role="Fintech Tech Lead",
            timestamp="Wednesday 10:05 AM",
            text="Great news! Payment gateway sandbox end-to-end testing finally passed with 100% test coverage (Stripe + Adyen zero-downtime failover).",
            avatar_color="#10b981"
        ),
        SlackMessage(
            id="msg-105",
            channel="#ops-alerts",
            author="DevOps Bot",
            author_role="Automated Bot",
            timestamp="Wednesday 04:30 PM",
            text="ALERT: Deployment to us-east-2 cluster is still unstable. 2 pod crashloops detected in auth-service container. Auto-reverted to v2.4.1.",
            avatar_color="#ef4444"
        ),
        SlackMessage(
            id="msg-106",
            channel="#sec-ops",
            author="Marcus Vance",
            author_role="Security Architect",
            timestamp="Thursday 01:10 PM",
            text="SOC2 audit remediation completed for OAuth token rotation! All PRs approved and security checklist 100% green.",
            avatar_color="#3b82f6"
        ),
        SlackMessage(
            id="msg-107",
            channel="#eng-core",
            author="Dave Miller",
            author_role="Staff Backend Eng",
            timestamp="Thursday 03:45 PM",
            text="Opened hotfix PR #148 for the DB migration lock timeout. Splitting the batch into 10k chunk transactions to avoid locking accounts.",
            avatar_color="#8b5cf6"
        ),
        SlackMessage(
            id="msg-108",
            channel="#product-sync",
            author="Elena Rostova",
            author_role="UX Lead",
            timestamp="Thursday 05:22 PM",
            text="Completed responsive mobile UI overhaul for customer billing dashboard. All Figma design tokens sync complete.",
            avatar_color="#ec4899"
        ),
        SlackMessage(
            id="msg-109",
            channel="#ops-alerts",
            author="DevOps Bot",
            author_role="Automated Bot",
            timestamp="Friday 09:12 AM",
            text="K8s cluster memory utilization stabilized below 45% following Redis caching cache-warm optimization.",
            avatar_color="#10b981"
        ),
        SlackMessage(
            id="msg-110",
            channel="#eng-core",
            author="Kenji Sato",
            author_role="QA Lead",
            timestamp="Friday 11:30 AM",
            text="Regression test suite run #89 finished: 480 passed, 2 failed (both related to unstable auth-service pod restarts).",
            avatar_color="#f59e0b"
        ),
    ],
    github_prs=[
        GitHubPR(
            id="pr-140",
            number=140,
            title="feat(payments): integrate Stripe & Adyen dual gateway with zero-downtime routing",
            author="arivera",
            status="merged",
            branch="feat/payment-gateway-v2",
            created_at="3 days ago",
            comments_count=14
        ),
        GitHubPR(
            id="pr-142",
            number=142,
            title="feat(api): v2 billing invoice & tax calculation endpoints",
            author="dmiller",
            status="changes_requested",
            branch="feat/billing-endpoints-v2",
            created_at="4 days ago",
            comments_count=23
        ),
        GitHubPR(
            id="pr-145",
            number=145,
            title="sec(auth): implement strict SOC2 OAuth token refresh and rotation policy",
            author="mvance",
            status="merged",
            branch="sec/soc2-token-rotation",
            created_at="2 days ago",
            comments_count=8
        ),
        GitHubPR(
            id="pr-146",
            number=146,
            title="fix(infra): resolve us-east-2 auth-service OOM crashloop",
            author="kdevops",
            status="failing_ci",
            branch="fix/auth-container-limits",
            created_at="1 day ago",
            comments_count=9
        ),
        GitHubPR(
            id="pr-147",
            number=147,
            title="ui(billing): responsive mobile layout and Figma token synchronization",
            author="erostova",
            status="merged",
            branch="ui/billing-mobile-refresh",
            created_at="Yesterday",
            comments_count=5
        ),
        GitHubPR(
            id="pr-148",
            number=148,
            title="fix(db): chunked Postgres 16 migration to eliminate account table locking",
            author="dmiller",
            status="open",
            branch="fix/pg16-migration-chunks",
            created_at="18 hours ago",
            comments_count=12
        ),
    ],
    github_commits=[
        GitHubCommit(
            id="c-7a91",
            hash="7a91bf2",
            message="feat: complete dual gateway sandbox tests with 100% coverage",
            author="Alex Rivera",
            timestamp="Wed 09:58 AM",
            branch="feat/payment-gateway-v2"
        ),
        GitHubCommit(
            id="c-4b12",
            hash="4b12c8a",
            message="security: enforce 15-minute token rotation with encrypted Redis backing",
            author="Marcus Vance",
            timestamp="Thu 12:45 PM",
            branch="sec/soc2-token-rotation"
        ),
        GitHubCommit(
            id="c-89de",
            hash="89def41",
            message="fix(migration): break 1.2M row update into 10k batch chunks with cursor",
            author="Dave Miller",
            timestamp="Thu 03:30 PM",
            branch="fix/pg16-migration-chunks"
        ),
        GitHubCommit(
            id="c-12fa",
            hash="12fa709",
            message="ui: sync mobile breakpoints and theme tokens for invoice drawer",
            author="Elena Rostova",
            timestamp="Thu 05:10 PM",
            branch="ui/billing-mobile-refresh"
        ),
        GitHubCommit(
            id="c-99ea",
            hash="99ea312",
            message="perf(cache): add automated pre-warm hook on cluster boot",
            author="DevOps Bot",
            timestamp="Fri 08:45 AM",
            branch="main"
        ),
        GitHubCommit(
            id="c-34bc",
            hash="34bc611",
            message="fix(k8s): bump memory request to 1.5Gi for auth-service daemon",
            author="DevOps Lead",
            timestamp="Fri 10:15 AM",
            branch="fix/auth-container-limits"
        ),
        GitHubCommit(
            id="c-55fa",
            hash="55fa908",
            message="test(qa): add end-to-end checkout assertion mocks",
            author="Kenji Sato",
            timestamp="Fri 11:10 AM",
            branch="qa/regression-suite-89"
        ),
        GitHubCommit(
            id="c-66bc",
            hash="66bc229",
            message="chore: update sprint dependency locks and SDK bindings",
            author="Priya Patel",
            timestamp="Fri 01:25 PM",
            branch="main"
        ),
    ]
)

def get_demo_payload() -> DemoDataPayload:
    return RAW_DEMO_DATA
