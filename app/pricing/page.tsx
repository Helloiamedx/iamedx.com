import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Clear pricing for product development, manufacturing, and supply-chain partnership in China.",
};

export default function PricingPage() {
  return (
    <main>
      <section className="section">
        <p className="eyebrow">Pricing</p>
        <h1>Pricing</h1>
        <p className="lede">
          Scope the stages you need — then get a clear quote for a tailored China
          supply chain.
        </p>
      </section>
    </main>
  );
}
