let addToastFn:
  | ((message: string, type: "success" | "danger" | "info" | "warning", timeout?: number) => void)
  | null = null;

export function registerToastFn(
  fn: (message: string, type: "success" | "danger" | "info" | "warning", timeout?: number) => void
) {
  addToastFn = fn;
}

export function showToast(
  message: string,
  type: "success" | "danger" | "info" | "warning" = "success",
  timeout = 3000,
  id?: string
) {
  if (addToastFn) {
    addToastFn(message, type, timeout);
  }
}
