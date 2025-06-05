import {
  GitHubUser,
  GitHubRepository,
  GitHubSearchUsersResponse,
  GitHubApiError as GitHubApiErrorType,
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

    const url = `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(
      username
    )}/repos?sort=updated&direction=desc`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      });

      return handleResponse<GitHubRepository[]>(response);
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
};

export { GitHubApiError };
