import { axe, toHaveNoViolations } from "jest-axe";
import { render, act } from "@testing-library/react";
import { ToastProvider, useToastContext } from "./toast";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

expect.extend(toHaveNoViolations);

function ToastTrigger({ type }: { type: "success" | "danger" | "info" | "warning" }) {
  const { addToast } = useToastContext();
  return <button onClick={() => addToast(`Test ${type}`, type)}>Trigger</button>;
}

it("ToastProvider empty has no a11y violations", async () => {
  const { container } = render(
    <ToastProvider>
      <div />
    </ToastProvider>
  );
  expect(await axe(container)).toHaveNoViolations();
});

it("ToastProvider with success toast has no a11y violations", async () => {
  const { container } = render(
    <ToastProvider>
      <ToastTrigger type="success" />
    </ToastProvider>
  );

  const btn = container.querySelector("button")!;
  await act(async () => {
    btn.click();
  });

  expect(await axe(container)).toHaveNoViolations();
});

it("ToastProvider with danger toast has no a11y violations", async () => {
  const { container } = render(
    <ToastProvider>
      <ToastTrigger type="danger" />
    </ToastProvider>
  );

  const btn = container.querySelector("button")!;
  await act(async () => {
    btn.click();
  });

  expect(await axe(container)).toHaveNoViolations();
});

it("ToastProvider with info toast has no a11y violations", async () => {
  const { container } = render(
    <ToastProvider>
      <ToastTrigger type="info" />
    </ToastProvider>
  );

  const btn = container.querySelector("button")!;
  await act(async () => {
    btn.click();
  });

  expect(await axe(container)).toHaveNoViolations();
});
