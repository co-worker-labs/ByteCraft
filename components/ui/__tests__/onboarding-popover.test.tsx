// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OnboardingPopover } from "../onboarding-popover";

describe("OnboardingPopover", () => {
  const mockDismiss = vi.fn();
  let targetElement: HTMLButtonElement;

  beforeEach(() => {
    mockDismiss.mockClear();
    targetElement = document.createElement("button");
    document.body.appendChild(targetElement);
    Object.defineProperty(targetElement, "getBoundingClientRect", {
      value: () => ({
        top: 50,
        bottom: 80,
        left: 300,
        right: 340,
        width: 40,
        height: 30,
        x: 300,
        y: 50,
        toJSON: () => {},
      }),
    });
  });

  afterEach(() => {
    document.body.removeChild(targetElement);
    document.body.innerHTML = "";
  });

  it("renders popover in portal when show is true", () => {
    render(
      <OnboardingPopover
        show={true}
        onDismiss={mockDismiss}
        targetRef={{ current: targetElement }}
        icon={<span data-testid="icon">shield</span>}
        title="Test Title"
        description="Test Description"
        buttonLabel="Got it"
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Got it")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("does not render when show is false", () => {
    render(
      <OnboardingPopover
        show={false}
        onDismiss={mockDismiss}
        targetRef={{ current: targetElement }}
        icon={null}
        title="Title"
        description="Desc"
        buttonLabel="OK"
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onDismiss when Got it button is clicked", () => {
    render(
      <OnboardingPopover
        show={true}
        onDismiss={mockDismiss}
        targetRef={{ current: targetElement }}
        icon={null}
        title="Title"
        description="Desc"
        buttonLabel="Got it"
      />
    );
    fireEvent.click(screen.getByText("Got it"));
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss when Escape key is pressed", () => {
    render(
      <OnboardingPopover
        show={true}
        onDismiss={mockDismiss}
        targetRef={{ current: targetElement }}
        icon={null}
        title="Title"
        description="Desc"
        buttonLabel="Got it"
      />
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("has correct ARIA attributes", () => {
    render(
      <OnboardingPopover
        show={true}
        onDismiss={mockDismiss}
        targetRef={{ current: targetElement }}
        icon={null}
        title="Test Title"
        description="Test Description"
        buttonLabel="Got it"
      />
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");

    const titleId = dialog.getAttribute("aria-labelledby");
    const descId = dialog.getAttribute("aria-describedby");
    expect(document.getElementById(titleId!)).toHaveTextContent("Test Title");
    expect(document.getElementById(descId!)).toHaveTextContent("Test Description");
  });

  it("does not call onDismiss on non-Escape key", () => {
    render(
      <OnboardingPopover
        show={true}
        onDismiss={mockDismiss}
        targetRef={{ current: targetElement }}
        icon={null}
        title="Title"
        description="Desc"
        buttonLabel="Got it"
      />
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Enter" });
    expect(mockDismiss).not.toHaveBeenCalled();
  });
});
