import { describe, it, expect, beforeEach, vi } from "vitest";
import { listRecipes, getRecipe, saveRecipe, deleteRecipe, consumeDraft } from "../storage";
import type { Recipe, RecipeDraft } from "../types";

const mockStore: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStore).forEach((k) => delete mockStore[k]);
});

vi.stubGlobal("localStorage", {
  getItem: (key: string) => mockStore[key] ?? null,
  setItem: (key: string, value: string) => {
    mockStore[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStore[key];
  },
  clear: () => {
    Object.keys(mockStore).forEach((k) => delete mockStore[k]);
  },
  get length() {
    return Object.keys(mockStore).length;
  },
  key: (_index: number) => null,
});

function makeRecipe(id: string, name: string): Recipe {
  return { id, name, steps: [], createdAt: Date.now(), updatedAt: Date.now() };
}

describe("listRecipes", () => {
  it("returns empty array when no recipes stored", () => {
    expect(listRecipes()).toEqual([]);
  });

  it("returns stored recipes", () => {
    const recipe = makeRecipe("r1", "Test Recipe");
    mockStore["okrun:recipe:list"] = JSON.stringify([recipe]);
    expect(listRecipes()).toHaveLength(1);
    expect(listRecipes()[0].name).toBe("Test Recipe");
  });

  it("returns empty array on invalid JSON", () => {
    mockStore["okrun:recipe:list"] = "not json";
    expect(listRecipes()).toEqual([]);
  });
});

describe("getRecipe", () => {
  it("returns undefined when not found", () => {
    expect(getRecipe("missing")).toBeUndefined();
  });

  it("returns recipe by id", () => {
    const r1 = makeRecipe("r1", "First");
    const r2 = makeRecipe("r2", "Second");
    mockStore["okrun:recipe:list"] = JSON.stringify([r1, r2]);
    expect(getRecipe("r2")!.name).toBe("Second");
  });
});

describe("saveRecipe", () => {
  it("saves a new recipe", () => {
    const recipe = makeRecipe("r1", "New");
    saveRecipe(recipe);
    const stored = JSON.parse(mockStore["okrun:recipe:list"]);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("r1");
  });

  it("updates existing recipe by id", () => {
    const original = makeRecipe("r1", "Original");
    saveRecipe(original);
    const updated = makeRecipe("r1", "Updated");
    saveRecipe(updated);
    const stored = JSON.parse(mockStore["okrun:recipe:list"]);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("Updated");
  });
});

describe("deleteRecipe", () => {
  it("removes recipe by id", () => {
    const r1 = makeRecipe("r1", "First");
    const r2 = makeRecipe("r2", "Second");
    saveRecipe(r1);
    saveRecipe(r2);
    deleteRecipe("r1");
    expect(listRecipes()).toHaveLength(1);
    expect(listRecipes()[0].id).toBe("r2");
  });

  it("does nothing when id not found", () => {
    const r1 = makeRecipe("r1", "First");
    saveRecipe(r1);
    deleteRecipe("missing");
    expect(listRecipes()).toHaveLength(1);
  });
});

describe("consumeDraft", () => {
  it("returns null when no draft stored", () => {
    expect(consumeDraft()).toBeNull();
  });

  it("returns and removes draft", () => {
    const draft: RecipeDraft = {
      input: "hello",
      stepId: "base64-encode",
      params: {},
      sourceTool: "base64",
    };
    mockStore["okrun:recipe:draft"] = JSON.stringify(draft);
    const result = consumeDraft();
    expect(result).toEqual(draft);
    expect(mockStore["okrun:recipe:draft"]).toBeUndefined();
  });

  it("returns null on invalid JSON and removes key", () => {
    mockStore["okrun:recipe:draft"] = "bad";
    const result = consumeDraft();
    expect(result).toBeNull();
  });
});
