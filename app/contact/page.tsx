import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { getServiceById } from "@/content/services";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact iamedx at hello@iamedx.com",
};

type ContactPageProps = {
  searchParams: Promise<{ services?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const serviceIds = (params.services ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const selectedLabels = serviceIds
    .map((id) => getServiceById(id)?.title)
    .filter((title): title is string => Boolean(title));

  const preset =
    selectedLabels.length > 0
      ? `I am interested in: ${selectedLabels.join(", ")}.`
      : "";

  return (
    <main className="section contact">
      <p className="eyebrow">Contact</p>
      <h1>Let’s talk about your product.</h1>
      <p className="lede">
        Email{" "}
        <a href="mailto:hello@iamedx.com">hello@iamedx.com</a> or send a short
        note below.
      </p>
      <ContactForm presetMessage={preset} />
    </main>
  );
}
