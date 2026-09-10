import { asset } from "@/lib/assets";
import { supplierDiscoveryVerificationImages } from "@/content/serviceCoverMedia";

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
  /** Mobile (≤900px) panel video; falls back to panelVideo when omitted */
  panelVideoMobile?: string;
  /** HTMLMediaElement.playbackRate when panelVideo is set */
  panelVideoPlaybackRate?: number;
  /**
   * Price ticker panel — `$` + amount easing from → to while the card is active.
   * Mutually exclusive with panelVideo / panelImages when set.
   */
  panelPriceCountdown?: {
    from: number;
    to: number;
    /** Descent duration in ms (default in component). */
    durationMs?: number;
  };
  /**
   * Right-panel media fit. Default `true` = cover the media pane edge-to-edge.
   * Set `false` only when the asset must stay letterboxed / not cropped.
   */
  panelFullscreen?: boolean;
};

/**
 * Home End-to-End support — horizontal frosted panels + copy below.
 */
export const supportKnowCards: SupportKnowCard[] = [
  {
    id: "supplier-discovery-verification",
    headline: "Supplier Discovery & Verification",
    size: "xl",
    panelImages: [...supplierDiscoveryVerificationImages],
    description:
      "Connect you with suitable suppliers based on your product category, technical requirements, and production capabilities. Through factory evaluations and direct communication, verify their experience, capabilities, and suitability before moving forward.",
  },
  {
    id: "cost-evaluation-negotiation",
    headline: "Cost Optimization",
    size: "md",
    panelPriceCountdown: {
      from: 10.58,
      to: 10.31,
      durationMs: 5600,
    },
    description:
      "Evaluate pricing through systematic cost breakdowns and years of sourcing experience. I identify where costs are actually generated, assess reasonable cost ranges, and negotiate from a well-informed position while maintaining quality and production feasibility.",
  },
  {
    id: "manufacturing-localization",
    headline: "Manufacturing Localization",
    size: "xl",
    panelVideo:
      "https://assets.iamedx.com/images/home/Manufacturing%20Localization..mp4",
    description:
      "Translate your designs and technical requirements into clear, production-ready instructions that Chinese manufacturers can understand and execute. I break down the design, fill in missing manufacturing details, recommend suitable processes, and prepare localized production documentation that turns your design intent into clear, actionable factory instructions.",
  },
  {
    id: "prototype-development",
    headline: "Prototype Development",
    size: "xl",
    panelVideo:
      "https://assets.iamedx.com/images/home/From%20concept%20to%20delivery/Prototype%20Development/desktop.mp4",
    panelVideoMobile:
      "https://assets.iamedx.com/images/home/From%20concept%20to%20delivery/Prototype%20Development/phone1.mp4",
    description:
      "Support the transition from concept to physical product by reviewing designs, identifying manufacturing challenges, coordinating prototypes, and refining details through multiple iterations. The goal is to ensure the final design is not only visually accurate but also practical for mass production.",
  },
  {
    id: "production-management",
    headline: "Production Management",
    size: "xl",
    panelVideo:
      "https://assets.iamedx.com/images/home/Production%20Management.mp4",
    description:
      "Keep production under close supervision from start to finish with professional tools. I track critical milestones, verify key production steps before moving forward, resolve issues as they arise, and keep each stage connected to prevent delays and costly mistakes.",
  },
  {
    id: "quality-control-compliance",
    headline: "Quality Management",
    size: "md",
    panelVideo:
      "https://assets.iamedx.com/images/home/Quality%20Control%20%26amp%3B%20Compliance%20Assurance.mp4",
    description:
      "Set practical quality standards based on your product positioning, production realities, and cost expectations. When needed, I can establish a low-cost 100% inspection setup in China to check every unit before shipment, rather than relying solely on random sampling.",
  },
  {
    id: "compliance-testing",
    headline: "Compliance & Testing",
    size: "md",
    panelVideo: asset(
      "images/service/Product%20Compliance%20%26amp%3B%20Testing%20Coordination.m4v",
    ),
    description:
      "Engage testing labs before mass production, using the target market and a material-level product breakdown to define the required tests. I coordinate factories and labs, address testing issues and corrective actions, and follow through until the required compliance reports are completed.",
  },
  {
    id: "packaging-development",
    headline: "Packaging Development",
    size: "md",
    panelVideo:
      "https://assets.iamedx.com/images/home/Packaging%20Development..mp4",
    description:
      "Develop packaging with product protection as the priority while keeping it cost-effective. I can also build a distinctive packaging language across your product line and create a more premium unboxing experience at a low cost.",
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
  title: "From concept to delivery.",
} as const;

/** @deprecated Prefer supportKnowCards */
export const supportStackCards = supportKnowCards;
/** @deprecated Prefer supportKnowCards */
export const supportBentoCards = supportKnowCards;
