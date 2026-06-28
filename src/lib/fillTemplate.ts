// Pure string substitution for prompt templates. No Node-only imports here,
// so this is safe to use from both server and client components.

/**
 * Replaces every {{variable}} placeholder in a template body with the
 * matching value supplied by the user. Unmatched placeholders are left as-is
 * so missing input is obvious in the output rather than silently dropped.
 */
export function fillTemplate(body: string, values: Record<string, string>): string {
  return body.replace(/{{\s*(\w+)\s*}}/g, (match, variableName: string) => {
    return values[variableName] ?? match;
  });
}
