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
import { processCraftMediaWall } from "@/content/processCraftMedia";
import { supplierDiscoveryVerificationImages } from "@/content/serviceCoverMedia";
import { verifyOnSiteMediaCut } from "@/content/verifyOnSiteMedia";

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
  /** View workflow steps — copy (+ optional media / checklist). */
  workflowSteps?: readonly {
    title: string;
    body: string;
    /** Phrases in `body` rendered black / emphasized */
    bodyHighlights?: readonly string[];
    /** Judgment row — copy left, checklist right (same slot as media) */
    judgment?: boolean;
    /** Right-column media; omit → shared placeholder until replaced */
    media?: string;
    /** Checklist items for judgment rows (check animation later) */
    checks?: readonly string[];
    /** Right-column keyword field (Z burst) */
    keywords?: readonly string[];
    /** Right-column media wall — stills + loops, cover-up stack */
    mediaWall?: readonly string[];
    /** Right-column rapid hard-cut stills */
    mediaCut?: readonly string[];
    /** Right-column Supplier Evaluation checklist animation */
    evaluationDemo?: boolean;
    /** Right-column Expected vs Verified risk comparison */
    factoryRiskCompareDemo?: boolean;
    /** Right-column factory-visit prep animation */
    factoryVisitPrepDemo?: boolean;
  }[];
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
          "Project Requirement Summary",
          "Feasibility Assessment",
          "Recommended Next Steps",
        ],
        timeline: "18H",
        fee: { label: "Free", amountUsd: 0 },
        coverVideo: asset("images/service/Initial%20Project%20Review.mov"),
        workflowSteps: [
          {
            title: "01_ Build a complete picture.",
            body: "I start with your drawings, references, and specifications. I review how the product should look, be made, be packaged, and reach its destination, then clarify any missing details with you.",
            media: asset(
              "images/service/Initial%20Project%20Review-workflow.mp4",
            ),
          },
          {
            title: "02_ Define where I can add value.",
            body: "I compare your requirements with my experience, supplier resources, and the development work involved to assess whether I can support the project responsibly.",
            judgment: true,
            checks: [
              "Highly Customized Hardware Development",
              "Design and Verification of Assembly Engineering",
              "Progress Following",
              "Product Compliance Testing",
              "Custom Packaging Development",
              "Specialty Paper Process Research",
              "Embossing Mold Testing and Optimization",
              "Material Adaptation",
              "Off-the-Shelf Hardware Adaptation",
              "Quality Control",
            ],
          },
        ],
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
          "3–5 Recommended Suppliers",
          "Supplier Comparison & Evaluation",
          "Key Terms & Quotations",
        ],
        timeline: "3–5 business days",
        fee: { label: "$350.00", amountUsd: 350 },
        coverVideo: asset("images/service/Supplier%20Identification.m4v"),
        workflowSteps: [
          {
            title: "01_ Break Down the Product",
            body: "I first break down the product by materials, processes, structure, and key requirements. For unfamiliar processes, I cross-check with suppliers and manufacturing contacts I have worked with before to identify what needs further research.",
            keywords: [
              "Embossing",
              "Creasing",
              "Foil Stamping",
              "Digital Printing",
              "Laser Engraving",
              "Laser Cutting",
              "CNC Machining",
              "Electroplating",
              "Injection Molding",
              "Spray Coating",
              "Embroidery",
              "Wood",
              "Leather",
              "Metal",
              "Resin",
              "Fabric",
              "Paper",
              "EVA",
              "Foam",
              "ABS",
              "Plastic",
            ],
          },
          {
            title: "02_ Research & Find Suppliers",
            body: "Once I identify the correct industry terminology, I research how the process actually works, including its key parameters, limitations, and production requirements. With this understanding, I then search for targeted suppliers and verify whether their capabilities, experience, and technical answers align with what I have learned.",
            mediaWall: processCraftMediaWall,
          },
          {
            title: "03_ Evaluate Capability & Manageability",
            body: "For qualified suppliers, I further evaluate quality level, MOQ, pricing, lead time, payment terms, and other key conditions. I also assess whether the supplier is responsive, cooperative, and manageable throughout production.",
            evaluationDemo: true,
          },
          {
            title: "04_ Compile & Deliver the Supplier List",
            body: "I organize the qualified suppliers into a structured supplier list, including company information, relevant experience, key commercial terms, and my evaluation for your review.",
            media: `${asset(
              "images/service/Supplier%20Identification%20%26%20Initial%20Supplier%20Screening/Compile%20%26%20Deliver%20the%20Supplier%20List.mp4",
            )}?v=20260917`,
          },
        ],
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
        deliverables: [
          "Factory Visit & Audit Report",
          "On-site Photos & Videos",
          "Risk & Control Point Summary",
          "Professional Supplier Assessment",
        ],
        timeline: "1–2 business days",
        fee: { label: "$250.00", amountUsd: 250 },
        coverImages: supplierDiscoveryVerificationImages,
        notes: ["1", "2"],
        sampleLinks: [
          {
            label: "Sample audit report",
            href: asset(
              "images/service/Supplier%20Identification%20%26%20Initial%20Supplier%20Screening/Factory%20Audit%20Report.pdf",
            ),
          },
        ],
        workflowSteps: [
          {
            title: "01_ Define What Needs to Be Verified",
            body: "Before visiting the factory, I review your product requirements to determine exactly what needs to be verified for your project, including the materials, manufacturing processes, equipment, and key production stages involved.\n\nI also include anything you specifically want me to look into, such as whether the factory can maintain the same quality during mass production or how they actually respond when production problems occur.\n\nTogether, your product requirements and specific concerns define what I need to verify for you during the factory visit.",
            bodyHighlights: [
              "review your product requirements",
              "anything you specifically want me to look into",
              "define what I need to verify",
            ],
            factoryVisitPrepDemo: true,
          },
          {
            title: "02_ Verify Everything On Site",
            body: "At the factory, I verify each of these points against the actual production environment.\n\nFor every key production stage, I check whether the supplier actually has the required equipment, people, process experience, and quality control capabilities, using real production conditions and previous products as evidence rather than relying only on what the supplier tells you.\n\nI also verify which key processes are handled in-house and which are outsourced, including how well those outsourced operations are controlled.\n\nKey findings and evidence are documented with photos and videos so you can clearly see what was verified on site.",
            mediaCut: verifyOnSiteMediaCut,
            bodyHighlights: [
              "I check whether the supplier actually has the required equipment, people, process experience, and quality control capabilities",
              "I also verify which key processes are handled in-house and which are outsourced",
            ],
          },
          {
            title: "03_ Identify Risks Before Production",
            body: "I compare what your project requires with what I actually verified at the factory to identify potential risks before you move forward.\n\nThese may include outsourced key processes, limited experience with a specific technique, weak quality control points, or differences between expected and actual production capacity.\n\nThis helps identify which parts of your project will require more attention, follow-up, and quality control during future production.",
            factoryRiskCompareDemo: true,
            bodyHighlights: [
              "helps identify which parts of your project will require more attention",
            ],
          },
          {
            title: "04_ Report & Professional Assessment",
            body: "All verified findings, photos and videos, actual manufacturing capabilities, and identified risks are consolidated into a Factory Visit & Audit Report.\n\nMore importantly, I interpret these findings for you based on my experience in product development, manufacturing, and quality control, rather than leaving you with factory information to evaluate on your own.\n\nYou receive a clear professional assessment of whether the supplier is suitable for your project, where the key risks are, and what needs closer attention if you decide to move forward.",
            media: asset(
              "images/service/Report%20%26%20Professional%20Assessment/video.mp4",
            ),
            bodyHighlights: [
              "I interpret these findings for you based on my experience in product development",
            ],
          },
        ],
      },
      {
        id: "requirement-translation-negotiation",
        code: "P1.4",
        title: "Product Requirement Translation & Supplier Negotiation",
        description:
          "Break down the client's design concept and requirements, translate them into clear manufacturing instructions, and communicate with suppliers to align product expectations and production requirements.",
        assistance: [
          "Product development experience",
          "Manufacturing knowledge",
          "Technical communication with factories",
          "Cost negotiation experience",
          "Adobe Photoshop",
          "Adobe Illustrator",
          "Adobe Acrobat",
          "Autodesk Fusion 360",
          "Google Workspace",
        ],
        deliverables: [
          "Manufacturing Instruction Document",
          "Cost Optimization & Supplier Negotiation",
          "Detailed supplier quotation",
        ],
        timeline: "2–3 business days",
        fee: { label: "$250.00", amountUsd: 250 },
        /* Same clip as home Support “Manufacturing Localization” */
        coverVideo: asset(
          "images/home/From%20concept%20to%20delivery/Manufacturing%20Localization/video.mp4",
        ),
        sampleLinks: [
          {
            label: "Sample quotation sheet",
            href: "https://drive.google.com/file/d/1PhvQ4bgZYg2pUHVfhfMID7cinyzstMAV/view?usp=sharing",
          },
        ],
        workflowSteps: [
          {
            title: "01_ Break Down the Design",
            body: "Clients usually provide a complete design, rendering, or reference image, but a complete visual design is not the same as a manufacturing-ready document.\n\nI first break the design down into individual components, such as the hanging rod, hardware, main body, straps, and other parts, so the complete product structure is clearly defined.",
            bodyHighlights: [
              "I first break the design down into individual components",
            ],
            media: asset(
              "images/service/Product%20Requirement%20Translation%20%26%20Supplier%20Negotiation/Break%20Down%20the%20Design.mp4",
            ),
          },
          {
            title: "02_ Define the Manufacturing Specifications",
            body: "For each component, I clearly specify the material, dimensions, required manufacturing process, and the corresponding visual reference for the expected finish.\n\nIf the original design is missing technical specifications, I scale the artwork to actual size to extract the required dimensions and data. When necessary, I also conduct my own engineering verification to confirm key parameters and improve the accuracy of the first prototype.",
            bodyHighlights: [
              "I clearly specify the material, dimensions, required manufacturing process",
              "I also conduct my own engineering verification to confirm key parameters and improve the accuracy of the first prototype",
            ],
            media: asset(
              "images/service/Product%20Requirement%20Translation%20%26%20Supplier%20Negotiation/Define%20the%20Manufacturing%20Specifications.mp4",
            ),
          },
          {
            title: "03_ Review Everything with the Factory",
            body: "Once the manufacturing information is prepared, I go through it with the factory face to face or explain it step by step through a recorded walkthrough.\n\nI clarify which files belong to each component, what the key parameters are, and what result needs to be achieved. Any questions about the structure, process, or specifications should be raised and resolved at this stage before prototyping begins.",
            bodyHighlights: [
              "Any questions about the structure, process, or specifications should be raised and resolved at this stage before prototyping begins",
            ],
            media: asset(
              "images/service/Product%20Requirement%20Translation%20%26%20Supplier%20Negotiation/Review%20Everything%20with%20the%20Factory.mp4",
            ),
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
        workflowSteps: [
          {
            title: "01_ First Sample & Validation",
            body: "Based on the manufacturing files prepared in the previous stage, I work with the supplier to produce the first sample.\n\nOnce the sample is ready, I check the process results, dimensions and assembly, product structure, function, and safety.\n\nThe goal of the first sample is not to achieve the final result immediately, but to use a physical sample to verify whether the design and manufacturing plan actually work.",
            bodyHighlights: [
              "Once the sample is ready, I check the process results, dimensions and assembly, product structure, function, and safety.",
            ],
            media: asset(
              "images/service/Sample%20Development%20%26%20Production%20Validation/1.mp4",
            ),
          },
          {
            title: "02_ Compare, Improve & Resample",
            body: "I compare the actual sample with the original design and expected result to identify the differences and determine whether they come from the dimensions, structure, materials, manufacturing process, or production parameters.\n\nBased on the findings, I make the necessary changes to the manufacturing files, dimensions, process settings, or tooling, and then move to the next sample. If there are still issues, I continue to improve and test until the sample reaches the expected result.",
            bodyHighlights: [
              "I continue to improve and test until the sample reaches the expected result",
            ],
            media: asset(
              "images/service/Sample%20Development%20%26%20Production%20Validation/2.mp4",
            ),
          },
          {
            title: "03_ Final Sample & Mass Production Standards",
            body: "Once the appearance, dimensions, structure, manufacturing process, and function meet the expected result, I confirm the final sample as the reference for mass production.\n\nI then finalize the manufacturing files, dimensions, materials, process requirements, and key quality standards so the factory has clear requirements to follow during mass production.",
            bodyHighlights: [
              "I then finalize the manufacturing files",
            ],
            media: asset(
              "images/service/Sample%20Development%20%26%20Production%20Validation/3.mp4",
            ),
          },
        ],
      },
    ],
  },
  {
    id: "mass-production",
    code: "P2",
    title: "Production Management Phase",
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
        /* Same clip as home Support “Production Management” */
        coverVideo: asset(
          "images/home/From%20concept%20to%20delivery/Production%20Management/video.mp4",
        ),
        workflowSteps: [
          {
            title: "01_ Confirm Critical Production Stages On-Site",
            body: "Before mass production starts, I identify the critical production stages that need on-site confirmation and check the first production result at each stage.\n\nFor example, for a wooden box project, I may confirm the first laser engraving, the first painted color, the first assembled box, and the first finished packaging.\n\nEach critical stage is confirmed against the approved sample and production requirements before full production continues.",
            bodyHighlights: [
              "I identify the critical production stages that need on-site confirmation and check the first production result at each stage",
            ],
            media: asset(
              "images/service/End-to-End%20Production%20Management/Confirm%20Critical%20Production%20Stages%20On-Site.mp4",
            ),
          },
          {
            title: "02_ Identify Problems During Production",
            body: "Being on-site also allows me to speak directly with the workers and understand what is difficult to control during actual production.\n\nI look for the key reasons that may cause defects, inconsistent results, or lower production efficiency. Many of these problems only become clear when the product enters real mass production.",
            bodyHighlights: [
              "Being on-site also allows me to speak directly with the workers and understand what is difficult to control during actual production.",
            ],
            media: asset(
              "images/service/End-to-End%20Production%20Management/Identify%20Problems%20During%20Production.mp4",
            ),
          },
          {
            title: "03_ Coordinate Solutions On-Site",
            body: "When a problem is found, I coordinate with the factory, workers, and other production resources to solve it before it affects more units.\n\nWhen needed, I can also help develop simple jigs, positioning tools, or other working aids to make the operation easier and more consistent, helping improve both efficiency and the pass rate.",
            bodyHighlights: [
              "I can also help develop simple jigs, positioning tools, or other working aids to make the operation easier and more consistent",
            ],
            media: asset(
              "images/service/End-to-End%20Production%20Management/Coordinate%20Solutions%20On-Site.mp4",
            ),
          },
          {
            title: "04_ Follow Production Progress",
            body: "Throughout production, I follow the actual output, key production stages, and any issues that may affect the delivery schedule.\n\nIf delays or unexpected problems occur, I coordinate the necessary support and resources to keep production moving and ensure the order progresses toward completion as planned.",
            bodyHighlights: [
              "I follow the actual output, key production stages, and any issues that may affect the delivery schedule",
            ],
            media: asset(
              "images/home/From%20concept%20to%20delivery/Production%20Management/video.mp4",
            ),
          },
        ],
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
          "Product legally ready for sale and distribution in the target market",
        ],
        timeline: "Based on project complexity",
        fee: { label: "$500.00", amountUsd: 500 },
        /* Same clip as home Support “Compliance & Testing” */
        coverVideo: asset(
          "images/home/From%20concept%20to%20delivery/Compliance%20%26%20Testing/video.mp4?v=20260911b",
        ),
        workflowSteps: [
          {
            title: "01_ Prepare the BOM & Confirm Testing Requirements",
            body: "Starting during sample development, I prepare the product BOM and submit it to a testing laboratory such as SGS, together with the target export market and intended consumer group.\n\nBased on this information, the laboratory confirms the applicable testing requirements, including what needs to be tested, what samples are required, how many need to be prepared, and any specific requirements for sample storage, packaging, and transportation.",
            bodyHighlights: [
              "I prepare the product BOM and submit it",
              "the laboratory confirms the applicable testing requirements, including what needs to be tested, what samples are required, how many need to be prepared, and any specific requirements for sample storage, packaging, and transportation",
            ],
            /* Re-uploaded in place — ?v= busts CDN + browser cache */
            media: asset(
              "images/service/Product%20Compliance%20%26%20Testing%20Coordination/Prepare%20the%20BOM.mp4?v=20260923",
            ),
          },
          {
            title: "02_ Prepare Samples & Coordinate Testing",
            body: "Based on the testing requirements, I coordinate with suppliers to prepare the correct samples in the required quantities and conditions, then arrange their submission to the laboratory.\n\nThroughout the testing process, I coordinate between the factory and the laboratory. I help the factory understand how samples should be prepared and why certain testing requirements are necessary, while providing the laboratory with detailed product information such as materials, manufacturing processes, and material usage when requested.\n\nIf a test does not pass, I review the test report to identify the specific failed item, work with the factory to determine what needs to be adjusted, and coordinate the next steps accordingly. I use my previous product development and manufacturing experience throughout this process to improve the chance of passing the required tests on the first attempt and reduce the cost and delays caused by repeated testing.",
            bodyHighlights: [
              "I use my previous product development and manufacturing experience throughout this process to improve the chance of passing the required tests on the first attempt and reduce the cost and delays caused by repeated testing.",
            ],
            /* CDN object name literally contains “&amp;” (upload artifact) */
            media: asset(
              "images/service/Product%20Compliance%20%26%20Testing%20Coordination/Prepare%20Samples%20%26amp%3B%20Coordinate%20Testing.mp4?v=20260923",
            ),
          },
        ],
      },
    ],
  },
  {
    id: "qc-delivery",
    code: "P3",
    title: "Quality & Delivery Phase",
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
        workflowSteps: [
          {
            title: "01_ Define the Inspection Standard",
            body: "Before the inspection, I confirm the approved sample and final product requirements that the production will be checked against. I also define the inspection scope, whether it will be a sampling inspection or a 100% full inspection, and whether this is the first inspection or a re-inspection after rework.\n\nFor sampling inspections, I follow the agreed AQL criteria to determine the sample size and acceptance limits. For re-inspections, I pay closer attention to previously identified defects and increase the inspection level when repeated quality issues indicate higher risk. For products that have gone through multiple rounds of rework, a 100% inspection may be required.",
            bodyHighlights: [
              "I follow the agreed AQL criteria to determine the sample size and acceptance limits",
            ],
            media: asset(
              "images/service/Pre-Shipment%20Inspection%20%26%20Final%20Quality%20Check/Define%20the%20Inspection.mp4",
            ),
          },
          {
            title: "02_ Inspect Based on Product Risk",
            body: "I don't use the same inspection checklist for every product. I first understand what your product is, how it will be used, and what matters most for that specific product.\n\nI always start with the most fundamental requirements. For children's products, safety comes first. Before looking closely at appearance or minor workmanship details, I first make sure there are no major issues that could affect the product's safety, function, or intended use.\n\nOnce these key areas are confirmed, I move into a more detailed inspection, comparing the actual production against the approved sample and requirements and checking workmanship, appearance, dimensions, packaging, quantity, and other agreed details.",
            bodyHighlights: [
              "For children's products, safety comes first.",
            ],
            media: asset(
              "images/service/Pre-Shipment%20Inspection%20%26%20Final%20Quality%20Check/Inspect%20Based%20on%20Product%20Risk.jpg",
            ),
          },
          {
            title: "03_ Report & Professional Assessment",
            body: "After the inspection, I consolidate the findings, defect classifications, quantities, packaging checks, photos, videos, and inspection results into a Final Inspection Report.\n\nMore importantly, I don't just give you a Pass or Fail result. Based on my experience in product development, manufacturing, and quality control, I help you understand what the findings actually mean, where the problems may come from, whether they could affect more products in the batch, and what should be addressed before shipment.\n\nThis gives you more practical information to decide whether to ship, rework, or take further action.",
            bodyHighlights: [
              "I don't just give you a Pass or Fail result",
            ],
            /* Re-uploaded in place — ?v= busts CDN + browser cache */
            media: asset(
              "images/service/Pre-Shipment%20Inspection%20%26%20Final%20Quality%20Check/Report%20%26%20Professional%20Assessment.mp4?v=20260923",
            ),
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
          "Container loading plan",
          "Loading photos and videos",
          "Container information",
          "Quantity confirmation",
          "Loading process records",
          "Final shipment confirmation",
        ],
        timeline: "1 business day",
        fee: { label: "$100.00", amountUsd: 100 },
        /* Dedicated service cover */
        coverVideo: asset("images/service/Container%20Loading%20Supervision.mp4"),
        notes: ["4"],
        sampleLinks: [
          {
            label: "Sample loading report",
            href: "https://drive.google.com/file/d/1XK2vRPEayrr6-ThxuXQfabrVt5l9d7k8/view?usp=sharing",
          },
        ],
        workflowSteps: [
          {
            title: "01_ Confirm the Loading Plan & Goods",
            body: "Before loading, I confirm the container size, planned quantity, loading date and time, and packing list. Once on-site, I check the actual goods against this information.\n\nI verify the carton quantity and shipping marks. If the goods are palletized, I also check the number of pallets, cartons per pallet, stacking arrangement, and pallet condition to make sure everything is properly prepared for loading.",
            bodyHighlights: [
              "container size, planned quantity, loading date and time, and packing list",
              "carton quantity and shipping marks",
              "number of pallets, cartons per pallet, stacking arrangement, and pallet condition",
            ],
            media: asset(
              "images/service/Container%20Loading%20Supervision/Confirm%20the%20Loading%20Plan%20%26%20Goods.mp4",
            ),
          },
          {
            title: "02_ Inspect the Container & Supervise Loading",
            body: "When the container arrives, I first confirm that the weather and on-site conditions are suitable for safe loading. I also check the container arrival time, estimate the time required for loading, and coordinate with the factory to keep the loading work moving and complete the planned loading task.\n\nI then verify and record the container number, seal number, container size, truck information, and arrival time, and inspect the empty container to make sure it is clean, dry, and free from visible damage, holes, or potential water leakage.\n\nBefore loading starts, I work with the factory to confirm the loading arrangement, including how many cartons go in each row, how they should be positioned, and how the available space should be distributed. This helps avoid excessive empty space at the end and reduces the risk of goods shifting or falling during transportation.\n\nDuring loading, I supervise the process and take photos at 1/4, 2/4, 3/4, and full loading. After loading is complete, I record the left door closed, right door closed, seal applied, full container, and full truck, and verify the final loaded quantity.",
            bodyHighlights: [
              "weather and on-site conditions are suitable for safe loading",
              "container number, seal number, container size, truck information, and arrival time",
              "clean, dry, and free from visible damage, holes, or potential water leakage",
              "loading arrangement",
              "1/4, 2/4, 3/4, and full loading",
              "left door closed, right door closed, seal applied, full container, and full truck",
            ],
            media: asset(
              "images/service/Container%20Loading%20Supervision/Inspect%20the%20Container%20%26%20Supervise%20Loading.mp4",
            ),
          },
          {
            title: "03_ Prepare the Container Loading Report",
            body: "After loading is completed, I organize the quantity verification, shipping marks and palletization details, container and truck information, container condition, loading arrangement, final loaded quantity, seal information, and on-site photos and videos into a Container Loading Report.\n\nThis provides a clear and traceable record showing how the shipment was loaded and confirming that the goods were loaded according to plan.",
            bodyHighlights: [
              "quantity verification, shipping marks and palletization details, container and truck information, container condition, loading arrangement, final loaded quantity, seal information, and on-site photos and videos",
              "Container Loading Report",
            ],
            media: asset(
              "images/service/Container%20Loading%20Supervision/Prepare%20the%20Container%20Loading%20Report.mp4",
            ),
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
