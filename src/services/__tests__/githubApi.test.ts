import { githubApi, GitHubApiError } from "../githubApi";

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("githubApi", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("searchUsers", () => {
    it("searches users successfully", async () => {
      const mockResponse = {
        total_count: 2,
        incomplete_results: false,
        items: [
          {
            id: 1,
            login: "testuser1",
            avatar_url: "https://avatar1.com",
            html_url: "https://github.com/testuser1",
            type: "User",
          },
          {
            id: 2,
            login: "testuser2",
            avatar_url: "https://avatar2.com",
            html_url: "https://github.com/testuser2",
            type: "User",
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await githubApi.searchUsers("test");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/search/users?q=test&per_page=5",
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      expect(result).toEqual(mockResponse.items);
    });

    it("returns empty array for empty query", async () => {
      const result = await githubApi.searchUsers("");
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("returns empty array for whitespace query", async () => {
      const result = await githubApi.searchUsers("   ");
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("handles API errors", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
          json: async () => ({ message: "Rate limit exceeded" }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
          json: async () => ({ message: "Rate limit exceeded" }),
        } as Response);

      await expect(githubApi.searchUsers("test")).rejects.toThrow(
        GitHubApiError
      );

      try {
        await githubApi.searchUsers("test");
      } catch (error) {
        expect(error).toBeInstanceOf(GitHubApiError);
        expect((error as GitHubApiError).message).toBe("Rate limit exceeded");
        expect((error as GitHubApiError).status).toBe(403);
      }
    });

    it("handles network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(githubApi.searchUsers("test")).rejects.toThrow(
        GitHubApiError
      );
      await expect(githubApi.searchUsers("test")).rejects.toThrow(
        "Failed to search users. Please check your connection."
      );
    });

    it("uses custom limit parameter", async () => {
      const mockResponse = {
        total_count: 0,
        incomplete_results: false,
        items: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await githubApi.searchUsers("test", 10);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/search/users?q=test&per_page=10",
        expect.any(Object)
      );
    });
  });

  describe("getUserRepositories", () => {
    it("fetches user repositories successfully", async () => {
      const mockRepos = [
        {
          id: 1,
          name: "repo1",
          full_name: "testuser/repo1",
          description: "Test repository 1",
          html_url: "https://github.com/testuser/repo1",
          stargazers_count: 10,
          forks_count: 5,
          language: "JavaScript",
          updated_at: "2023-01-01T00:00:00Z",
          topics: ["react", "typescript"],
          private: false,
          fork: false,
          watchers_count: 10,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepos,
      } as Response);

      const result = await githubApi.getUserRepositories("testuser");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/users/testuser/repos?sort=updated&direction=desc",
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      expect(result).toEqual(mockRepos);
    });

    it("returns empty array for empty username", async () => {
      const result = await githubApi.getUserRepositories("");
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("handles API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Not Found" }),
      } as Response);

      await expect(
        githubApi.getUserRepositories("nonexistent")
      ).rejects.toThrow(GitHubApiError);
    });
  });

  describe("getUser", () => {
    it("fetches user details successfully", async () => {
      const mockUser = {
        id: 1,
        login: "testuser",
        avatar_url: "https://avatar.com",
        html_url: "https://github.com/testuser",
        type: "User",
        name: "Test User",
        bio: "A test user",
        public_repos: 10,
        followers: 100,
        following: 50,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const result = await githubApi.getUser("testuser");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/users/testuser",
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      expect(result).toEqual(mockUser);
    });

    it("throws error for empty username", async () => {
      await expect(githubApi.getUser("")).rejects.toThrow(GitHubApiError);
      await expect(githubApi.getUser("")).rejects.toThrow(
        "Username is required"
      );
    });

    it("handles API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Not Found" }),
      } as Response);

      await expect(githubApi.getUser("nonexistent")).rejects.toThrow(
        GitHubApiError
      );
    });
  });
});
