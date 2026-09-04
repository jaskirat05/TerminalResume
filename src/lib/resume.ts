import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Builds the system prompt from the `knowledge/*.md` files at the project root.
 * These markdown files are the single source of truth for the resume content,
 * replacing the old OpenAI "assistant" that had to be trained separately.
 *
 * The result is cached after the first read so we don't hit the filesystem on
 * every request.
 */
let cachedSystemPrompt: string | null = null;

function buildSystemPrompt(): string {
  const knowledgeDir = join(process.cwd(), "knowledge");

  const files = readdirSync(knowledgeDir)
    .filter((file) => file.endsWith(".md"))
    .sort();

  if (files.length === 0) {
    throw new Error(
      `No .md files found in ${knowledgeDir}. Add resume content there.`,
    );
  }

  const sections = files.map((file) =>
    readFileSync(join(knowledgeDir, file), "utf8").trim(),
  );

  return [
    "You are the interactive terminal resume assistant for this candidate.",
    "Answer questions strictly from the resume content below. Be concise, professional, and friendly.",
    "If the information is not present in the resume content, say so instead of guessing.",
    "Do not invent employers, dates, skills, or achievements.",
    "",
    "--- RESUME CONTENT ---",
    sections.join("\n\n---\n\n"),
  ].join("\n");
}

export function getSystemPrompt(): string {
  if (cachedSystemPrompt === null) {
    cachedSystemPrompt = buildSystemPrompt();
  }
  return cachedSystemPrompt;
}
