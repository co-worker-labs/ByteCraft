import { axe, toHaveNoViolations } from "jest-axe";
import { render } from "@testing-library/react";
import { StyledInput, StyledTextarea, StyledSelect } from "./input";

expect.extend(toHaveNoViolations);

it("StyledInput with label has no a11y violations", async () => {
  const { container } = render(<StyledInput label="Username" />);
  expect(await axe(container)).toHaveNoViolations();
});

it("StyledInput without label has no a11y violations", async () => {
  const { container } = render(<StyledInput placeholder="Enter text" />);
  expect(await axe(container)).toHaveNoViolations();
});

it("StyledInput disabled has no a11y violations", async () => {
  const { container } = render(<StyledInput label="Username" disabled />);
  expect(await axe(container)).toHaveNoViolations();
});

it("StyledTextarea with label has no a11y violations", async () => {
  const { container } = render(<StyledTextarea label="Description" />);
  expect(await axe(container)).toHaveNoViolations();
});

it("StyledSelect with label has no a11y violations", async () => {
  const { container } = render(
    <StyledSelect label="Color">
      <option value="red">Red</option>
      <option value="blue">Blue</option>
    </StyledSelect>
  );
  expect(await axe(container)).toHaveNoViolations();
});
