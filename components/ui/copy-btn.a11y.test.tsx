import { axe, toHaveNoViolations } from "jest-axe";
import { render } from "@testing-library/react";
import { CopyButton } from "./copy-btn";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("../../libs/toast", () => ({
  showToast: () => {},
}));

expect.extend(toHaveNoViolations);

it("CopyButton icon mode has no a11y violations", async () => {
  const { container } = render(<CopyButton getContent={() => "hello"} />);
  expect(await axe(container)).toHaveNoViolations();
});

it("CopyButton with label has no a11y violations", async () => {
  const { container } = render(<CopyButton getContent={() => "hello"} label="Copy" />);
  expect(await axe(container)).toHaveNoViolations();
});
