import { describe, it, expect } from "vitest";
import { calculatePosition, generateTilingGrid } from "../watermark";
import type { PositionPreset } from "../watermark";

describe("calculatePosition", () => {
  const cw = 1000;
  const ch = 800;
  const mw = 100;
  const mh = 50;

  it("returns center of canvas for center preset", () => {
    const pos = calculatePosition("center", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 500, y: 400 });
  });

  it("returns padded top-left position", () => {
    const pos = calculatePosition("top-left", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 100, y: 65 });
  });

  it("returns padded top-center position", () => {
    const pos = calculatePosition("top-center", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 500, y: 65 });
  });

  it("returns padded top-right position", () => {
    const pos = calculatePosition("top-right", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 900, y: 65 });
  });

  it("returns padded left-center position", () => {
    const pos = calculatePosition("left-center", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 100, y: 400 });
  });

  it("returns padded right-center position", () => {
    const pos = calculatePosition("right-center", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 900, y: 400 });
  });

  it("returns padded bottom-left position", () => {
    const pos = calculatePosition("bottom-left", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 100, y: 735 });
  });

  it("returns padded bottom-center position", () => {
    const pos = calculatePosition("bottom-center", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 500, y: 735 });
  });

  it("returns padded bottom-right position", () => {
    const pos = calculatePosition("bottom-right", cw, ch, mw, mh);
    expect(pos).toEqual({ x: 900, y: 735 });
  });

  it("handles larger mark dimensions correctly", () => {
    const pos = calculatePosition("top-left", cw, ch, 200, 100);
    expect(pos).toEqual({ x: 150, y: 90 });
  });
});

describe("generateTilingGrid", () => {
  const cw = 1000;
  const ch = 800;
  const mw = 100;
  const mh = 50;

  it("generates grid points for a canvas", () => {
    const points = generateTilingGrid(cw, ch, mw, mh, 2.0);
    expect(points.length).toBeGreaterThan(0);
  });

  it("extends grid beyond canvas bounds for overflow coverage", () => {
    const points = generateTilingGrid(cw, ch, mw, mh, 2.0);
    const hasNegativeX = points.some((p) => p.x < 0);
    const hasNegativeY = points.some((p) => p.y < 0);
    const hasBeyondRight = points.some((p) => p.x > cw);
    const hasBeyondBottom = points.some((p) => p.y > ch);
    expect(hasNegativeX || hasNegativeY || hasBeyondRight || hasBeyondBottom).toBe(true);
  });

  it("offsets odd rows by half the horizontal step", () => {
    const points = generateTilingGrid(1000, 800, 100, 50, 2.0);
    const hStep = 100 * 2.0;
    const vStep = 50 * 2.0;

    const row0Y = -1 * vStep;
    const row1Y = 0 * vStep;
    const row0Points = points.filter((p) => Math.abs(p.y - row0Y) < 0.01);
    const row1Points = points.filter((p) => Math.abs(p.y - row1Y) < 0.01);

    if (row0Points.length > 0 && row1Points.length > 0) {
      expect(row0Points[0].x).toBeCloseTo(row1Points[0].x + hStep / 2);
    }
  });

  it("generates more points with smaller spacing", () => {
    const dense = generateTilingGrid(cw, ch, mw, mh, 1.0);
    const sparse = generateTilingGrid(cw, ch, mw, mh, 3.0);
    expect(dense.length).toBeGreaterThan(sparse.length);
  });

  it("returns empty array for zero mark dimensions", () => {
    const points = generateTilingGrid(cw, ch, 0, mh, 2.0);
    expect(points).toEqual([]);
  });

  it("returns empty array for zero spacing", () => {
    const points = generateTilingGrid(cw, ch, mw, mh, 0);
    expect(points).toEqual([]);
  });
});
