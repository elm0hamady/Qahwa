import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders children and responds to clicks", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Start hosting</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Start hosting" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables itself and blocks clicks while loading", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Start hosting
      </Button>
    );
    const button = screen.getByRole("button", { name: "Start hosting" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("respects an explicit disabled prop", () => {
    render(<Button disabled>Start hosting</Button>);
    expect(screen.getByRole("button", { name: "Start hosting" })).toBeDisabled();
  });
});
