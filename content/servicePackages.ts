/**
 * Source of truth — China Sourcing & Manufacturing Service Packages
 * (from: "China Sourcing & Manufacturing Service Packages - 工作表1.pdf")
 *
 * When the user asks about Services page scope, stages, fees, tools, or
 * deliverables, prefer this file over inventing copy.
 *
 * Each line item carries the five core fields:
 * 1. title — 服务事项
 * 2. description — 描述
 * 3. assistance — 工具 / 行业协助（软件、知识、网络等）
 * 4. deliverables — 可交付成果
 * 5. fee — 费用标签
 * Plus optional timeline / notes / sample links from the sheet.
 */

import { asset } from "@/lib/assets";
import { supplierDiscoveryVerificationImages } from "@/content/serviceCoverMedia";

export type ServicePackageFee = {
  /** Display label, e.g. "$350.00" or "Free" */
  label: string;
  /** Numeric USD when known; null for Free / N/A */
  amountUsd: number | null;
};

export type ServicePackageItem = {
  id: string;
  /** e.g. P1.1 */
  code: string;
  /** 服务事项 */
  title: string;
  /** 描述 */
  description: string;
  /** 工具 / Assistance */
  assistance: string[];
  /** 可交付成果 */
  deliverables: string[];
  /** Timeline from the sheet when provided */
  timeline?: string;
  /** 费用标签 */
  fee: ServicePackageFee;
  /** Footnote refs like [1], [2] */
  notes?: string[];
  /** Sample report / quotation links from the sheet */
  sampleLinks?: { label: string; href: string }[];
  /** Card media loop (services page) */
  coverVideo?: string;
  /** Card image stack — same recipe as home Support panels */
  coverImages?: readonly string[];
};

export type ServicePackagePhase = {
  id: string;
  /** e.g. P1 */
  code: string;
  title: string;
  /** Phase-level description */
  description: string;
  /** Phase roll-up fee when the sheet lists one */
  fee?: ServicePackageFee;
  /** Phase-level timeline when listed (e.g. ≈ 35 days) */
  timeline?: string;
  items: ServicePackageItem[];
};

/** Footnotes from page 3 of the sheet */
export const servicePackageFootnotes: Record<string, string> = {
  "1": "The actual timeline depends on the factory location and travel distance. Within 1,000 km: usually 1–2 business days. Over 1,000 km: usually 2–3 business days.",
  "2": "Travel-related expenses will be reimbursed based on actual costs with receipts provided.",
  "3": "The actual timeline depends on the factory location and travel distance. Within 1,000 km: usually 1–2 business days. Over 1,000 km: usually 2–3 business days.",
  "4": "The actual timeline depends on the factory location and travel distance. Within 1,000 km: usually 1–2 business days. Over 1,000 km: usually 2–3 business days.",
};

export const servicePackageTotal = {
  title: "Total Project Investment",
  description:
    "The estimated total investment for managing the complete manufacturing process from supplier identification to final delivery. This includes supplier sourcing, factory verification, product development support, production management, quality control coordination, and delivery assistance.",
  fee: { label: "$2,700.00", amountUsd: 2700 } satisfies ServicePackageFee,
} as const;

export const servicePackagePhases: ServicePackagePhase[] = [
  {
    id: "pre-production",
    code: "P1",
    title: "Pre-Production Phase",
    description:
      "Make sure the product is manufacturable, the right supplier is selected, and production requirements are clearly defined before mass production.",
    timeline: "≈ 35 days",
    fee: { label: "$1,200.00", amountUsd: 1200 },
    items: [
      {
        id: "initial-project-review",
        code: "P1.1",
        title: "Initial Project Review",
        description:
          "Review the client's product information and requirements to understand the project scope, manufacturing needs, and determine whether I can provide suitable support.",
        assistance: [
          "Previous project references",
          "Industry knowledge",
          "Manufacturing experience assessment",
          "Adobe Photoshop",
          "Adobe Illustrator",
          "Adobe Acrobat",
        ],
        deliverables: [
          "Initial feedback on project suitability",
          "Recommended next steps",
          "Confirmation of available support",
        ],
        timeline: "18H",
        fee: { label: "Free", amountUsd: 0 },
        coverVideo: asset("images/service/Initial%20Project%20Review.mov"),
      },
      {
        id: "supplier-identification",
        code: "P1.2",
        title: "Supplier Identification & Initial Supplier Screening",
        description:
          "Identify and evaluate potential suppliers based on the client's product requirements, manufacturing needs, and quality expectations. Shortlist suitable suppliers for further evaluation and cooperation.",
        assistance: [
          "Industry networks and professional contacts",
          "Supplier recommendations from established working relationships",
          "Industry groups and manufacturing communities",
          "Domestic sourcing platforms (1688, Douyin, etc.)",
        ],
        deliverables: [
          "Shortlist of 3–5 recommended suppliers and report",
          "Supplier company information",
          "Product experience",
          "Certifications (if applicable)",
          "MOQ requirements",
          "Estimated pricing range",
          "Lead time",
        ],
        timeline: "3–5 business days",
        fee: { label: "$350.00", amountUsd: 350 },
        coverVideo: asset("images/service/Supplier%20Identification.m4v"),
      },
      {
        id: "supplier-evaluation-audit",
        code: "P1.3",
        title: "Supplier Evaluation & Factory Visit and Audit",
        description:
          "Visit or audit selected factories to verify their actual manufacturing capabilities, production conditions, quality management systems, and suitability for long-term cooperation.",
        assistance: [
          "On-site factory visit",
          "Camera documentation (photos & videos)",
          "Previous product development experience",
          "Manufacturing process knowledge",
          "Quality control experience",
        ],
        deliverables: ["Factory Visit & Audit Report"],
        timeline: "1–2 business days",
        fee: { label: "$250.00", amountUsd: 250 },
        coverImages: supplierDiscoveryVerificationImages,
        notes: ["1", "2"],
        sampleLinks: [
          {
            label: "Sample audit report",
            href: "https://drive.google.com/file/d/1aDFl2AJGNpfcC_EVJSgUh1TYnm9Gn79L/view?usp=sharing",
          },
        ],
      },
      {
        id: "requirement-translation-negotiation",
        code: "P1.4",
        title: "Product Requirement Translation & Supplier Negotiation",
        description:
          "Break down the client's design concept and requirements, translate them into clear manufacturing instructions, and communicate with suppliers to align product expectations, production requirements, and pricing.",
        assistance: [
          "Product development experience",
          "Manufacturing knowledge",
          "Technical communication with factories",
          "Cost negotiation experience",
          "Adobe Photoshop",
          "Adobe Illustrator",
          "Adobe Acrobat",
          "Autodesk Fusion 360",
          "Google Sheets",
        ],
        deliverables: [
          "Manufacturing Instruction Document",
          "Cost Optimization & Supplier Negotiation",
          "Detailed supplier quotation",
        ],
        timeline: "2–3 business days",
        fee: { label: "$250.00", amountUsd: 250 },
        coverVideo: asset(
          "images/service/Product%20Requirement%20Translation%20%26amp%3B%20Supplier%20Negotiation.mp4",
        ),
        sampleLinks: [
          {
            label: "Sample quotation sheet",
            href: "https://drive.google.com/file/d/1PhvQ4bgZYg2pUHVfhfMID7cinyzstMAV/view?usp=sharing",
          },
        ],
      },
      {
        id: "sample-development",
        code: "P1.5",
        title: "Sample Development & Production Validation",
        description:
          "Manage the sample development process, review sample results, identify potential issues, and work with suppliers to optimize the product before mass production.",
        assistance: [
          "Product development experience",
          "Manufacturing knowledge",
          "Sample evaluation experience",
          "Quality control experience",
        ],
        deliverables: [
          "Sample evaluation feedback",
          "Final sample confirmation",
          "Mass production planning confirmation",
        ],
        timeline: "About 2–3 weeks",
        fee: { label: "$350.00", amountUsd: 350 },
        coverVideo: asset(
          "images/service/Sample%20Development%20%26%20Production%20Validation.mov",
        ),
      },
    ],
  },
  {
    id: "mass-production",
    code: "P2",
    title: "Mass Production Management Phase",
    description:
      "Manage the production process to ensure the order is manufactured according to the agreed requirements, timeline, and quality expectations.",
    fee: { label: "$1,250.00", amountUsd: 1250 },
    items: [
      {
        id: "end-to-end-production",
        code: "P2.1",
        title: "End-to-End Production Management",
        description:
          "Manage the entire production process after sample approval, acting as the client's execution partner in China. Coordinate with suppliers, monitor production progress, resolve issues, and ensure all manufacturing activities are completed according to the approved product requirements, quality standards, and delivery timeline.",
        assistance: [
          "Smartsheet",
          "Notion",
          "Product development experience",
          "Manufacturing knowledge",
          "Sample evaluation experience",
          "Quality control experience",
        ],
        deliverables: [
          "Production planning and timeline confirmation",
          "Production coordination and supplier communication",
          "Regular production progress updates",
          "Production issue identification and resolution",
          "First article approval coordination (not on-site)",
          "Production quality follow-up (not on-site inspection)",
          "Packaging planning and confirmation",
          "Delivery preparation coordination",
        ],
        timeline: "Based on production schedule and order complexity",
        fee: { label: "$750.00", amountUsd: 750 },
        coverVideo: asset("images/home/Production%20Management.mov"),
      },
      {
        id: "compliance-testing",
        code: "P2.2",
        title: "Product Compliance & Testing Coordination",
        description:
          "Coordinate product compliance requirements during production, communicate with suppliers and testing laboratories, and ensure required compliance documents are obtained for the target export market.",
        assistance: [
          "Previous product development experience",
          "Product compliance knowledge",
          "Testing coordination experience",
          "Supplier and laboratory communication",
        ],
        deliverables: [
          "Required product compliance testing reports",
          "Applicable certification documents",
        ],
        timeline: "Based on project complexity",
        fee: { label: "$500.00", amountUsd: 500 },
        coverVideo: asset(
          "images/service/Product%20Compliance%20%26amp%3B%20Testing%20Coordination.m4v",
        ),
      },
    ],
  },
  {
    id: "qc-delivery",
    code: "P3",
    title: "Quality Control & Delivery Phase",
    description:
      "Ensure the final products meet the approved requirements before shipment and provide on-site support during the loading process to reduce delivery risks.",
    fee: { label: "$250.00", amountUsd: 250 },
    items: [
      {
        id: "pre-shipment-inspection",
        code: "P3.1",
        title: "Pre-Shipment Inspection & Final Quality Check",
        description:
          "Conduct a final inspection before shipment to verify product quality, quantity, packaging, and compliance with the approved requirements.",
        assistance: [
          "Quality control experience",
          "Product inspection experience",
          "AQL inspection knowledge",
          "Previous product development experience",
        ],
        deliverables: [
          "Product quantity verification",
          "Appearance and workmanship check",
          "Packaging inspection",
          "Quality findings and recommendations",
          "Inspection photos",
        ],
        timeline: "1–2 business days",
        fee: { label: "$150.00", amountUsd: 150 },
        coverImages: [asset("images/service/fullinspection.jpg")],
        notes: ["3"],
        sampleLinks: [
          {
            label: "Sample inspection report",
            href: "https://drive.google.com/file/d/1H29_kR_gmTmHgmCVYtdTgELvoYo9q8jD/view?usp=sharing",
          },
        ],
      },
      {
        id: "container-loading",
        code: "P3.2",
        title: "Container Loading Supervision",
        description:
          "Supervise the container loading process to ensure products are loaded correctly, quantities are verified, and shipment risks are minimized.",
        assistance: [
          "On-site loading supervision",
          "Photo & video documentation",
          "Shipping preparation experience",
          "Factory coordination experience",
        ],
        deliverables: [
          "Loading photos and videos",
          "Container information",
          "Quantity confirmation",
          "Loading process records",
          "Final shipment confirmation",
        ],
        timeline: "1 business day",
        fee: { label: "$100.00", amountUsd: 100 },
        coverImages: [
          asset("images/service/Container-loading-supervision-China.jpg"),
        ],
        notes: ["4"],
        sampleLinks: [
          {
            label: "Sample loading report",
            href: "https://drive.google.com/file/d/1XK2vRPEayrr6-ThxuXQfabrVt5l9d7k8/view?usp=sharing",
          },
        ],
      },
    ],
  },
];

export function getServicePackagePhase(id: string) {
  return servicePackagePhases.find((phase) => phase.id === id);
}

export function getServicePackageItem(id: string) {
  for (const phase of servicePackagePhases) {
    const item = phase.items.find((entry) => entry.id === id);
    if (item) return { phase, item };
  }
  return null;
}
