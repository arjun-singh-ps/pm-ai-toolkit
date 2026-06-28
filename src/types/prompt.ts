// Types describing a prompt template loaded from the prompts/ directory.

/** A single fill-in variable that a prompt template expects (e.g. {{owner}}). */
export interface PromptVariable {
  name: string;
  label: string;
}

/** A prompt template parsed from a markdown file in prompts/. */
export interface PromptTemplate {
  /** Filename without extension, used as the URL-safe identifier. */
  slug: string;
  title: string;
  description: string;
  variables: PromptVariable[];
  /** The raw prompt body, containing {{variable}} placeholders. */
  body: string;
}
