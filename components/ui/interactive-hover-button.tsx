import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  href?: string;
  external?: boolean;
}

function InteractiveHoverButtonContent({ text }: { text: string }) {
  return (
    <>
      <span className="interactive-hover-button__idle relative z-20 flex w-full items-center justify-center gap-1.5 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        <span
          className="interactive-hover-button__dot-idle h-2 w-2 shrink-0 rounded-lg bg-primary"
          aria-hidden="true"
        />
        <span>{text}</span>
      </span>
      <div className="absolute inset-0 z-10 flex items-center justify-center gap-1.5 text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span>{text}</span>
        <ArrowRight className="size-3 shrink-0" aria-hidden="true" />
      </div>
      <div className="interactive-hover-button__dot absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 scale-[1] rounded-lg bg-primary opacity-0 transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:translate-x-0 group-hover:translate-y-0 group-hover:scale-[1.8] group-hover:opacity-100" />
    </>
  );
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, href, external, type = "button", ...props }, ref) => {
  const classes = cn(
    "group relative inline-flex min-h-[2.25rem] w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-background px-3 py-2 text-center font-semibold no-underline",
    className,
  );

  if (href) {
    if (external || /^(https?:|mailto:|tel:)/i.test(href)) {
      return (
        <a
          href={href}
          className={classes}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          <InteractiveHoverButtonContent text={text} />
        </a>
      );
    }

    return (
      <Link href={href} className={classes}>
        <InteractiveHoverButtonContent text={text} />
      </Link>
    );
  }

  return (
    <button ref={ref} type={type} className={classes} {...props}>
      <InteractiveHoverButtonContent text={text} />
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
