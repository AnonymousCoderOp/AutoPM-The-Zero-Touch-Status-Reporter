import { DemoDataPayload, HealthResponse, ReportResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const FALLBACK_DEMO_DATA: DemoDataPayload = {
  project_name: "Project Nova (Q4 Cloud Platform & Billing Migration)",
  week_range: "Week 40 · Oct 01 - Oct 07, 2026",
  slack_messages: [
    {
      id: "msg-101",
      channel: "#eng-core",
      author: "Dave Miller",
      author_role: "Staff Backend Eng",
      timestamp: "Monday 09:42 AM",
      text: "Heads up team: the Postgres 16 database migration is failing repeatedly on staging with error 500 (lock timeout on accounts table). Rollback triggered automatically.",
      avatar_color: "#ef4444",
    },
    {
      id: "msg-102",
      channel: "#product-sync",
      author: "Sarah Chen",
      author_role: "Lead Product Manager",
      timestamp: "Monday 11:15 AM",
      text: "Still waiting on enterprise client sign-off for the custom invoice tax schema. Sent follow-up email #3 to ACME Corp legal.",
      avatar_color: "#f59e0b",
    },
    {
      id: "msg-103",
      channel: "#eng-core",
      author: "Priya Patel",
      author_role: "Senior Frontend Eng",
      timestamp: "Tuesday 02:20 PM",
      text: "We cannot finish the checkout UI flow until the v2 billing API endpoints in PR #142 are merged and unblocked. Currently mocking responses locally.",
      avatar_color: "#e11d48",
    },
    {
      id: "msg-104",
      channel: "#payments-squad",
      author: "Alex Rivera",
      author_role: "Fintech Tech Lead",
      timestamp: "Wednesday 10:05 AM",
      text: "Great news! Payment gateway sandbox end-to-end testing finally passed with 100% test coverage (Stripe + Adyen zero-downtime failover).",
      avatar_color: "#10b981",
    },
    {
      id: "msg-105",
      channel: "#ops-alerts",
      author: "DevOps Bot",
      author_role: "Automated Bot",
      timestamp: "Wednesday 04:30 PM",
      text: "ALERT: Deployment to us-east-2 cluster is still unstable. 2 pod crashloops detected in auth-service container. Auto-reverted to v2.4.1.",
      avatar_color: "#ef4444",
    },
    {
      id: "msg-106",
      channel: "#sec-ops",
      author: "Marcus Vance",
      author_role: "Security Architect",
      timestamp: "Thursday 01:10 PM",
      text: "SOC2 audit remediation completed for OAuth token rotation! All PRs approved and security checklist 100% green.",
      avatar_color: "#3b82f6",
    },
    {
      id: "msg-107",
      channel: "#eng-core",
      author: "Dave Miller",
      author_role: "Staff Backend Eng",
      timestamp: "Thursday 03:45 PM",
      text: "Opened hotfix PR #148 for the DB migration lock timeout. Splitting the batch into 10k chunk transactions to avoid locking accounts.",
      avatar_color: "#8b5cf6",
    },
    {
      id: "msg-108",
      channel: "#product-sync",
      author: "Elena Rostova",
      author_role: "UX Lead",
      timestamp: "Thursday 05:22 PM",
      text: "Completed responsive mobile UI overhaul for customer billing dashboard. All Figma design tokens sync complete.",
      avatar_color: "#ec4899",
    },
    {
      id: "msg-109",
      channel: "#ops-alerts",
      author: "DevOps Bot",
      author_role: "Automated Bot",
      timestamp: "Friday 09:12 AM",
      text: "K8s cluster memory utilization stabilized below 45% following Redis caching cache-warm optimization.",
      avatar_color: "#10b981",
    },
    {
      id: "msg-110",
      channel: "#eng-core",
      author: "Kenji Sato",
      author_role: "QA Lead",
      timestamp: "Friday 11:30 AM",
      text: "Regression test suite run #89 finished: 480 passed, 2 failed (both related to unstable auth-service pod restarts).",
      avatar_color: "#f59e0b",
    },
  ],
  github_prs: [
    {
      id: "pr-140",
      number: 140,
      title: "feat(payments): integrate Stripe & Adyen dual gateway with zero-downtime routing",
      author: "arivera",
      status: "merged",
      branch: "feat/payment-gateway-v2",
      created_at: "3 days ago",
      comments_count: 14,
    },
    {
      id: "pr-142",
      number: 142,
      title: "feat(api): v2 billing invoice & tax calculation endpoints",
      author: "dmiller",
      status: "changes_requested",
      branch: "feat/billing-endpoints-v2",
      created_at: "4 days ago",
      comments_count: 23,
    },
    {
      id: "pr-145",
      number: 145,
      title: "sec(auth): implement strict SOC2 OAuth token refresh and rotation policy",
      author: "mvance",
      status: "merged",
      branch: "sec/soc2-token-rotation",
      created_at: "2 days ago",
      comments_count: 8,
    },
    {
      id: "pr-146",
      number: 146,
      title: "fix(infra): resolve us-east-2 auth-service OOM crashloop",
      author: "kdevops",
      status: "failing_ci",
      branch: "fix/auth-container-limits",
      created_at: "1 day ago",
      comments_count: 9,
    },
    {
      id: "pr-147",
      number: 147,
      title: "ui(billing): responsive mobile layout and Figma token synchronization",
      author: "erostova",
      status: "merged",
      branch: "ui/billing-mobile-refresh",
      created_at: "Yesterday",
      comments_count: 5,
    },
    {
      id: "pr-148",
      number: 148,
      title: "fix(db): chunked Postgres 16 migration to eliminate account table locking",
      author: "dmiller",
      status: "open",
      branch: "fix/pg16-migration-chunks",
      created_at: "18 hours ago",
      comments_count: 12,
    },
  ],
  github_commits: [
    {
      id: "c-7a91",
      hash: "7a91bf2",
      message: "feat: complete dual gateway sandbox tests with 100% coverage",
      author: "Alex Rivera",
      timestamp: "Wed 09:58 AM",
      branch: "feat/payment-gateway-v2",
    },
    {
      id: "c-4b12",
      hash: "4b12c8a",
      message: "security: enforce 15-minute token rotation with encrypted Redis backing",
      author: "Marcus Vance",
      timestamp: "Thu 12:45 PM",
      branch: "sec/soc2-token-rotation",
    },
    {
      id: "c-89de",
      hash: "89def41",
      message: "fix(migration): break 1.2M row update into 10k batch chunks with cursor",
      author: "Dave Miller",
      timestamp: "Thu 03:30 PM",
      branch: "fix/pg16-migration-chunks",
    },
    {
      id: "c-12fa",
      hash: "12fa709",
      message: "ui: sync mobile breakpoints and theme tokens for invoice drawer",
      author: "Elena Rostova",
      timestamp: "Thu 05:10 PM",
      branch: "ui/billing-mobile-refresh",
    },
    {
      id: "c-99ea",
      hash: "99ea312",
      message: "perf(cache): add automated pre-warm hook on cluster boot",
      author: "DevOps Bot",
      timestamp: "Fri 08:45 AM",
      branch: "main",
    },
    {
      id: "c-34bc",
      hash: "34bc611",
      message: "fix(k8s): bump memory request to 1.5Gi for auth-service daemon",
      author: "DevOps Lead",
      timestamp: "Fri 10:15 AM",
      branch: "fix/auth-container-limits",
    },
    {
      id: "c-55fa",
      hash: "55fa908",
      message: "test(qa): add end-to-end checkout assertion mocks",
      author: "Kenji Sato",
      timestamp: "Fri 11:10 AM",
      branch: "qa/regression-suite-89",
    },
    {
      id: "c-66bc",
      hash: "66bc229",
      message: "chore: update sprint dependency locks and SDK bindings",
      author: "Priya Patel",
      timestamp: "Fri 01:25 PM",
      branch: "main",
    },
  ],
};

export const FALLBACK_REPORT_DATA: ReportResponse = {
  project_name: "Project Nova (Q4 Cloud Platform & Billing Migration)",
  week_range: "Week 40 · Oct 01 - Oct 07, 2026",
  project_health: 78,
  health_verdict: "Moderate Risk · Action Required",
  executive_summary: {
    progress:
      "Solid momentum on core platform milestones with Stripe/Adyen dual gateway passing 100% sandbox tests and SOC2 token rotation merged. However, overall release readiness is bottlenecked by Postgres 16 table lock timeouts on staging and pending v2 billing API review.",
    achievements: [
      "Payment Gateway v2: Completed Stripe & Adyen dual gateway with 100% sandbox test coverage (PR #140 merged).",
      "Security & Compliance: Implemented strict SOC2 OAuth token refresh & 15-min rotation with Redis backing (PR #145 merged).",
      "UI Refresh: Completed responsive mobile billing overhaul with Figma design token synchronization (PR #147 merged).",
      "Infra Optimization: Stabilized cluster memory footprint below 45% using automated pre-warm cache hooks.",
    ],
    next_steps: [
      "Merge and validate DB chunked migration hotfix (PR #148) in staging environment.",
      "Complete code review for PR #142 (v2 billing endpoints) to unblock frontend checkout team.",
      "Resolve auth-service container memory limits (PR #146) to eliminate pod crashloops in us-east-2.",
      "Escalate ACME Corp legal follow-up for custom invoice tax schema sign-off.",
    ],
  },
  blockers: [
    {
      issue:
        "Staging Postgres 16 database migration failing repeatedly due to account table lock timeouts (Error 500).",
      severity: "high",
      source: "#eng-core / PR #148",
    },
    {
      issue:
        "Frontend checkout UI development blocked waiting on v2 billing API endpoints (PR #142 changes requested).",
      severity: "high",
      source: "#eng-core / PR #142",
    },
    {
      issue:
        "Awaiting client sign-off from ACME Corp legal on custom invoice tax schema specifications.",
      severity: "medium",
      source: "#product-sync",
    },
  ],
  risks: [
    {
      description:
        "Unstable deployment in us-east-2 cluster with recurring auth-service pod crashloops and failing CI in PR #146.",
      confidence: "high",
      severity: "high",
      potential_impact:
        "Authentication downtime or cascading failure during next production release cycle if container memory limits are not remediated.",
    },
    {
      description:
        "Late enterprise client sign-off on tax calculation schema may delay end-to-end billing rollout past sprint target.",
      confidence: "medium",
      severity: "medium",
      potential_impact:
        "Sprint scope reduction or deferred release date for enterprise billing tier.",
    },
  ],
  email: {
    subject: "[Weekly Update] Project Nova – Week 40 Status, Wins & Blocker Actions",
    body: `Hello Leadership & Project Stakeholders,

Here is your automated weekly executive summary for Project Nova (Week 40):

📊 PROJECT HEALTH: 78 / 100 (Moderate Risk · Action Required)

🚀 KEY ACHIEVEMENTS THIS WEEK:
• Payment Infrastructure: Dual-gateway (Stripe + Adyen) routing completed with 100% sandbox test coverage.
• Compliance & Security: SOC2 token rotation with Redis backing merged and approved.
• User Experience: Mobile billing refresh completed with synced Figma design tokens.
• Performance: Memory utilization optimized below 45% on the primary cluster.

⚠️ CRITICAL BLOCKERS UNDER ACTIVE REMEDIATION:
1. DB Migration: Postgres 16 lock timeout on staging. Hotfix PR #148 with 10k batch chunking is currently in review.
2. Checkout Integration: Frontend checkout is blocked on PR #142 (v2 billing API). Review prioritized for today.
3. Client Approval: 3rd follow-up sent to ACME Corp legal for custom tax schema sign-off.

🔍 MONITORED RISKS:
• Auth-service pod restarts in us-east-2 (PR #146 failing CI): DevOps team actively adjusting memory limits.

📅 PLANNED NEXT STEPS:
• Deploy PR #148 hotfix to staging and rerun DB verification.
• Unblock frontend checkout team upon PR #142 merge.
• Re-run full regression test suite #90 following auth-service stabilization.

Best regards,
AutoPM Automated Executive Engine
(Generated automatically for Friday Project Review)`,
  },
  time_saved: {
    manual_minutes: 100,
    automated_seconds: 1.8,
    minutes_saved: 99,
    hours_saved_week: 6.5,
    breakdown: {
      collect_updates_mins: 20,
      review_github_mins: 25,
      write_summary_mins: 35,
      prepare_email_mins: 20,
    },
  },
  mode: "demo_fallback",
  provider_used: "Deterministic Engine (Demo Mode)",
  generated_at: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
  automation_schedule: {
    cadence: "Every Friday · 4:00 PM",
    status: "Active",
    last_run: "Friday, 4:00 PM",
    next_run: "Upcoming Friday, 4:00 PM",
    target_recipients: ["leadership@nova.corp", "eng-leads@nova.corp", "product-ops@nova.corp"],
  },
};

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
    if (!res.ok) throw new Error("Health check failed");
    return await res.json();
  } catch {
    return {
      status: "offline",
      service: "AutoPM Client Fallback",
      ai_provider: "demo-fallback",
      has_api_key: false,
      demo_mode_active: true,
    };
  }
}

export async function fetchDemoData(): Promise<DemoDataPayload> {
  try {
    const res = await fetch(`${API_BASE_URL}/demo-data`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch demo data");
    return await res.json();
  } catch {
    return FALLBACK_DEMO_DATA;
  }
}

export async function generateReport(payload?: DemoDataPayload): Promise<ReportResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/generate-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    if (!res.ok) throw new Error("Report generation failed");
    return await res.json();
  } catch {
    // Artificial mini delay to make the zero-touch loading feel realistic
    await new Promise((r) => setTimeout(r, 600));
    return {
      ...FALLBACK_REPORT_DATA,
      generated_at: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
    };
  }
}
export async function analyzeRepository(
  repositoryUrl: string
): Promise<ReportResponse> {
  const res = await fetch(`${API_BASE_URL}/analyze-repository`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repository_url: repositoryUrl,
    }),
  });

  if (!res.ok) {
    let message = "Repository analysis failed";

    try {
      const errorData = await res.json();

      if (errorData?.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return await res.json();
}