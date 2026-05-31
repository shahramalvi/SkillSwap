const NAVIGATE_RE = /^NAVIGATE:(\/[^\s|]+)(?:\|(.+))?$/;

export interface ParsedAssistantReply {
  text: string;
  navigateTo: string | null;
  navigateLabel: string | null;
}

export function parseAssistantReply(raw: string): ParsedAssistantReply {
  const lines = raw.trim().split("\n");
  let navigateTo: string | null = null;
  let navigateLabel: string | null = null;

  const textLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(NAVIGATE_RE);
    if (match) {
      navigateTo = match[1];
      navigateLabel = match[2]?.trim() ?? null;
    } else {
      textLines.push(line);
    }
  }

  let text = textLines.join("\n").trim();
  // Fallback: inline NAVIGATE at end of last line
  const inlineMatch = text.match(/\s*NAVIGATE:(\/[^\s|]+)(?:\|(.+))?\s*$/);
  if (inlineMatch) {
    navigateTo = inlineMatch[1];
    navigateLabel = inlineMatch[2]?.trim() ?? navigateLabel;
    text = text.slice(0, inlineMatch.index).trim();
  }

  return { text, navigateTo, navigateLabel };
}
