// Der Briefing-Endpunkt liefert Telegram-HTML als einen einzigen String —
// gebaut für einen Chat, nicht für den Browser. Statt ihn roh ins DOM zu
// schreiben (die News-Links stammen aus fremden RSS-Feeds) zerlegen wir hier
// das schmale Subset, das der phu-api-hub tatsächlich erzeugt: <b> und <a>.

const SECTION_SEPARATOR = /\n?─{3,}\n?/;

/** Nur diese Tags erzeugt morningBriefing.service.ts. */
const TAG_PATTERN = /<(b|a)(?:\s+href="([^"]*)")?>([\s\S]*?)<\/\1>/g;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

function decodeEntities(s: string): string {
  return s.replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m] ?? m);
}

/** Nur http(s) durchlassen — schützt vor javascript:/data: aus fremden Feeds. */
export function safeHref(raw: string): string | null {
  try {
    const url = new URL(decodeEntities(raw));
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export type Token =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "link"; text: string; href: string };

/** Eine Zeile in Text-, Fett- und Link-Stücke zerlegen. */
export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;

  TAG_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TAG_PATTERN.exec(line)) !== null) {
    const [full, tag, href, inner] = match;

    if (match.index > cursor) {
      tokens.push({ kind: "text", text: decodeEntities(line.slice(cursor, match.index)) });
    }

    const label = decodeEntities(inner.replace(/<[^>]+>/g, ""));

    if (tag === "b") {
      tokens.push({ kind: "bold", text: label });
    } else {
      const url = href ? safeHref(href) : null;
      // Unsichere oder fehlende URL: Text behalten, Link verwerfen.
      tokens.push(url ? { kind: "link", text: label, href: url } : { kind: "text", text: label });
    }

    cursor = match.index + full.length;
  }

  if (cursor < line.length) {
    tokens.push({ kind: "text", text: decodeEntities(line.slice(cursor)) });
  }

  return tokens;
}

export interface BriefingSection {
  /** Erste fette Zeile der Sektion, z. B. "🌤 Wetter Koblenz". */
  heading: string | null;
  /** Restliche Zeilen, bereits in Tokens zerlegt. */
  lines: Token[][];
}

/** Den Blob an den ─────-Trennern in Sektionen schneiden. */
export function parseBriefing(text: string): BriefingSection[] {
  return text
    .split(SECTION_SEPARATOR)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const rawLines = block.split("\n").filter((l) => l.trim() !== "");
      const lines = rawLines.map(tokenizeLine);

      // Überschriften sehen aus wie "🌤 <b>Wetter Koblenz</b>": genau ein
      // Fett-Token, keine Links, drumherum höchstens ein Emoji.
      const first = lines[0];
      const isHeading =
        first !== undefined &&
        first.filter((t) => t.kind === "bold").length === 1 &&
        !first.some((t) => t.kind === "link") &&
        first
          .filter((t) => t.kind === "text")
          .every((t) => t.text.trim().length <= 3);

      if (!isHeading) return { heading: null, lines };

      // Emoji vor der Fettschrift gehört zur Überschrift dazu.
      const heading = first
        .map((t) => ("text" in t ? t.text : ""))
        .join("")
        .trim();

      return { heading, lines: lines.slice(1) };
    });
}
