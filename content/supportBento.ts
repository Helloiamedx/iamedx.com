export type SupportKnowCard = {
  id: string;
  /** Card title under the panel */
  headline: string;
  /** Body under the title */
  description: string;
  /** Width variant — `md` = 1 card, `lg` ≈ 1.5, `xl` ≈ 2 */
  size: "sm" | "md" | "lg" | "xl";
  /** Vertical stack frames for the panel (optional) */
  panelImages?: string[];
  /** object-position for panel images (`right` = right-aligned crop) */
  panelImageAlign?: "center" | "top" | "right";
  /** Looping panel video (optional) */
  panelVideo?: string;
  /** HTMLMediaElement.playbackRate when panelVideo is set */
  panelVideoPlaybackRate?: number;
};

/**
 * Home End-to-End support — horizontal frosted panels + copy below.
 */
export const supportKnowCards: SupportKnowCard[] = [
  {
    id: "supplier-discovery-verification",
    headline: "Supplier Discovery & Verification",
    size: "xl",
    panelImages: [
      "https://assets.iamedx.com/images/home/1.jpeg",
      "https://assets.iamedx.com/images/home/2.jpg",
      "https://assets.iamedx.com/images/home/3.jpg",
      "https://assets.iamedx.com/images/home/4.jpeg",
      "https://assets.iamedx.com/images/home/5.jpeg",
      "https://assets.iamedx.com/images/home/6.jpeg",
    ],
    description:
      "Connect you with suitable suppliers based on your product category, technical requirements, production capabilities, and project goals. Through factory evaluations and direct communication, verify their experience, capabilities, and suitability before moving forward.",
  },
  {
    id: "cost-evaluation-negotiation",
    headline: "Cost Evaluation & Negotiation",
    size: "md",
    panelVideo:
      "https://assets.iamedx.com/images/home/Cost%20Evaluation%20%26%20Negotiation.mp4",
    description:
      "Analyze product structures, materials, processes, and production requirements to evaluate whether pricing is reasonable and competitive. By communicating directly with suppliers and understanding the real cost structure, help optimize costs while maintaining product quality and production feasibility.",
  },
  {
    id: "manufacturing-localization",
    headline: "Manufacturing Localization",
    size: "xl",
    panelVideo:
      "https://assets.iamedx.com/images/home/Manufacturing%20Localization..mp4",
    description:
      "Help you identify the right manufacturing solutions in China by understanding your product requirements, materials, production methods, and target positioning. Instead of simply finding a supplier, evaluate how your product can be produced efficiently, reliably, and at the right quality level within the local manufacturing environment.",
  },
  {
    id: "prototype-development",
    headline: "Prototype Development",
    size: "xl",
    panelVideo:
      "https://assets.iamedx.com/images/home/Prototype%20Development.mov",
    description:
      "Support the transition from concept to physical product by reviewing designs, identifying manufacturing challenges, coordinating prototypes, and refining details through multiple iterations. The goal is to ensure the final design is not only visually accurate but also practical for mass production.",
  },
  {
    id: "production-management",
    headline: "Production Management",
    size: "xl",
    panelVideo:
      "https://assets.iamedx.com/images/home/Production%20Management.mov",
    description:
      "Coordinate communication between you and suppliers throughout the production process, tracking progress, resolving issues, and ensuring every critical detail is properly managed. From initial production preparation to final completion, help keep projects moving smoothly and efficiently.",
  },
  {
    id: "quality-control-compliance",
    headline: "Quality Control & Compliance Assurance",
    size: "md",
    panelVideo:
      "https://assets.iamedx.com/images/home/Quality%20Control%20%26%20Compliance%20Assurance.mov",
    description:
      "Establish clear quality standards, monitor production processes, and identify potential risks before they become costly problems. Through inspections, testing coordination, and on-site follow-up, help ensure products meet your expectations and required market standards.",
  },
  {
    id: "packaging-development",
    headline: "Packaging Development",
    size: "md",
    panelVideo:
      "https://assets.iamedx.com/images/home/Packaging%20Development..mp4",
    description:
      "Help develop packaging solutions that balance product protection, visual presentation, and cost efficiency. By considering materials, structure, user experience, and shipping requirements, ensure the packaging supports both the product and your brand positioning.",
  },
  {
    id: "logistics-coordination",
    headline: "Logistics Coordination",
    size: "md",
    panelImages: [
      "https://assets.iamedx.com/images/home/Logistics%20Coordination.jpg",
    ],
    panelImageAlign: "right",
    description:
      "Support the final stage of your supply chain by coordinating shipment preparation, documentation, packaging requirements, and delivery arrangements. Ensure your products move from factory to destination smoothly with fewer unexpected issues.",
  },
];

export const supportBentoSection = {
  title: "End-to-End Support Across Your Entire Supply Chain",
  subtitle:
    "From finding the right suppliers to delivering finished products, I manage every critical stage of the process in China — providing a single point of contact to coordinate development, production, quality, and delivery.",
  backgroundImage:
    "https://assets.iamedx.com/images/home/End-to-End%20Support.jpg",
} as const;

/** @deprecated Prefer supportKnowCards */
export const supportStackCards = supportKnowCards;
/** @deprecated Prefer supportKnowCards */
export const supportBentoCards = supportKnowCards;
