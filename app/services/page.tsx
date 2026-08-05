import type { Metadata } from "next";
import { ServicePicker } from "@/components/ServicePicker";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Modular manufacturing services from factory sourcing through testing and delivery.",
};

const steps = [
  "Discover the brief",
  "Scope the stages",
  "Execute with the factory",
  "Report and hand off",
];

export default function ServicesPage() {
  return (
    <main>
      <section className="section">
        <p className="eyebrow">Services</p>
        <h1>Choose the stages you need.</h1>
        <p className="lede">
          From finding a factory to packing and testing — price each stage, then
          inquire with a shortlist.
        </p>
      </section>

      <section className="section">
        <h2>How I work</h2>
        <ol className="process-strip">
          {steps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <ServicePicker />
      </section>
    </main>
  );
}
