import type { ErrorCorrection } from "./types";

const TABLE: Record<ErrorCorrection, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

export type CapacityStatus = "ok" | "near" | "over";

export interface CapacityResult {
  bytes: number;
  limit: number;
  status: CapacityStatus;
}

export function byteCapacity(level: ErrorCorrection): number {
  return TABLE[level];
}

export function checkCapacity(payload: string, level: ErrorCorrection): CapacityResult {
  const bytes = new TextEncoder().encode(payload).length;
  const limit = TABLE[level];
  let status: CapacityStatus = "ok";
  if (bytes > limit) status = "over";
  else if (bytes > limit * 0.9) status = "near";
  return { bytes, limit, status };
}
