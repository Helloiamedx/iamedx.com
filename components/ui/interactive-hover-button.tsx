import * as React from "react";

import {
  OriginButton,
  type OriginButtonProps,
} from "@/components/ui/origin-button";

interface InteractiveHoverButtonProps
  extends Omit<OriginButtonProps, "children"> {
  text?: string;
}

/** @deprecated Use OriginButton — kept for legacy imports. */
const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, ...props }, ref) => {
  return (
    <OriginButton ref={ref} className={className} {...props}>
      {text}
    </OriginButton>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
