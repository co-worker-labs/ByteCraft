export type BatchInputItem = {
  id: string;
  name: string;
  content: string;
  type: "text" | "image";
  size: number;
};

export type BatchResultItem = {
  id: string;
  status: "success" | "error";
  output?: string;
  error?: string;
  duration: number;
};

export type BatchConfig = {
  stepId: string;
  stepParams: Record<string, string>;
  outputTemplate?: string;
};

export type BatchStatus = "idle" | "running" | "done" | "partial-error";

export type BatchAbortSignal = { cancelled: boolean };
