export type Severity = "high" | "medium" | "low";

export type Confidence = "high" | "medium" | "low";

export type PRStatus =
  | "merged"
  | "open"
  | "changes_requested"
  | "failing_ci";

export interface SlackMessage {
  id: string;
  channel: string;
  author: string;
  author_role: string;
  timestamp: string;
  text: string;
  avatar_color?: string;
}

export interface GitHubPR {
  id: string;
  number: number;
  title: string;
  author: string;
  status: PRStatus;
  branch: string;
  created_at: string;
  comments_count: number;
}

export interface GitHubCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  branch: string;
}

export interface WorkflowRun {
  id?: number;
  name?: string;
  status?: string;
  conclusion?: string | null;
  branch?: string;
  created_at?: string;
  updated_at?: string;
  html_url?: string;
}

export interface RepositoryContext {
  analysis_type?: string;
  repository?: {
    id?: number;
    name?: string;
    full_name?: string;
  };
  workflow_runs?: WorkflowRun[];
}
export interface DemoDataPayload {
  project_name: string;
  week_range: string;
  slack_messages: SlackMessage[];
  github_prs: GitHubPR[];
  github_commits: GitHubCommit[];

  repository_context?: RepositoryContext;
}
export interface ExecutiveSummary {
  progress: string;
  achievements: string[];
  next_steps: string[];
}

export interface Blocker {
  issue: string;
  severity: Severity;
  source: string;
}

export interface Risk {
  description: string;
  confidence: Confidence;
  severity: Severity;
  potential_impact: string;
}

export interface StakeholderEmail {
  subject: string;
  body: string;
}

export interface TimeSavedMetric {
  manual_minutes: number;
  automated_seconds: number;
  minutes_saved: number;
  hours_saved_week: number;

  breakdown: {
    collect_updates_mins: number;
    review_github_mins: number;
    write_summary_mins: number;
    prepare_email_mins: number;
  };
}

export interface AutomationSchedule {
  cadence: string;
  status: string;
  last_run: string;
  next_run: string;
  target_recipients: string[];
}

export interface ReportResponse {
  project_name: string;
  week_range: string;
  project_health: number;
  health_verdict: string;

  executive_summary: ExecutiveSummary;

  blockers: Blocker[];

  risks: Risk[];

  email: StakeholderEmail;

  time_saved: TimeSavedMetric;

  mode: "ai_generated" | "demo_fallback";

  provider_used: string;

  generated_at: string;

  /*
   * Activity used to generate this report.
   * In GitHub mode this contains the real repository
   * commits and pull requests.
   */
  activity_data?: DemoDataPayload | null;

  automation_schedule?: AutomationSchedule;
}

export interface HealthResponse {
  status: string;
  service: string;
  ai_provider: string;
  has_api_key: boolean;
  demo_mode_active: boolean;
}