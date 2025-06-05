import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchForm } from "../SearchForm";

describe("SearchForm", () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it("renders with correct placeholder", () => {
    render(
      <SearchForm onSearch={mockOnSearch} placeholder="Test placeholder" />
    );

    expect(screen.getByPlaceholderText("Test placeholder")).toBeInTheDocument();
  });

  it("calls onSearch when form is submitted with valid input", async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole("textbox");
    const submitButton = screen.getByRole("button", { name: /search/i });

    await user.type(input, "testuser");
    await user.click(submitButton);

    expect(mockOnSearch).toHaveBeenCalledWith("testuser");
  });

  it("handles Enter key press", async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole("textbox");

    await user.type(input, "testuser");
    await user.keyboard("{Enter}");

    expect(mockOnSearch).toHaveBeenCalledWith("testuser");
  });

  it("trims whitespace from input", async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole("textbox");
    const submitButton = screen.getByRole("button", { name: /search/i });

    await user.type(input, "  testuser  ");
    await user.click(submitButton);

    expect(mockOnSearch).toHaveBeenCalledWith("testuser");
  });

  it("shows validation error for empty input", async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole("textbox");

    await user.click(input);
    await user.tab(); // Blur the input

    await waitFor(() => {
      expect(screen.getByText("Username is required")).toBeInTheDocument();
    });
  });

  it("shows validation error for input that is too long", async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole("textbox");
    const longUsername = "a".repeat(40); // GitHub usernames max 39 chars

    await user.type(input, longUsername);
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText("Username must be less than 40 characters")
      ).toBeInTheDocument();
    });
  });

  it("disables input and button when loading", () => {
    render(<SearchForm onSearch={mockOnSearch} isLoading={true} />);

    const input = screen.getByRole("textbox");
    const submitButton = screen.getByRole("button");

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("shows loading state in button", () => {
    render(<SearchForm onSearch={mockOnSearch} isLoading={true} />);

    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });

  it("focuses input on mount", () => {
    render(<SearchForm onSearch={mockOnSearch} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveFocus();
  });
});
