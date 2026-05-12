import { it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { render } from "@testing-library/react";
import { Card } from "./card";

expect.extend(toHaveNoViolations);

it("non-clickable Card has no a11y violations", async () => {
  const { container } = render(<Card>Content</Card>);
  expect(await axe(container)).toHaveNoViolations();
});

it("clickable Card has no a11y violations", async () => {
  const { container } = render(<Card onClick={() => {}}>Click me</Card>);
  expect(await axe(container)).toHaveNoViolations();
});

it("hoverable Card has no a11y violations", async () => {
  const { container } = render(
    <Card hover onClick={() => {}}>
      Hover me
    </Card>
  );
  expect(await axe(container)).toHaveNoViolations();
});
