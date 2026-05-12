declare module "jest-axe" {
  type AxeResults = Record<string, unknown>;
  export function axe(container: Element, options?: Record<string, unknown>): Promise<AxeResults>;
  export const toHaveNoViolations: Record<string, unknown>;
}

declare module "vitest" {
  interface Assertion<T = any> {
    toHaveNoViolations(): void;
  }
}
