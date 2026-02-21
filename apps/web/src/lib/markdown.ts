// Markdown-to-HTML helper for rich text content.
// Supports: headings, bold, italic, links, images, blockquotes,
// unordered/ordered lists, horizontal rules, and paragraphs.

export function markdownToHtml(input: string): string {
  if (!input) return "";

  const text = input.replace(/\r\n/g, "\n").trim();

  let processed = text;

  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(text);
  const hasBlockTags = /<\/?(p|div|h[1-6]|ul|ol|li)(\s[^>]*)?>/i.test(text);
  const hasBlockquotes = /<\/?blockquote(\s[^>]*)?>/i.test(text);

  if (hasHtmlTags && hasBlockTags) {
    processed = processed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    processed = processed.replace(/\*(.+?)\*/g, "<em>$1</em>");
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
      const safeLabel = String(label ?? "");
      const safeUrl = String(url ?? "").replace(/"/g, "&quot;");
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
    });

    if (!hasBlockquotes) {
      processed = processed.replace(/^>\s*(.+)$/gm, "<blockquote>$1</blockquote>");
    }

    return processed;
  }

  // Images: ![alt](url)
  processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, url) => {
    const safeAlt = String(alt ?? "").replace(/"/g, "&quot;");
    const safeUrl = String(url ?? "").replace(/"/g, "&quot;");
    return `<img src="${safeUrl}" alt="${safeAlt}" />`;
  });

  // Links: [text](url)
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const safeLabel = String(label ?? "");
    const safeUrl = String(url ?? "").replace(/"/g, "&quot;");
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
  });

  // Headings: # … ######
  processed = processed.replace(/^\s*(#{1,6})\s*(.+)$/gm, (_m, hashes: string, title: string) => {
    const level = Math.min(Math.max(hashes.length, 1), 6);
    return `<h${level}>${title.trim()}</h${level}>`;
  });

  // Horizontal rules: ---, ***, ___
  processed = processed.replace(/^(?:[-*_]){3,}\s*$/gm, "<hr />");

  // Process lines: blockquotes, lists, paragraphs
  const lines = processed.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blockquotes
    if (line.trim().startsWith(">")) {
      let bqContent = line.replace(/^>\s*/, "");
      i++;
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        bqContent += "\n" + lines[i].replace(/^>\s*/, "");
        i++;
      }
      result.push(`<blockquote>${bqContent}</blockquote>`);
      continue;
    }

    // Unordered list (- item or * item)
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      result.push(`<ul>${items.map((it) => `<li>${it}</li>`).join("")}</ul>`);
      continue;
    }

    // Ordered list (1. item)
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      result.push(`<ol>${items.map((it) => `<li>${it}</li>`).join("")}</ol>`);
      continue;
    }

    result.push(line);
    i++;
  }

  processed = result.join("\n");

  // Bold **text**
  processed = processed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic *text*
  processed = processed.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Split into paragraphs on double newline
  const paragraphs = processed.split(/\n{2,}/).map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (/^<(h[1-6]|p|ul|ol|li|blockquote|hr|img)/i.test(trimmed)) {
      return trimmed;
    }
    const withBr = trimmed.replace(/\n/g, "<br />");
    return `<p>${withBr}</p>`;
  });

  return paragraphs.filter(Boolean).join("\n");
}


