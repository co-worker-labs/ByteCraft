import fuzzysort from "fuzzysort";
import type { ToolCard } from "./tools";

export function searchTools(query: string, tools: ToolCard[]): ToolCard[] {
  if (!query.trim()) return tools;
  const results = fuzzysort.go(query, tools, {
    keys: ["title", "searchTerms", "description", "key"],
    scoreFn: (r) => {
      const titleScore = r[0]?.score ?? 0;
      const termsScore = r[1]?.score ?? 0;
      const descScore = r[2]?.score ?? 0;
      const keyScore = r[3]?.score ?? 0;
      return Math.max(titleScore * 2, termsScore * 2, descScore, keyScore);
    },
  });
  return results.map((r) => r.obj);
}
