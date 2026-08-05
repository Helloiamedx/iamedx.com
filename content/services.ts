export type ServicePrice = number | { from: number };

export type Service = {
  id: string;
  title: string;
  summary: string;
  deliverables: string[];
  price: ServicePrice;
  order: number;
};

export const currency = "USD" as const;

export const services: Service[] = [
  {
    id: "factory-sourcing",
    title: "Factory sourcing",
    summary: "Find and shortlist factories that match your product, volume, and quality bar.",
    deliverables: ["Supplier shortlist", "Capability notes", "Introductions"],
    price: { from: 0 },
    order: 1,
  },
  {
    id: "product-development",
    title: "Product development",
    summary: "Translate your idea into a manufacturable spec and development plan.",
    deliverables: ["Spec outline", "Material guidance", "Development roadmap"],
    price: { from: 0 },
    order: 2,
  },
  {
    id: "factory-verification",
    title: "Factory verification",
    summary: "Validate factory capability, process control, and fit before you commit.",
    deliverables: ["On-site or remote audit notes", "Risk flags", "Go / no-go recommendation"],
    price: { from: 0 },
    order: 3,
  },
  {
    id: "sample-development",
    title: "Sample development",
    summary: "Drive sampling rounds until the product is ready for production.",
    deliverables: ["Sample coordination", "Revision tracking", "Approval checklist"],
    price: { from: 0 },
    order: 4,
  },
  {
    id: "production-management",
    title: "Production management",
    summary: "Oversee production timelines, quality checkpoints, and factory communication.",
    deliverables: ["Production schedule", "QC checkpoints", "Status reporting"],
    price: { from: 0 },
    order: 5,
  },
  {
    id: "custom-packaging",
    title: "Custom packaging",
    summary: "Design and produce packaging that protects the product and fits the brand.",
    deliverables: ["Packaging options", "Artwork coordination", "Sample pack-outs"],
    price: { from: 0 },
    order: 6,
  },
  {
    id: "delivery-logistics",
    title: "Delivery & logistics",
    summary: "Coordinate delivery from factory exit through to your destination.",
    deliverables: ["Shipping plan", "Docs checklist", "Handoff support"],
    price: { from: 0 },
    order: 7,
  },
  {
    id: "testing-reports",
    title: "Testing & lab reports",
    summary: "Arrange testing and inspection reports required for market entry or retail.",
    deliverables: ["Test plan", "Lab coordination", "Report package"],
    price: { from: 0 },
    order: 8,
  },
];

export function getServiceById(id: string) {
  return services.find((service) => service.id === id);
}
