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
        "https://api.github.com/users/testuser/repos?sort=updated&direction=desc&per_page=100&page=1",
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      expect(result).toEqual(mockRepos);
    });

    it("fetches all repositories with pagination", async () => {
      const firstPageRepos = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `repo${i + 1}`,
        full_name: `testuser/repo${i + 1}`,
        description: `Test repository ${i + 1}`,
        html_url: `https://github.com/testuser/repo${i + 1}`,
        stargazers_count: i,
        forks_count: i,
        language: "JavaScript",
        updated_at: "2023-01-01T00:00:00Z",
        topics: [],
        private: false,
        fork: false,
        watchers_count: i,
      }));

      const secondPageRepos = Array.from({ length: 50 }, (_, i) => ({
        id: i + 101,
        name: `repo${i + 101}`,
        full_name: `testuser/repo${i + 101}`,
        description: `Test repository ${i + 101}`,
        html_url: `https://github.com/testuser/repo${i + 101}`,
        stargazers_count: i,
        forks_count: i,
        language: "TypeScript",
        updated_at: "2023-01-01T00:00:00Z",
        topics: [],
        private: false,
        fork: false,
        watchers_count: i,
      }));

      // Mock first page (full 100 repos)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => firstPageRepos,
      } as Response);

      // Mock second page (50 repos, indicating end of pagination)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => secondPageRepos,
      } as Response);

      const result = await githubApi.getUserRepositories("testuser");

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "https://api.github.com/users/testuser/repos?sort=updated&direction=desc&per_page=100&page=1",
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "https://api.github.com/users/testuser/repos?sort=updated&direction=desc&per_page=100&page=2",
        expect.any(Object)
      );
      expect(result).toEqual([...firstPageRepos, ...secondPageRepos]);
    });

    it("stops pagination when empty page is returned", async () => {
      const firstPageRepos = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `repo${i + 1}`,
        full_name: `testuser/repo${i + 1}`,
        description: `Test repository ${i + 1}`,
        html_url: `https://github.com/testuser/repo${i + 1}`,
        stargazers_count: i,
        forks_count: i,
        language: "JavaScript",
        updated_at: "2023-01-01T00:00:00Z",
        topics: [],
        private: false,
        fork: false,
        watchers_count: i,
      }));

      // Mock first page
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => firstPageRepos,
      } as Response);

      // Mock second page (empty, indicating end)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await githubApi.getUserRepositories("testuser");

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(firstPageRepos);
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

  describe("getUserEvents", () => {
    it("fetches user events successfully", async () => {
      const mockEvents = [
        {
          id: "event1",
          type: "PushEvent",
          created_at: "2023-01-01T00:00:00Z",
          repo: {
            id: 1,
            name: "testuser/repo1",
            url: "https://api.github.com/repos/testuser/repo1",
          },
          payload: {
            commits: [
              { sha: "abc123", message: "Initial commit" },
              { sha: "def456", message: "Add feature" },
            ],
          },
        },
        {
          id: "event2",
          type: "PullRequestEvent",
          created_at: "2023-01-02T00:00:00Z",
          repo: {
            id: 2,
            name: "testuser/repo2",
            url: "https://api.github.com/repos/testuser/repo2",
          },
          payload: {
            action: "opened",
            pull_request: { id: 1, title: "Add new feature" },
          },
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents,
      } as Response);

      const result = await githubApi.getUserEvents("testuser");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/users/testuser/events/public?per_page=100",
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      expect(result).toEqual(mockEvents);
    });

    it("returns empty array for empty username", async () => {
      const result = await githubApi.getUserEvents("");
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("handles API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Not Found" }),
      } as Response);

      await expect(githubApi.getUserEvents("nonexistent")).rejects.toThrow(
        GitHubApiError
      );
    });

    it("handles network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(githubApi.getUserEvents("testuser")).rejects.toThrow(
        GitHubApiError
      );

      // Reset mock and test again for the specific error message
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      try {
        await githubApi.getUserEvents("testuser");
      } catch (error) {
        expect(error).toBeInstanceOf(GitHubApiError);
        expect((error as GitHubApiError).message).toBe(
          "Failed to fetch user events. Please check your connection."
        );
      }
    });
  });

  describe("getUserContributionStats", () => {
    const mockEvents = [
      {
        id: "event1",
        type: "PushEvent",
        created_at: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days ago
        payload: {
          commits: [
            { sha: "abc123", message: "Initial commit" },
            { sha: "def456", message: "Add feature" },
          ],
        },
      },
      {
        id: "event2",
        type: "PullRequestEvent",
        created_at: new Date(
          Date.now() - 60 * 24 * 60 * 60 * 1000
        ).toISOString(), // 60 days ago
        payload: { action: "opened" },
      },
      {
        id: "event3",
        type: "IssuesEvent",
        created_at: new Date(
          Date.now() - 90 * 24 * 60 * 60 * 1000
        ).toISOString(), // 90 days ago
        payload: { action: "opened" },
      },
      {
        id: "event4",
        type: "PushEvent",
        created_at: new Date(
          Date.now() - 400 * 24 * 60 * 60 * 1000
        ).toISOString(), // Over 1 year ago
        payload: {
          commits: [{ sha: "old123", message: "Old commit" }],
        },
      },
    ];

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
        topics: [],
        private: false,
        fork: false,
        watchers_count: 10,
      },
      {
        id: 2,
        name: "repo2",
        full_name: "testuser/repo2",
        description: "Test repository 2",
        html_url: "https://github.com/testuser/repo2",
        stargazers_count: 5,
        forks_count: 2,
        language: "TypeScript",
        updated_at: "2023-01-02T00:00:00Z",
        topics: [],
        private: false,
        fork: false,
        watchers_count: 5,
      },
    ];

    it("calculates contribution stats successfully", async () => {
      // Mock getUserEvents
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents,
      } as Response);

      // Mock getUserRepositories (first page)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepos,
      } as Response);

      const result = await githubApi.getUserContributionStats("testuser");

      expect(result).toEqual({
        totalCommits: 2, // Only commits from events within the last year
        totalPullRequests: 1,
        totalIssues: 1,
        totalRepositories: 2,
        recentActivity: mockEvents.slice(0, 3), // Only events from the last year, limited to 10
      });
    });

    it("handles empty events and repositories", async () => {
      // Mock getUserEvents (empty)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      // Mock getUserRepositories (empty)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await githubApi.getUserContributionStats("testuser");

      expect(result).toEqual({
        totalCommits: 0,
        totalPullRequests: 0,
        totalIssues: 0,
        totalRepositories: 0,
        recentActivity: [],
      });
    });

    it("counts commits correctly from push events", async () => {
      const pushEvents = [
        {
          id: "push1",
          type: "PushEvent",
          created_at: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          payload: {
            commits: [
              { sha: "abc123", message: "Commit 1" },
              { sha: "def456", message: "Commit 2" },
              { sha: "ghi789", message: "Commit 3" },
            ],
          },
        },
        {
          id: "push2",
          type: "PushEvent",
          created_at: new Date(
            Date.now() - 60 * 24 * 60 * 60 * 1000
          ).toISOString(),
          payload: {
            commits: [
              { sha: "jkl012", message: "Commit 4" },
              { sha: "mno345", message: "Commit 5" },
            ],
          },
        },
      ];

      // Mock getUserEvents
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => pushEvents,
      } as Response);

      // Mock getUserRepositories
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await githubApi.getUserContributionStats("testuser");

      expect(result.totalCommits).toBe(5); // 3 + 2 commits
    });

    it("handles push events without commits payload", async () => {
      const pushEventWithoutCommits = [
        {
          id: "push-no-commits",
          type: "PushEvent",
          created_at: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          payload: {}, // No commits
        },
      ];

      // Mock getUserEvents
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => pushEventWithoutCommits,
      } as Response);

      // Mock getUserRepositories
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await githubApi.getUserContributionStats("testuser");

      expect(result.totalCommits).toBe(1); // Should count as 1 when no commits array
    });

    it("limits recent activity to 10 items", async () => {
      const manyEvents = Array.from({ length: 15 }, (_, i) => ({
        id: `event${i}`,
        type: "PushEvent",
        created_at: new Date(
          Date.now() - (i + 1) * 24 * 60 * 60 * 1000
        ).toISOString(),
        payload: { commits: [{ sha: `sha${i}`, message: `Commit ${i}` }] },
      }));

      // Mock getUserEvents
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => manyEvents,
      } as Response);

      // Mock getUserRepositories
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await githubApi.getUserContributionStats("testuser");

      expect(result.recentActivity).toHaveLength(10);
      expect(result.recentActivity).toEqual(manyEvents.slice(0, 10));
    });

    it("throws error for empty username", async () => {
      await expect(githubApi.getUserContributionStats("")).rejects.toThrow(
        GitHubApiError
      );
      await expect(githubApi.getUserContributionStats("")).rejects.toThrow(
        "Username is required"
      );
    });

    it("handles API errors from getUserEvents", async () => {
      // Mock getUserEvents to fail
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: "Rate limit exceeded" }),
      } as Response);

      await expect(
        githubApi.getUserContributionStats("testuser")
      ).rejects.toThrow(GitHubApiError);
    });

    it("handles API errors from getUserRepositories", async () => {
      // Mock getUserEvents to succeed
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      // Mock getUserRepositories to fail
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "Not Found" }),
      } as Response);

      await expect(
        githubApi.getUserContributionStats("testuser")
      ).rejects.toThrow(GitHubApiError);
    });

    it("handles network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        githubApi.getUserContributionStats("testuser")
      ).rejects.toThrow(GitHubApiError);

      // Reset mock and test again for the specific error message
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      try {
        await githubApi.getUserContributionStats("testuser");
      } catch (error) {
        expect(error).toBeInstanceOf(GitHubApiError);
        expect((error as GitHubApiError).message).toBe(
          "Failed to fetch user events. Please check your connection."
        );
      }
    });
  });
});
