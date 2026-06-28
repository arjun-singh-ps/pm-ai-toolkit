// Loads and parses prompt templates from the prompts/ markdown directory.
// This is the "prompt template engine" referenced in CLAUDE.md's project structure.

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PromptTemplate } from "@/types/prompt";

const PROMPTS_DIR = path.join(process.cwd(), "prompts");

/**
 * Reads every .md file in prompts/, parses its frontmatter and body,
 * and returns them as PromptTemplate objects sorted alphabetically by title.
 */
export function getAllTemplates(): PromptTemplate[] {
  const filenames = fs
    .readdirSync(PROMPTS_DIR)
    .filter((filename) => filename.endsWith(".md"));

  const templates = filenames.map((filename) => parseTemplateFile(filename));

  return templates.sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Reads and parses a single template by its slug (filename without extension).
 * Returns null if no matching file exists.
 */
export function getTemplateBySlug(slug: string): PromptTemplate | null {
  const filename = `${slug}.md`;
  const filePath = path.join(PROMPTS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return parseTemplateFile(filename);
}

/** Reads one prompt markdown file and converts it into a PromptTemplate. */
function parseTemplateFile(filename: string): PromptTemplate {
  const filePath = path.join(PROMPTS_DIR, filename);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug: filename.replace(/\.md$/, ""),
    title: data.title ?? filename,
    description: data.description ?? "",
    variables: data.variables ?? [],
    body: content.trim(),
  };
}
