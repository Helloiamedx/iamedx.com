import { notFound } from "next/navigation";
import { IntroTestClient } from "./IntroTestClient";

/**
 * Local preview for the home fullscreen intro.
 * Visit `/dev/intro-test` — Replay does not need a hard refresh or localStorage clear.
 * Hidden in production.
 */
export default function IntroTestPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <IntroTestClient />;
}
