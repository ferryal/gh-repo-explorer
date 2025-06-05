import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserList } from "../UserList";
import { GitHubUser } from "../../types/github";

const mockUsers: GitHubUser[] = [
  {
    id: 1,
    login: "testuser1",
    avatar_url: "https://avatar1.com",
    html_url: "https://github.com/testuser1",
    type: "User",
    name: "Test User 1",
  },
  {
    id: 2,
    login: "testuser2",
    avatar_url: "https://avatar2.com",
    html_url: "https://github.com/testuser2",
    type: "User",
    name: "Test User 2",
  },
];

describe("UserList", () => {
  const mockOnUserSelect = jest.fn();

  beforeEach(() => {
    mockOnUserSelect.mockClear();
  });

  it("renders users correctly", () => {
    render(<UserList users={mockUsers} onUserSelect={mockOnUserSelect} />);

    expect(screen.getByText("testuser1")).toBeInTheDocument();
    expect(screen.getByText("testuser2")).toBeInTheDocument();
    expect(screen.getAllByText("User")).toHaveLength(2);
  });

  it("shows user avatars", () => {
    render(<UserList users={mockUsers} onUserSelect={mockOnUserSelect} />);

    const avatars = screen.getAllByRole("img");
    expect(avatars).toHaveLength(2);
    expect(avatars[0]).toHaveAttribute("src", "https://avatar1.com");
    expect(avatars[1]).toHaveAttribute("src", "https://avatar2.com");
  });

  it("calls onUserSelect when user is clicked", async () => {
    const user = userEvent.setup();
    render(<UserList users={mockUsers} onUserSelect={mockOnUserSelect} />);

    const userButton = screen.getByRole("button", { name: /testuser1/i });
    await user.click(userButton);

    expect(mockOnUserSelect).toHaveBeenCalledWith(mockUsers[0]);
  });

  it("handles keyboard navigation (Enter key)", async () => {
    const user = userEvent.setup();
    render(<UserList users={mockUsers} onUserSelect={mockOnUserSelect} />);

    const userButton = screen.getByRole("button", { name: /testuser1/i });
    userButton.focus();
    await user.keyboard("{Enter}");

    expect(mockOnUserSelect).toHaveBeenCalledWith(mockUsers[0]);
  });

  it("handles keyboard navigation (Space key)", async () => {
    const user = userEvent.setup();
    render(<UserList users={mockUsers} onUserSelect={mockOnUserSelect} />);

    const userButton = screen.getByRole("button", { name: /testuser1/i });
    userButton.focus();
    await user.keyboard(" ");

    expect(mockOnUserSelect).toHaveBeenCalledWith(mockUsers[0]);
  });

  it("shows loading state", () => {
    render(
      <UserList users={[]} onUserSelect={mockOnUserSelect} isLoading={true} />
    );

    expect(screen.getByText("Searching users...")).toBeInTheDocument();
  });

  it("shows error state", () => {
    const errorMessage = "Failed to fetch users";
    render(
      <UserList
        users={[]}
        onUserSelect={mockOnUserSelect}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("returns null when no users and not loading/error", () => {
    const { container } = render(
      <UserList users={[]} onUserSelect={mockOnUserSelect} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("shows fallback for users without avatars", () => {
    const userWithoutAvatar: GitHubUser = {
      id: 3,
      login: "noavatar",
      avatar_url: "",
      html_url: "https://github.com/noavatar",
      type: "User",
    };

    render(
      <UserList users={[userWithoutAvatar]} onUserSelect={mockOnUserSelect} />
    );

    expect(screen.getByText("noavatar")).toBeInTheDocument();
    // Should show a user icon fallback
    const fallbackIcon =
      screen.getByTestId("user-icon") ||
      screen.getByRole("img", { hidden: true });
    expect(screen.getByText("noavatar")).toBeInTheDocument();
  });

  it("shows correct header text", () => {
    render(<UserList users={mockUsers} onUserSelect={mockOnUserSelect} />);

    expect(
      screen.getByText("Showing users for your search")
    ).toBeInTheDocument();
  });

  it("applies correct CSS classes for styling", () => {
    render(<UserList users={mockUsers} onUserSelect={mockOnUserSelect} />);

    const userButtons = screen.getAllByRole("button");
    userButtons.forEach((button) => {
      expect(button).toHaveClass("hover:bg-accent");
    });
  });
});
