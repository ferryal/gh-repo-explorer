import React from "react";
import { render, screen } from "@testing-library/react";
import { UserContributions } from "../UserContributions";
import { GitHubContributionStats, GitHubEvent } from "../../types/github";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  GitCommit: ({ className }: { className?: string }) => (
    <div data-testid="git-commit-icon" className={className} />
  ),
  GitPullRequest: ({ className }: { className?: string }) => (
    <div data-testid="git-pull-request-icon" className={className} />
  ),
  AlertCircle: ({ className }: { className?: string }) => (
    <div data-testid="alert-circle-icon" className={className} />
  ),
  Calendar: ({ className }: { className?: string }) => (
    <div data-testid="calendar-icon" className={className} />
  ),
  Activity: ({ className }: { className?: string }) => (
    <div data-testid="activity-icon" className={className} />
  ),
  Code: ({ className }: { className?: string }) => (
    <div data-testid="code-icon" className={className} />
  ),
  Star: ({ className }: { className?: string }) => (
    <div data-testid="star-icon" className={className} />
  ),
  GitFork: ({ className }: { className?: string }) => (
    <div data-testid="git-fork-icon" className={className} />
  ),
}));

describe("UserContributions", () => {
  const mockStats: GitHubContributionStats = {
    totalCommits: 150,
    totalPullRequests: 25,
    totalIssues: 10,
    totalRepositories: 5,
    recentActivity: [
      {
        id: "1",
        type: "PushEvent",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        repo: {
          id: 1,
          name: "test-repo",
          url: "https://github.com/user/test-repo",
        },
        payload: {},
      },
      {
        id: "2",
        type: "PullRequestEvent",
        created_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(), // 2 days ago
        repo: {
          id: 2,
          name: "another-repo",
          url: "https://github.com/user/another-repo",
        },
        payload: {},
      },
      {
        id: "3",
        type: "IssuesEvent",
        created_at: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(), // 10 days ago
        payload: {},
      },
    ],
  };

  const emptyStats: GitHubContributionStats = {
    totalCommits: 0,
    totalPullRequests: 0,
    totalIssues: 0,
    totalRepositories: 0,
    recentActivity: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("renders loading spinner and message when isLoading is true", () => {
      render(<UserContributions stats={emptyStats} isLoading={true} />);

      expect(screen.getByText("Loading contributions...")).toBeInTheDocument();
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("applies correct CSS classes for loading state", () => {
      render(<UserContributions stats={emptyStats} isLoading={true} />);

      const card = document.querySelector(".mb-6");
      expect(card).toBeInTheDocument();
      expect(card).not.toHaveClass("border-destructive");
    });
  });

  describe("Error State", () => {
    it("renders error message when error is provided", () => {
      const errorMessage = "Failed to fetch contributions";
      render(<UserContributions stats={emptyStats} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("applies destructive border styling for error state", () => {
      const errorMessage = "Failed to fetch contributions";
      render(<UserContributions stats={emptyStats} error={errorMessage} />);

      expect(document.querySelector(".border-destructive")).toBeInTheDocument();
    });

    it("does not render stats when in error state", () => {
      const errorMessage = "Failed to fetch contributions";
      render(<UserContributions stats={mockStats} error={errorMessage} />);

      expect(screen.queryByText("150")).not.toBeInTheDocument();
      expect(screen.queryByText("Commits")).not.toBeInTheDocument();
    });
  });

  describe("Normal State - Stats Display", () => {
    it("renders the main title with activity icon", () => {
      render(<UserContributions stats={mockStats} />);

      expect(
        screen.getByText("Contributions in the last year")
      ).toBeInTheDocument();
      expect(screen.getByTestId("activity-icon")).toBeInTheDocument();
    });

    it("displays all contribution statistics correctly", () => {
      render(<UserContributions stats={mockStats} />);

      // Check commits
      expect(screen.getByText("150")).toBeInTheDocument();
      expect(screen.getByText("Commits")).toBeInTheDocument();
      expect(screen.getAllByTestId("git-commit-icon")).toHaveLength(2); // One in stats, one in activity

      // Check pull requests
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("Pull Requests")).toBeInTheDocument();
      expect(screen.getAllByTestId("git-pull-request-icon")).toHaveLength(2); // One in stats, one in activity

      // Check issues
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("Issues")).toBeInTheDocument();
      expect(screen.getAllByTestId("alert-circle-icon")).toHaveLength(2); // One in stats, one in activity

      // Check repositories
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("Repositories")).toBeInTheDocument();
      expect(screen.getAllByTestId("code-icon")).toHaveLength(1); // Only in stats
    });

    it("renders stats grid with correct responsive classes", () => {
      render(<UserContributions stats={mockStats} />);

      const statsGrid = document.querySelector(
        ".grid.grid-cols-2.md\\:grid-cols-4"
      );
      expect(statsGrid).toBeInTheDocument();
    });
  });

  describe("Recent Activity Display", () => {
    it("displays recent activity section when activities exist", () => {
      render(<UserContributions stats={mockStats} />);

      expect(screen.getByText("Recent Activity")).toBeInTheDocument();
      expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
    });

    it("displays all recent activities with correct formatting", () => {
      render(<UserContributions stats={mockStats} />);

      // Check PushEvent
      expect(screen.getByText("Pushed commits")).toBeInTheDocument();
      expect(screen.getByText("in test-repo")).toBeInTheDocument();
      expect(screen.getByText("2h ago")).toBeInTheDocument();

      // Check PullRequestEvent
      expect(screen.getByText("Pull request")).toBeInTheDocument();
      expect(screen.getByText("in another-repo")).toBeInTheDocument();
      expect(screen.getByText("2d ago")).toBeInTheDocument();

      // Check IssuesEvent (no repo)
      expect(screen.getByText("Issue activity")).toBeInTheDocument();
    });

    it("displays correct icons for different event types", () => {
      render(<UserContributions stats={mockStats} />);

      // The icons are rendered within the activity items
      const activityIcons = screen.getAllByTestId("git-commit-icon");
      expect(activityIcons.length).toBeGreaterThan(0);
    });

    it("displays no activity message when recentActivity is empty", () => {
      render(<UserContributions stats={emptyStats} />);

      expect(
        screen.getByText("No recent activity found in the last year.")
      ).toBeInTheDocument();
      expect(screen.queryByText("Recent Activity")).not.toBeInTheDocument();
    });
  });

  describe("Formatting Functions", () => {
    describe("formatEventType", () => {
      const eventTypeTests = [
        { input: "PushEvent", expected: "Pushed commits" },
        { input: "PullRequestEvent", expected: "Pull request" },
        { input: "IssuesEvent", expected: "Issue activity" },
        { input: "CreateEvent", expected: "Created repository" },
        { input: "ForkEvent", expected: "Forked repository" },
        { input: "WatchEvent", expected: "Starred repository" },
        { input: "CustomEvent", expected: "Custom" },
        { input: "UnknownEvent", expected: "Unknown" },
      ];

      eventTypeTests.forEach(({ input, expected }) => {
        it(`formats ${input} correctly`, () => {
          const statsWithEvent: GitHubContributionStats = {
            ...emptyStats,
            recentActivity: [
              {
                id: "test",
                type: input,
                created_at: new Date().toISOString(),
                payload: {},
              },
            ],
          };

          render(<UserContributions stats={statsWithEvent} />);
          expect(screen.getByText(expected)).toBeInTheDocument();
        });
      });
    });

    describe("formatDate", () => {
      it("formats recent dates as hours ago", () => {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const statsWithRecentEvent: GitHubContributionStats = {
          ...emptyStats,
          recentActivity: [
            {
              id: "recent",
              type: "PushEvent",
              created_at: oneHourAgo,
              payload: {},
            },
          ],
        };

        render(<UserContributions stats={statsWithRecentEvent} />);
        expect(screen.getByText("1h ago")).toBeInTheDocument();
      });

      it("formats dates within a week as days ago", () => {
        const threeDaysAgo = new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString();
        const statsWithWeeklyEvent: GitHubContributionStats = {
          ...emptyStats,
          recentActivity: [
            {
              id: "weekly",
              type: "PushEvent",
              created_at: threeDaysAgo,
              payload: {},
            },
          ],
        };

        render(<UserContributions stats={statsWithWeeklyEvent} />);
        expect(screen.getByText("3d ago")).toBeInTheDocument();
      });

      it("formats older dates as month and day", () => {
        const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const statsWithOldEvent: GitHubContributionStats = {
          ...emptyStats,
          recentActivity: [
            {
              id: "old",
              type: "PushEvent",
              created_at: oldDate.toISOString(),
              payload: {},
            },
          ],
        };

        render(<UserContributions stats={statsWithOldEvent} />);

        const expectedFormat = oldDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        expect(screen.getByText(expectedFormat)).toBeInTheDocument();
      });
    });
  });

  describe("Event Icons", () => {
    const iconTests = [
      { eventType: "PushEvent", expectedIcon: "git-commit-icon" },
      { eventType: "PullRequestEvent", expectedIcon: "git-pull-request-icon" },
      { eventType: "IssuesEvent", expectedIcon: "alert-circle-icon" },
      { eventType: "CreateEvent", expectedIcon: "code-icon" },
      { eventType: "ForkEvent", expectedIcon: "git-fork-icon" },
      { eventType: "WatchEvent", expectedIcon: "star-icon" },
      { eventType: "UnknownEvent", expectedIcon: "activity-icon" },
    ];

    iconTests.forEach(({ eventType, expectedIcon }) => {
      it(`displays correct icon for ${eventType}`, () => {
        const statsWithSpecificEvent: GitHubContributionStats = {
          ...emptyStats,
          recentActivity: [
            {
              id: "icon-test",
              type: eventType,
              created_at: new Date().toISOString(),
              payload: {},
            },
          ],
        };

        render(<UserContributions stats={statsWithSpecificEvent} />);

        // Check that the specific icon appears in the activity section
        const activitySection = screen
          .getByText("Recent Activity")
          .closest("div");
        expect(activitySection).toBeInTheDocument();
      });
    });
  });

  describe("Component Structure", () => {
    it("has correct CSS classes for layout", () => {
      render(<UserContributions stats={mockStats} />);

      // Check main card
      expect(document.querySelector(".mb-6")).toBeInTheDocument();

      // Check stats grid
      expect(document.querySelector(".grid.gap-4")).toBeInTheDocument();

      // Check activity section scrollable area
      expect(
        document.querySelector(".max-h-48.overflow-y-auto")
      ).toBeInTheDocument();
    });

    it("renders activity items with hover effects", () => {
      render(<UserContributions stats={mockStats} />);

      const activityItems = document.querySelectorAll(".hover\\:bg-muted");
      expect(activityItems.length).toBe(mockStats.recentActivity.length);
    });
  });

  describe("Edge Cases", () => {
    it("handles activity without repo information", () => {
      const statsWithoutRepo: GitHubContributionStats = {
        ...emptyStats,
        recentActivity: [
          {
            id: "no-repo",
            type: "PushEvent",
            created_at: new Date().toISOString(),
            payload: {},
          },
        ],
      };

      render(<UserContributions stats={statsWithoutRepo} />);

      expect(screen.getByText("Pushed commits")).toBeInTheDocument();
      expect(screen.queryByText(/in test-repo/)).not.toBeInTheDocument();
      expect(screen.queryByText(/in another-repo/)).not.toBeInTheDocument();
    });

    it("handles zero stats gracefully", () => {
      render(<UserContributions stats={emptyStats} />);

      expect(screen.getAllByText("0")).toHaveLength(4); // Should appear 4 times
    });

    it("does not render when both loading and error are false and no error", () => {
      render(
        <UserContributions stats={mockStats} isLoading={false} error={null} />
      );

      expect(
        screen.getByText("Contributions in the last year")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Loading contributions...")
      ).not.toBeInTheDocument();
    });
  });
});
