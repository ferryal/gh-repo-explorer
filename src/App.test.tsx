import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders GitHub Repository Explorer heading", () => {
  render(<App />);
  const headingElement = screen.getByText(/GitHub Repository Explorer/i);
  expect(headingElement).toBeInTheDocument();
});

test("renders search form", () => {
  render(<App />);
  const searchInput = screen.getByPlaceholderText(/Enter username to search/i);
  expect(searchInput).toBeInTheDocument();
});
