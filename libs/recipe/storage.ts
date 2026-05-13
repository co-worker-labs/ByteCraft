import type { Recipe, RecipeDraft } from "./types";
import { STORAGE_KEYS } from "../storage-keys";

const LIST_KEY = STORAGE_KEYS.recipeList;
const DRAFT_KEY = STORAGE_KEYS.recipeDraft;

export function listRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getRecipe(id: string): Recipe | undefined {
  return listRecipes().find((r) => r.id === id);
}

export function saveRecipe(recipe: Recipe): void {
  const recipes = listRecipes().filter((r) => r.id !== recipe.id);
  recipes.push(recipe);
  localStorage.setItem(LIST_KEY, JSON.stringify(recipes));
}

export function deleteRecipe(id: string): void {
  const recipes = listRecipes().filter((r) => r.id !== id);
  localStorage.setItem(LIST_KEY, JSON.stringify(recipes));
}

export function consumeDraft(): RecipeDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft: RecipeDraft = JSON.parse(raw);
    localStorage.removeItem(DRAFT_KEY);
    return draft;
  } catch {
    return null;
  }
}
