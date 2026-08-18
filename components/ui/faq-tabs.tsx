"use client";

import {
  useState,
  type HTMLAttributes,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type FAQItemData = {
  question: string;
  answer: string;
};

export type FAQCategories = Record<string, string>;
export type FAQData = Record<string, FAQItemData[]>;

export type FAQProps = HTMLAttributes<HTMLElement> & {
  title?: string;
  subtitle?: string;
  categories: FAQCategories;
  faqData: FAQData;
};

/** Reusable FAQ with category tabs + accordion answers */
export function FAQ({
  title = "FAQs",
  subtitle,
  categories,
  faqData,
  className,
  ...props
}: FAQProps) {
  const categoryKeys = Object.keys(categories);
  const [selectedCategory, setSelectedCategory] = useState(
    categoryKeys[0] ?? "",
  );

  if (!categoryKeys.length) return null;

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-background px-4 py-12 text-foreground",
        className,
      )}
      {...props}
    >
      <FAQHeader title={title} subtitle={subtitle} />
      <FAQTabs
        categories={categories}
        selected={selectedCategory}
        setSelected={setSelectedCategory}
      />
      <FAQList faqData={faqData} selected={selectedCategory} />
    </section>
  );
}

function FAQHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="site-faq__header relative z-10 flex flex-col items-center justify-center">
      {subtitle ? (
        <span className="mb-8 text-sm font-medium text-foreground/80">
          {subtitle}
        </span>
      ) : null}
      <h2 className="site-faq__title text-center text-4xl tracking-tight md:text-5xl">
        {title}
      </h2>
    </div>
  );
}

function FAQTabs({
  categories,
  selected,
  setSelected,
}: {
  categories: FAQCategories;
  selected: string;
  setSelected: (key: string) => void;
}) {
  return (
    <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
      {Object.entries(categories).map(([key, label]) => {
        const isActive = selected === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setSelected(key)}
            className={cn(
              "site-faq__tab relative overflow-hidden whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors duration-500",
              isActive ? "text-black" : "bg-transparent text-white",
            )}
            data-active={isActive ? "true" : "false"}
          >
            <span className="site-faq__tab-label relative z-10">{label}</span>
            <AnimatePresence>
              {isActive ? (
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.5, ease: "backIn" }}
                  className="absolute inset-0 z-0 bg-gradient-to-r from-white to-neutral-400"
                />
              ) : null}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}

function FAQList({
  faqData,
  selected,
}: {
  faqData: FAQData;
  selected: string;
}) {
  return (
    <div className="relative z-10 mx-auto mt-12 max-w-3xl">
      <AnimatePresence mode="wait">
        {Object.entries(faqData).map(([category, questions]) => {
          if (selected !== category) return null;
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: "backIn" }}
              className="space-y-3"
            >
              {questions.map((faq) => (
                <FAQItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function FAQItem({ question, answer }: FAQItemData) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      animate={isOpen ? "open" : "closed"}
      className="site-faq__item rounded-xl bg-card"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
      >
        <span
          className={cn(
            "site-faq__q text-lg transition-colors",
            isOpen ? "text-foreground" : "text-white/55",
          )}
        >
          {question}
        </span>
        <motion.span
          variants={{
            open: { rotate: "45deg" },
            closed: { rotate: "0deg" },
          }}
          transition={{ duration: 0.2 }}
        >
          <Plus
            className={cn(
              "h-5 w-5 transition-colors",
              isOpen ? "text-foreground" : "text-white/55",
            )}
          />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : "0px",
          marginBottom: isOpen ? "16px" : "0px",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden px-4"
      >
        <p className="site-faq__answer">{answer}</p>
      </motion.div>
    </motion.div>
  );
}

export default FAQ;
