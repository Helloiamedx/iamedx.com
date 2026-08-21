import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type FlowSectionProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  style?: CSSProperties;
};

type FlowArtProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function FlowSection({
  children,
  className,
  style,
  ...props
}: FlowSectionProps) {
  return (
    <section className={cn("flow-section", className)} style={style} {...props}>
      <div className="flow-section__inner">{children}</div>
    </section>
  );
}

export default function FlowArt({ children, className, ...props }: FlowArtProps) {
  const sections = Children.toArray(children).filter(isValidElement);

  return (
    <div className={cn("flow-art", className)} {...props}>
      {sections.map((child, index) =>
        cloneElement(child as ReactElement<FlowSectionProps>, {
          key: child.key ?? `flow-section-${index}`,
          style: {
            ...(child as ReactElement<FlowSectionProps>).props.style,
            zIndex: index + 1,
          },
        }),
      )}
    </div>
  );
}
