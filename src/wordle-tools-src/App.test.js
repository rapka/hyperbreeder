import { render, screen } from "@testing-library/react";
import App, { checkSolution } from "./App";

test("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(/Wordle/i);
  expect(linkElement).toBeInTheDocument();
});
