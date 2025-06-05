import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Create a test wrapper with QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("App", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockReset();
  });

  describe("Initial State", () => {
    it("renders GitHub Repository Explorer heading", () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );
      const headingElement = screen.getByText(/GitHub Repository Explorer/i);
      expect(headingElement).toBeInTheDocument();
    });

    it("renders search form with correct placeholder", () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );
      const searchInput = screen.getByPlaceholderText(
        /Enter username to search/i
      );
      expect(searchInput).toBeInTheDocument();
    });

    it("renders description text", () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );
      expect(
        screen.getByText(
          "Search for GitHub users and explore their repositories"
        )
      ).toBeInTheDocument();
    });

    it("has search button disabled initially", () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );
      const searchButton = screen.getByRole("button", { name: /search/i });
      expect(searchButton).toBeDisabled();
    });
  });

  describe("User Search", () => {
    it("performs successful user search", async () => {
      const user = userEvent.setup();
      const mockSearchResponse = {
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
        json: async () => mockSearchResponse,
      } as Response);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.type(searchInput, "testuser");
      await user.click(searchButton);

      // Wait for users to load
      await waitFor(() => {
        expect(screen.getByText("testuser1")).toBeInTheDocument();
      });

      expect(screen.getByText("testuser2")).toBeInTheDocument();
      expect(
        screen.getByText("Showing users for your search")
      ).toBeInTheDocument();
    });

    it("handles no users found scenario", async () => {
      const user = userEvent.setup();
      const mockEmptyResponse = {
        total_count: 0,
        incomplete_results: false,
        items: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyResponse,
      } as Response);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.type(searchInput, "nonexistentuser");
      await user.click(searchButton);

      // Wait for "no users found" message
      await waitFor(() => {
        expect(
          screen.getByText(/No users found for "nonexistentuser"/)
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Try a different username or check the spelling/)
      ).toBeInTheDocument();
    });

    it("handles user not found scenario when API returns empty results", async () => {
      const user = userEvent.setup();

      // This simulates the specific case mentioned by the user where API returns:
      // { "total_count": 0, "incomplete_results": false, "items": [] }
      const mockUserNotFoundResponse = {
        total_count: 0,
        incomplete_results: false,
        items: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserNotFoundResponse,
      } as Response);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.type(searchInput, "usernotfound123");
      await user.click(searchButton);

      // Should show "no users found" message instead of any error
      await waitFor(() => {
        expect(
          screen.getByText(/No users found for "usernotfound123"/)
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Try a different username or check the spelling/)
      ).toBeInTheDocument();

      // Should not show any API error messages
      expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it("handles API errors gracefully", async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: "Rate limit exceeded" }),
      } as Response);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.type(searchInput, "erroruser");
      await user.click(searchButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument();
      });
    });

    it("shows loading state during search", async () => {
      const user = userEvent.setup();

      // Mock a delayed response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    total_count: 0,
                    incomplete_results: false,
                    items: [],
                  }),
                } as Response),
              100
            )
          )
      );

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.type(searchInput, "loadingtest");
      await user.click(searchButton);

      // Check loading state
      expect(screen.getByText("Searching users...")).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(
          screen.queryByText("Searching users...")
        ).not.toBeInTheDocument();
      });
    });

    it("clears selected user when performing new search", async () => {
      const user = userEvent.setup();

      // Mock initial search - use "testuser1" to match the mock response
      const mockSearchResponse = {
        total_count: 1,
        incomplete_results: false,
        items: [
          {
            id: 1,
            login: "testuser1",
            avatar_url: "https://avatar.com",
            html_url: "https://github.com/testuser1",
            type: "User",
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse,
      } as Response);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      // First search
      await user.type(searchInput, "testuser1");
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText("testuser1")).toBeInTheDocument();
      });

      // Verify search interface is shown
      expect(
        screen.getByText("Showing users for your search")
      ).toBeInTheDocument();

      // Perform another search - this should clear the previous search
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total_count: 0,
          incomplete_results: false,
          items: [],
        }),
      } as Response);

      await user.clear(searchInput);
      await user.type(searchInput, "newsearch");
      await user.click(searchButton);

      // Wait for the new search results (no users found message)
      await waitFor(() => {
        expect(
          screen.getByText(/No users found for "newsearch"/)
        ).toBeInTheDocument();
      });

      // Original user should no longer be visible
      expect(screen.queryByText("testuser1")).not.toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("enables search button only when input has content", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      // Initially disabled
      expect(searchButton).toBeDisabled();

      // Should enable when typing
      await user.type(searchInput, "test");
      expect(searchButton).toBeEnabled();

      // Should disable when cleared
      await user.clear(searchInput);
      expect(searchButton).toBeDisabled();
    });

    it("handles keyboard navigation with Enter key", async () => {
      const user = userEvent.setup();
      const mockSearchResponse = {
        total_count: 1,
        incomplete_results: false,
        items: [
          {
            id: 1,
            login: "keyboarduser",
            avatar_url: "https://avatar.com",
            html_url: "https://github.com/keyboarduser",
            type: "User",
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse,
      } as Response);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const searchInput = screen.getByRole("textbox");

      await user.type(searchInput, "keyboarduser");
      await user.keyboard("{Enter}");

      // Wait for search results
      await waitFor(() => {
        expect(screen.getByText("keyboarduser")).toBeInTheDocument();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/search/users?q=keyboarduser&per_page=5",
        expect.any(Object)
      );
    });
  });

  describe("Edge Cases", () => {
    it("handles network errors", async () => {
      const user = userEvent.setup();

      // Mock the network error - the actual error that gets thrown will be converted by githubApi
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.type(searchInput, "networktest");
      await user.click(searchButton);

      // Wait for error message - TanStack Query will retry, so we need to wait longer
      await waitFor(
        () => {
          expect(
            screen.getByText(
              "Failed to search users. Please check your connection."
            )
          ).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    }, 15000);

    it("does not show 'no users found' when search query is empty", async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // No search performed, should not show any error messages
      expect(screen.queryByText(/No users found/)).not.toBeInTheDocument();
    });

    it("does not show 'no users found' when there's an API error", async () => {
      const user = userEvent.setup();

      // Mock the API error - use a specific GitHub API error that should be preserved
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: "API rate limit exceeded" }),
      } as Response);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.type(searchInput, "errortest");
      await user.click(searchButton);

      // Wait for the specific API error message to be displayed
      await waitFor(
        () => {
          expect(
            screen.getByText("API rate limit exceeded")
          ).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(screen.queryByText(/No users found/)).not.toBeInTheDocument();
    }, 15000);

    it("trims whitespace from search query in error message", async () => {
      const user = userEvent.setup();
      const mockEmptyResponse = {
        total_count: 0,
        incomplete_results: false,
        items: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyResponse,
      } as Response);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const searchInput = screen.getByRole("textbox");
      const searchButton = screen.getByRole("button", { name: /search/i });

      await user.type(searchInput, "  spaceuser  ");
      await user.click(searchButton);

      // Wait for "no users found" message - should show trimmed username
      await waitFor(() => {
        expect(
          screen.getByText(/No users found for "spaceuser"/)
        ).toBeInTheDocument();
      });
    });
  });
});
