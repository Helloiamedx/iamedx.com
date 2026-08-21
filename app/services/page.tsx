import type { Metadata } from "next";
import { ServicesFlowStory } from "@/components/ServicesFlowStory";

export const metadata: Metadata = {
  title: "Services",
  description:
    "China sourcing and manufacturing in three phases — pre-production, mass production, and quality control & delivery.",
};

export default function ServicesPage() {
  return (
    <main className="services-page">
      <ServicesFlowStory />
    </main>
  );
}
