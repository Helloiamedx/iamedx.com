import type { Metadata } from "next";
import { HeadlineMotionLab } from "./HeadlineMotionLab";

export const metadata: Metadata = {
  title: "Headline motion lab",
  robots: { index: false, follow: false },
};

/**
 * Developer-only harness for the seven fixed headline effects.
 * Not linked from the site and excluded from the sitemap.
 */
export default function HeadlineMotionDevPage() {
  return <HeadlineMotionLab />;
}
