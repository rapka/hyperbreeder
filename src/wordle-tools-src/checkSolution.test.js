import { render, screen } from "@testing-library/react";
import App, { checkSolution } from "./App";

test("returns the expected output", () => {
  // expect(checkSolution("races", "secar")).toMatchObject([1, 1, 2, 1, 1]);
  // expect(checkSolution("words", "eamtc")).toMatchObject([0, 0, 0, 0, 0]);
  // expect(checkSolution("lover", "lover")).toMatchObject([2, 2, 2, 2, 2]);
  // expect(checkSolution("lover", "overl")).toMatchObject([1, 1, 1, 1, 1]);
  // expect(checkSolution("brass", "sands")).toMatchObject([1, 1, 0, 0, 2]);
  // expect(checkSolution("brass", "turns")).toMatchObject([0, 0, 1, 0, 2]);
  // expect(checkSolution("brass", "super")).toMatchObject([1, 0, 0, 0, 1]);
  // expect(checkSolution("brass", "carbs")).toMatchObject([0, 1, 1, 1, 2]);
  // expect(checkSolution("brass", "barbs")).toMatchObject([2, 1, 1, 0, 2]);
  // expect(checkSolution("foxes", "aedes")).toMatchObject([0, 0, 0, 2, 2]);
  expect(checkSolution("foxes", "sassy")).toMatchObject([1, 0, 0, 0, 0]);
});
