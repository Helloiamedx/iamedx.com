import type { ReactNode } from "react";

type InsightBodyProps = {
  content: string;
};

/** Render **bold** spans; leave all other characters untouched. */
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

/**
 * Insight article body from Markdown hierarchy only:
 * `##` headings, `>` quotations, `**bold**` emphasis, otherwise paragraphs.
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
