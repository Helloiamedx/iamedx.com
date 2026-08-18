import type { FAQCategories, FAQData } from "@/components/ui/faq-tabs";

/** Site FAQ — categories + copy for the global strip (every page except home) */
export const siteFaqCategories: FAQCategories = {
  partnership: "Partnership",
  process: "Process",
  production: "Production",
  logistics: "Logistics",
};

export const siteFaqData: FAQData = {
  partnership: [
    {
      question: "What do you actually do for clients?",
      answer:
        "I act as your accountable partner across product development and China manufacturing — from design handoff and supplier sourcing through sampling, production, QC, packaging, and delivery. One point of contact instead of a handoff chain of vendors.",
    },
    {
      question: "Who is this for?",
      answer:
        "Brands and teams that need a reliable, controllable supply chain in China — especially when the product is more than a logo slap and quality, timing, and factory alignment actually matter.",
    },
    {
      question: "Do I have to use every stage of your process?",
      answer:
        "No. You can scope only the stages you need — development, sampling, production, QC, packaging, or shipment — then expand factory by factory until the product matches what you approved.",
    },
    {
      question: "How do you protect my interests with factories?",
      answer:
        "Loyalty to the client comes first. I negotiate hard, keep decisions written, catch issues before they become expensive, and stay transparent about timeline and quality so you are never guessing.",
    },
  ],
  process: [
    {
      question: "What does a typical engagement look like?",
      answer:
        "We align on scope and product goals, break down the design, source or validate suppliers, iterate samples with clear checkpoints, lock production, run QC, and coordinate packaging and shipment — with written decisions so nothing gets lost between rounds.",
    },
    {
      question: "How do feedback loops work?",
      answer:
        "Tight loops: samples, QC checkpoints, and documented sign-offs. You always know what changed, why, and what happens next.",
    },
    {
      question: "Can you work from our existing factory relationships?",
      answer:
        "Yes. I can plug into factories you already use, or bring new suppliers when the product, region, or capacity needs a better fit.",
    },
    {
      question: "What languages and time zones do you cover?",
      answer:
        "I work across China manufacturing and international clients, coordinating in English and Chinese so engineering meetings, QC, and shipment decisions stay clear on both sides.",
    },
  ],
  production: [
    {
      question: "What product categories have you handled?",
      answer:
        "Consumer and collectible products across multiple categories — from soft goods and packaging-led SKUs to more engineered items — always with the same bar for sample fidelity and production control.",
    },
    {
      question: "How do you handle quality control?",
      answer:
        "QC is built into the process, not bolted on at the end: checkpoints during sampling and production, clear fail criteria, and accountability through final inspection before shipment.",
    },
    {
      question: "What if the factory misses the sample or timeline?",
      answer:
        "I surface issues early, push corrective action, and protect the schedule where possible — including recovery plans when shipment adjustments are required.",
    },
    {
      question: "Do you support packaging development?",
      answer:
        "Yes. Packaging is part of the same accountable path as the product — structure, finish, and production follow-through so the unboxing matches what you signed off.",
    },
  ],
  logistics: [
    {
      question: "Do you coordinate packaging and delivery?",
      answer:
        "Yes. From packaging development through final delivery coordination, so product and ship-ready presentation stay aligned.",
    },
    {
      question: "How do on-time deliveries work when plans change?",
      answer:
        "Schedules are tracked actively. When recovery or shipment adjustments are needed, I manage the path so you still have a clear landing window.",
    },
    {
      question: "Can you support large production volumes?",
      answer:
        "Scale is part of the work — including projects that move into high unit counts — with the same discipline on sampling, QC, and factory coordination.",
    },
    {
      question: "How should I get started?",
      answer:
        "Reach out with the product, timeline, and what stage you need help with. We will scope a clear path — then move factory by factory until the product matches what you approved.",
    },
  ],
};
