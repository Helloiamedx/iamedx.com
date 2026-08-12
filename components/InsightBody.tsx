import type { ReactNode } from "react";

type InsightBodyProps = {
  content: string;
};

/** Wrap pull emphasis with curly quotes and a space inside each side. */
function withPullQuotes(text: string): string {
  let inner = text.trim();
  inner = inner
    .replace(/^[“"']\s*/, "")
    .replace(/\s*[”"']\s*$/, "")
    .trim();
  return `“ ${inner} ”`;
}

/** Strip a full-string bold / bold-italic wrapper (`**…**` or `***…***`). */
function unwrapEmphasis(text: string): { plain: string; emphasized: boolean } {
  const trimmed = text.trim();
  if (/^\*\*\*[\s\S]+\*\*\*$/.test(trimmed) && trimmed.length >= 6) {
    return { plain: trimmed.slice(3, -3).trim(), emphasized: true };
  }
  if (/^\*\*[\s\S]+\*\*$/.test(trimmed) && trimmed.length >= 4) {
    return { plain: trimmed.slice(2, -2).trim(), emphasized: true };
  }
  return { plain: trimmed, emphasized: false };
}

/** Render **bold** spans; leave all other characters untouched. */
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("***") && part.endsWith("***") && part.length >= 6) {
      return (
        <strong key={index} className="insight-detail__pull">
          {withPullQuotes(part.slice(3, -3))}
        </strong>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

/**
 * Insight article body from Markdown hierarchy only:
 * `##` headings, `>` quotations, `**bold**` / `***bold-italic***` emphasis.
 * No divider lines or cards.
 */
export function InsightBody({ content }: InsightBodyProps) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <article className="insight-detail__body">
      {blocks.map((block, index) => {
        if (block.startsWith("## ")) {
          const heading = block.slice(3).trimEnd();
          return (
            <h2 key={index} className="insight-detail__heading">
              {renderInline(heading)}
            </h2>
          );
        }

        const lines = block.split("\n");
        if (lines.every((line) => line.trimStart().startsWith(">"))) {
          const quote = lines
            .map((line) => line.replace(/^\s*>\s?/, ""))
            .join("\n");
          const { plain, emphasized } = unwrapEmphasis(quote);
          if (emphasized) {
            return (
              <blockquote
                key={index}
                className="insight-detail__quote insight-detail__quote--pull"
              >
                <p>{withPullQuotes(plain)}</p>
              </blockquote>
            );
          }
          return (
            <blockquote key={index} className="insight-detail__quote">
              <p>{renderInline(quote)}</p>
            </blockquote>
          );
        }

        return (
          <p key={index}>{renderInline(block.replace(/\n/g, " "))}</p>
        );
      })}
    </article>
  );
}
