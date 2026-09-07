"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { resetVideoLoadGate } from "@/lib/videoLoadQueue";

/** Reset hero→visibility media gate on each client navigation. */
export function VideoLoadGateReset() {
  const pathname = usePathname();

  useEffect(() => {
    resetVideoLoadGate();
  }, [pathname]);

  return null;
}
