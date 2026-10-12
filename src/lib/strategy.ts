import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface StrategyBrief {
  /** Product name from STRATEGY.md frontmatter. */
  name: string;
  /** `last_updated` from STRATEGY.md frontmatter, as YYYY-MM-DD. */
  updated?: string;
  /** The "Target problem" section — the question the strategy is answering. */
  problem: string;
}

function normalizeDate(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.slice(0, 10);
  return undefined;
}

/**
 * Read the current strategy question from STRATEGY.md.
 * Returns null when the file or the Target problem section is missing.
 */
export function loadStrategy(): StrategyBrief | null {
  const file = path.join(process.cwd(), "STRATEGY.md");
  if (!fs.existsSync(file)) return null;

  const parsed = matter(fs.readFileSync(file, "utf8"));
  const match = parsed.content.match(/## Target problem\s+([\s\S]*?)(?=\n## |$)/);
  const problem = match?.[1]?.trim().replace(/\s+/g, " ");
  if (!problem) return null;

  const name = parsed.data.name;
  return {
    name: typeof name === "string" && name.trim() ? name.trim() : "Agent Studio",
    updated: normalizeDate(parsed.data.last_updated),
    problem,
  };
}
