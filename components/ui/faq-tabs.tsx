"use client";

import {
  useEffect,
  useId,
  useState,
  type HTMLAttributes,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type FAQItemData = {
  question: string;
  answer: string;
};

export type FAQCategories = Record<string, string>;
export type FAQData = Record<string, FAQItemData[]>;

export type FAQProps = HTMLAttributes<HTMLElement> & {
  categories: FAQCategories;
  faqData: FAQData;
  tocLabel?: string;
};

const EASE = [0.455, 0.03, 0.515, 0.955] as const;

/**
 * FAQ body — category TOC left, accordion right.
 * Hero (eyebrow / title / desc) lives on the page via FaqPageHero.
 */
export function FAQ({
  categories,
  faqData,
  tocLabel = "Table of Contents",
  className,
  ...props
}: FAQProps) {
  const categoryKeys = Object.keys(categories);
  const [selectedCategory, setSelectedCategory] = useState(
    categoryKeys[0] ?? "",
  );
  const tocId = useId();

  if (!categoryKeys.length) return null;

  const questions = faqData[selectedCategory] ?? [];

  return (
    <section className={cn("faq-shell", className)} {...props}>
      <div className="faq-shell__body">
        <nav className="faq-shell__toc" aria-labelledby={tocId}>
          <p id={tocId} className="faq-shell__toc-label">
            {tocLabel}
          </p>
          <ul className="faq-shell__toc-list">
            {categoryKeys.map((key) => {
              const active = selectedCategory === key;
              return (
                <li key={key}>
                  <button
                    type="button"
                    className={cn(
                      "faq-shell__toc-btn",
                      active && "is-active",
                    )}
                    aria-current={active ? "true" : undefined}
                    onClick={() => setSelectedCategory(key)}
                  >
                    {categories[key]}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="faq-shell__panel">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selectedCategory}
              className="faq-shell__list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              {questions.map((faq) => (
                <FAQItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: FAQItemData) {
  const [isOpen, setIsOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const buttonId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <div className={cn("faq-shell__item", isOpen && "is-open")}>
      <button
        id={buttonId}
        type="button"
        className="faq-shell__trigger"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="faq-shell__q">{question}</span>
        <span className="faq-shell__icon" aria-hidden="true">
          {isOpen ? <Minus strokeWidth={2} /> : <Plus strokeWidth={2} />}
        </span>
      </button>
      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={
          reduceMotion
            ? { duration: 0.01 }
            : { duration: 0.32, ease: EASE }
        }
        className="faq-shell__answer-wrap"
      >
        <p className="faq-shell__answer">{answer}</p>
      </motion.div>
    </div>
  );
}

export default FAQ;
