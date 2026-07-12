// User Guide page: renders docs/user-guide.md as a styled HTML page.
// Reads the file at request time (server component) — the content always
// reflects the current state of the docs without a rebuild step.

import fs from "fs";
import path from "path";

/**
 * Converts the subset of Markdown used in the user guide into HTML.
 * Handles: h1–h4, bold, inline code, blockquote, ordered and unordered lists,
 * tables, horizontal rules, and paragraphs. Not a general-purpose parser.
 */
function parseMarkdown(md: string): string {
  // Split into blocks on blank lines, then handle each block type.
  const lines = md.split("\n");
  const html: string[] = [];
  let i = 0;

  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function inlineFormat(s: string): string {
    // Code spans first (no further formatting inside them).
    s = s.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);
    // Bold
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Links: [text](href)
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return s;
  }

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    const h4 = line.match(/^#### (.+)/);
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);

    if (h1) {
      html.push(`<h1>${inlineFormat(escapeHtml(h1[1]))}</h1>`);
      i++;
      continue;
    }
    if (h2) {
      html.push(`<h2>${inlineFormat(escapeHtml(h2[1]))}</h2>`);
      i++;
      continue;
    }
    if (h3) {
      html.push(`<h3>${inlineFormat(escapeHtml(h3[1]))}</h3>`);
      i++;
      continue;
    }
    if (h4) {
      html.push(`<h4>${inlineFormat(escapeHtml(h4[1]))}</h4>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      html.push(`<hr />`);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      html.push(
        `<blockquote>${quoteLines.map((l) => inlineFormat(escapeHtml(l))).join("<br />")}</blockquote>`
      );
      continue;
    }

    // Table: line starts with |
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length < 2) {
        // Not a real table — emit as-is.
        html.push(`<p>${inlineFormat(escapeHtml(tableLines[0]))}</p>`);
        continue;
      }
      const headerCells = tableLines[0]
        .split("|")
        .slice(1, -1)
        .map((c) => `<th>${inlineFormat(escapeHtml(c.trim()))}</th>`)
        .join("");
      // Row index 1 is the separator (---|---) — skip it.
      const bodyRows = tableLines
        .slice(2)
        .map((row) => {
          const cells = row
            .split("|")
            .slice(1, -1)
            .map((c) => `<td>${inlineFormat(escapeHtml(c.trim()))}</td>`)
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      html.push(`<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`);
      continue;
    }

    // Unordered list
    if (/^(\s*)-\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^(\s*)-\s/.test(lines[i])) {
        const text = lines[i].replace(/^\s*-\s/, "");
        items.push(`<li>${inlineFormat(escapeHtml(text))}</li>`);
        i++;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const text = lines[i].replace(/^\d+\.\s/, "");
        items.push(`<li>${inlineFormat(escapeHtml(text))}</li>`);
        i++;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // Blank line — skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("|") && !lines[i].startsWith(">") && !/^(\s*)-\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i]) && !/^---+$/.test(lines[i].trim())) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      html.push(`<p>${paraLines.map((l) => inlineFormat(escapeHtml(l))).join(" ")}</p>`);
    }
  }

  return html.join("\n");
}

/** Server component — reads and renders the user guide from docs/. */
export default function UserGuidePage() {
  const filePath = path.join(process.cwd(), "docs", "user-guide.md");
  const raw = fs.readFileSync(filePath, "utf-8");
  const html = parseMarkdown(raw);

  return (
    <div className="flex flex-1 justify-center px-6 py-16" style={{ background: "var(--bg)" }}>
      <main
        className="w-full max-w-3xl"
        style={{ color: "var(--text)" }}
      >
        <style>{`
          .guide h1 {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--navy);
            margin-bottom: 0.5rem;
          }
          .guide h2 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--navy);
            margin-top: 2.5rem;
            margin-bottom: 0.5rem;
            padding-bottom: 0.35rem;
            border-bottom: 1px solid var(--border);
          }
          .guide h3 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--navy);
            margin-top: 1.5rem;
            margin-bottom: 0.35rem;
          }
          .guide h4 {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-secondary);
            margin-top: 1.25rem;
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .guide p {
            font-size: 0.9rem;
            line-height: 1.7;
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
          }
          .guide ul, .guide ol {
            padding-left: 1.25rem;
            margin-bottom: 0.75rem;
          }
          .guide ul { list-style-type: disc; }
          .guide ol { list-style-type: decimal; }
          .guide li {
            font-size: 0.9rem;
            line-height: 1.7;
            color: var(--text-secondary);
            margin-bottom: 0.2rem;
          }
          .guide strong { color: var(--text); font-weight: 600; }
          .guide code {
            font-family: var(--font-geist-mono), monospace;
            font-size: 0.8rem;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 0.1rem 0.35rem;
            color: var(--coral);
          }
          .guide blockquote {
            border-left: 3px solid var(--coral-light);
            padding: 0.5rem 0.75rem;
            margin: 0.75rem 0;
            background: var(--surface);
            border-radius: 0 6px 6px 0;
            font-size: 0.85rem;
            color: var(--text-muted);
          }
          .guide hr {
            border: none;
            border-top: 1px solid var(--border);
            margin: 2rem 0;
          }
          .guide table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85rem;
            margin-bottom: 1rem;
          }
          .guide th {
            text-align: left;
            padding: 0.5rem 0.75rem;
            font-weight: 600;
            color: var(--navy);
            background: var(--surface);
            border: 1px solid var(--border);
          }
          .guide td {
            padding: 0.45rem 0.75rem;
            color: var(--text-secondary);
            border: 1px solid var(--border);
            vertical-align: top;
          }
          .guide tr:nth-child(even) td { background: var(--surface); }
          .guide a { color: var(--coral); text-decoration: underline; }
          .guide a:hover { opacity: 0.8; }
        `}</style>
        <div className="guide" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </div>
  );
}
