import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clients",
  description:
    "Clients Edward Xu partners with across product development and manufacturing in China.",
};

export default function ClientsPage() {
  return (
    <main>
      <section className="section">
        <p className="eyebrow">Clients</p>
        <h1>Clients</h1>
        <p className="lede">
          A roster of the people and brands I work with — coming next.
        </p>
      </section>
    </main>
  );
}
