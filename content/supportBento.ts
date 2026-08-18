export type SupportBentoCard = {
  id: string;
  title: string;
  /** Optional short line under the title */
  description?: string;
  /** Visual accent key for CSS art */
  visual: SupportBentoVisual;
  /** Grid weight — a few wider tiles for bento rhythm */
  size: "wide" | "standard";
};

export type SupportBentoVisual =
  | "sourcing"
  | "audit"
  | "product"
  | "evaluate"
  | "cost"
  | "sample"
  | "followup"
  | "quality"
  | "loading"
  | "packaging"
  | "shipment";

/**
 * Home “How I Can Support You” — one bento card per service (11).
 */
export const supportBentoCards: SupportBentoCard[] = [
  {
    id: "supplier-sourcing",
    title: "Supplier Sourcing",
    visual: "sourcing",
    size: "wide",
  },
  {
    id: "factory-verification",
    title: "Factory Verification & Audit",
    visual: "audit",
    size: "wide",
  },
  {
    id: "product-development",
    title: "Product Development",
    visual: "product",
    size: "standard",
  },
  {
    id: "supplier-evaluation",
    title: "Supplier Evaluation & Comparison",
    visual: "evaluate",
    size: "standard",
  },
  {
    id: "price-negotiation",
    title: "Price Negotiation & Cost Optimization",
    visual: "cost",
    size: "standard",
  },
  {
    id: "sample-development",
    title: "Sample Development & Approval",
    visual: "sample",
    size: "standard",
  },
  {
    id: "production-follow-up",
    title: "Production Follow-Up",
    visual: "followup",
    size: "standard",
  },
  {
    id: "quality-control",
    title: "Quality Control & AQL Inspection Report",
    visual: "quality",
    size: "standard",
  },
  {
    id: "container-loading",
    title: "Container Loading Inspection & Report",
    visual: "loading",
    size: "standard",
  },
  {
    id: "packaging-development",
    title: "Packaging Development",
    visual: "packaging",
    size: "standard",
  },
  {
    id: "shipment-coordination",
    title: "Shipment & Delivery Coordination",
    visual: "shipment",
    size: "standard",
  },
];

export const supportBentoSection = {
  title: "How I Can Support You",
  subtitle:
    "From sourcing and development through production, quality, and delivery.",
} as const;
