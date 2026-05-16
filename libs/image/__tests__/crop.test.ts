import { describe, it, expect } from "vitest";
import { clampCropRegion } from "../crop";
import type { CropRegion } from "../crop";

describe("clampCropRegion", () => {
  const bitmapW = 1920;
  const bitmapH = 1080;

  it("returns unchanged crop when region is within bounds", () => {
    const crop: CropRegion = { x: 100, y: 50, width: 800, height: 600 };
    expect(clampCropRegion(crop, bitmapW, bitmapH)).toEqual(crop);
  });

  it("clamps x to 0 when negative", () => {
    const result = clampCropRegion({ x: -50, y: 0, width: 100, height: 100 }, bitmapW, bitmapH);
    expect(result.x).toBe(0);
  });

  it("clamps y to 0 when negative", () => {
    const result = clampCropRegion({ x: 0, y: -30, width: 100, height: 100 }, bitmapW, bitmapH);
    expect(result.y).toBe(0);
  });

  it("clamps x to bitmap width when exceeding", () => {
    const result = clampCropRegion({ x: 2000, y: 0, width: 100, height: 100 }, bitmapW, bitmapH);
    expect(result.x).toBe(bitmapW);
  });

  it("clamps y to bitmap height when exceeding", () => {
    const result = clampCropRegion({ x: 0, y: 1200, width: 100, height: 100 }, bitmapW, bitmapH);
    expect(result.y).toBe(bitmapH);
  });

  it("clamps width when crop exceeds right edge", () => {
    const result = clampCropRegion({ x: 1800, y: 0, width: 200, height: 100 }, bitmapW, bitmapH);
    expect(result.x).toBe(1800);
    expect(result.width).toBe(bitmapW - 1800);
  });

  it("clamps height when crop exceeds bottom edge", () => {
    const result = clampCropRegion({ x: 0, y: 1000, width: 100, height: 200 }, bitmapW, bitmapH);
    expect(result.y).toBe(1000);
    expect(result.height).toBe(bitmapH - 1000);
  });

  it("ensures minimum width of 1", () => {
    const result = clampCropRegion({ x: bitmapW, y: 0, width: 100, height: 100 }, bitmapW, bitmapH);
    expect(result.width).toBeGreaterThanOrEqual(1);
  });

  it("ensures minimum height of 1", () => {
    const result = clampCropRegion({ x: 0, y: bitmapH, width: 100, height: 100 }, bitmapW, bitmapH);
    expect(result.height).toBeGreaterThanOrEqual(1);
  });

  it("handles crop at origin (0, 0)", () => {
    const crop: CropRegion = { x: 0, y: 0, width: 500, height: 500 };
    expect(clampCropRegion(crop, bitmapW, bitmapH)).toEqual(crop);
  });

  it("handles crop at max corner", () => {
    const result = clampCropRegion({ x: 1420, y: 580, width: 500, height: 500 }, bitmapW, bitmapH);
    expect(result.x).toBe(1420);
    expect(result.y).toBe(580);
    expect(result.width).toBe(bitmapW - 1420);
    expect(result.height).toBe(bitmapH - 580);
  });

  it("handles zero-size crop by enforcing minimum 1x1", () => {
    const result = clampCropRegion({ x: 0, y: 0, width: 0, height: 0 }, bitmapW, bitmapH);
    expect(result.width).toBeGreaterThanOrEqual(1);
    expect(result.height).toBeGreaterThanOrEqual(1);
  });
});
