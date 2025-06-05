export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
  name?: string;
  bio?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo?: {
    id: number;
    name: string;
    url: string;
  };
  payload: any;
}

export interface GitHubContributionStats {
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
  totalRepositories: number;
  recentActivity: GitHubEvent[];
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  topics: string[];
  private: boolean;
  fork: boolean;
}

export interface GitHubSearchUsersResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUser[];
}

export interface GitHubApiError {
  message: string;
  documentation_url?: string;
}
