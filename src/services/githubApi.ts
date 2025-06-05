import {
  GitHubUser,
  GitHubRepository,
  GitHubSearchUsersResponse,
  GitHubApiError as GitHubApiErrorType,
  GitHubEvent,
  GitHubContributionStats,
} from "../types/github";

const GITHUB_API_BASE_URL = "https://api.github.com";

class GitHubApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "GitHubApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: GitHubApiErrorType = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new GitHubApiError(errorData.message, response.status);
  }
  return response.json();
}

export const githubApi = {
  async searchUsers(query: string, limit: number = 5): Promise<GitHubUser[]> {
    if (!query.trim()) {
      return [];
    }

    const url = `${GITHUB_API_BASE_URL}/search/users?q=${encodeURIComponent(
      query
    )}&per_page=${limit}`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      });

      const data = await handleResponse<GitHubSearchUsersResponse>(response);
      return data.items;
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError(
        "Failed to search users. Please check your connection."
      );
    }
  },

  async getUserRepositories(username: string): Promise<GitHubRepository[]> {
    if (!username) {
      return [];
    }

    const allRepositories: GitHubRepository[] = [];
    let page = 1;
    const perPage = 100; // GitHub's maximum per_page value

    try {
      while (true) {
        const url = `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(
          username
        )}/repos?sort=updated&direction=desc&per_page=${perPage}&page=${page}`;

        const response = await fetch(url, {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        });

        const repositories = await handleResponse<GitHubRepository[]>(response);

        // If we get fewer repositories than per_page, we've reached the end
        if (repositories.length === 0) {
          break;
        }

        allRepositories.push(...repositories);

        // If we got less than the full page, we're done
        if (repositories.length < perPage) {
          break;
        }

        page++;
      }

      return allRepositories;
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError(
        "Failed to fetch repositories. Please check your connection."
      );
    }
  },

  async getUser(username: string): Promise<GitHubUser> {
    if (!username) {
      throw new GitHubApiError("Username is required");
    }

    const url = `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      });

      return handleResponse<GitHubUser>(response);
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError(
        "Failed to fetch user details. Please check your connection."
      );
    }
  },

  async getUserEvents(username: string): Promise<GitHubEvent[]> {
    if (!username) {
      return [];
    }

    const url = `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(
      username
    )}/events/public?per_page=100`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      });

      return handleResponse<GitHubEvent[]>(response);
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError(
        "Failed to fetch user events. Please check your connection."
      );
    }
  },

  async getUserContributionStats(
    username: string
  ): Promise<GitHubContributionStats> {
    if (!username) {
      throw new GitHubApiError("Username is required");
    }

    try {
      const events = await this.getUserEvents(username);
      const repositories = await this.getUserRepositories(username);

      // Count different types of contributions from events
      let totalCommits = 0;
      let totalPullRequests = 0;
      let totalIssues = 0;

      // Get events from the last year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const recentEvents = events.filter(
        (event) => new Date(event.created_at) >= oneYearAgo
      );

      recentEvents.forEach((event) => {
        switch (event.type) {
          case "PushEvent":
            // Count commits in push events
            if (event.payload && event.payload.commits) {
              totalCommits += event.payload.commits.length;
            } else {
              // If no commits array, count as 1 commit
              totalCommits += 1;
            }
            break;
          case "PullRequestEvent":
            totalPullRequests++;
            break;
          case "IssuesEvent":
            totalIssues++;
            break;
        }
      });

      return {
        totalCommits,
        totalPullRequests,
        totalIssues,
        totalRepositories: repositories.length,
        recentActivity: recentEvents.slice(0, 10), // Last 10 activities
      };
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError(
        "Failed to fetch contribution statistics. Please check your connection."
      );
    }
  },
};

export { GitHubApiError };
