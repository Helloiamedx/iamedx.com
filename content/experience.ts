/**
 * Work experience — source of truth for About “Selected Work” (temp career strip)
 * and full role bullets for a later Experience presentation.
 *
 * Use `**phrase**` in bullets for portfolio scan highlights (rendered white).
 */

export type ExperienceRole = {
  id: string;
  role: string;
  company: string;
  /** Work / base location (city + region) */
  location: string;
  /** Country shown between company and period on Selected Work */
  country: string;
  period: string;
  /** Optional logo path/URL when supplied */
  logo?: string;
  bullets: string[];
};

export const experienceRoles: ExperienceRole[] = [
  {
    id: "dpi-external-pm",
    role: "External Project Manager",
    company: "DPI Merchandising Inc.",
    location: "Zhejiang, China",
    country: "United States",
    period: "August 2023 — April 2026",
    bullets: [
      "Managed the entire product development process from **design handoff to final delivery**, including design breakdown, supplier sourcing, prototyping, production validation, manufacturing follow-up, quality control, packaging development, and shipment coordination.",
      "Collaborated with factories to develop **processing solutions**, optimize manufacturing methods, and negotiate costs for each component.",
      "Led prototype development, resolved **technical issues**, and improved processes to ensure manufacturability.",
      "Ensured products met **U.S. market entry requirements** by proactively coordinating with SGS on testing procedures and obtaining compliant certification reports.",
      "Defined **product acceptance standards** based on product positioning and real production conditions.",
      "Monitored production progress and conducted **on-site supervision** at critical process stages until stability was achieved.",
      "Actively supported factories in resolving **unexpected production issues**.",
      "Conducted **100% full inspection (non-sampling)**, classified qualified and defective units, issued inspection reports, and led rework coordination with factories.",
      "Developed **packaging solutions** to ensure product safety while optimizing shipping cost efficiency.",
      "Planned and executed shipments based on client vessel schedules, ensured **timely delivery**, and supported all required customs clearance processes.",
    ],
  },
  {
    id: "baoshan-owner",
    role: "Owner and Operator",
    company: "Baoshan Mould Studio",
    location: "Zhejiang, China",
    country: "China",
    period: "January 2022 — March 2023",
    bullets: [
      "Developed machining plans based on product structure, defining stages such as **roughing, semi-finishing, and finishing**.",
      "Programmed CNC toolpaths and prepared materials, including cutting and fixture setup.",
      "Performed machine setup, including **tool installation, alignment, and calibration**.",
      "Executed machining processes and conducted **First Article Inspection (FAI)**.",
    ],
  },
  {
    id: "twowings-bd",
    role: "Business Development Executive",
    company: "Twowings Bag Co., Ltd.",
    location: "Zhejiang, China",
    country: "China",
    period: "December 2020 — June 2021",
    bullets: [
      "Identified and developed potential clients through **large-scale online data analysis and market research**.",
      "Developed targeted marketing strategies based on client analysis and presented tailored service solutions.",
      "Participated in product design discussions and handled **price negotiations with clients**.",
      "Coordinated production, monitored progress, and ensured smooth delivery of orders.",
      "Organized and participated in Canton Fair to expand business opportunities and client network.",
    ],
  },
  {
    id: "adv-project-lead",
    role: "Project Lead (End-to-End Execution)",
    company: "Importations ADV Inc.",
    location: "Zhejiang, China",
    country: "Canada",
    period: "September 2018 — May 2020",
    bullets: [
      "Analyzed product designs, developed prototypes to validate functionality, and broke down structures into detailed material and component requirements (**BOM**).",
      "Calculated material consumption, managed procurement, and conducted **price negotiations with suppliers** to optimize cost efficiency.",
      "Coordinated **multi-stage production processes**, established product acceptance standards, and ensured alignment across all production stages.",
      "Developed **end-to-end packaging solutions** and delivery plans, covering detailed specifications and material selection to ensure safe delivery.",
      "Planned and executed **shipment and container loading** based on delivery timelines, including scheduling production and packing, selecting vessel schedules, optimizing container usage, arranging loading, and completing documentation and reports.",
    ],
  },
  {
    id: "blittle-qc",
    role: "Quality, Production & Compliance Coordinator",
    company: "B.little & co., inc.",
    location: "Zhejiang, China",
    country: "United States",
    period: "March 2015 — January 2017",
    bullets: [
      "Conducted **pre-production sample approvals on-site** and ensured alignment with product specifications.",
      "**Followed up on production processes**, monitored product quality, and tracked daily output with reporting.",
      "Performed **incoming material inspection (IQC)** and final inspections based on **AQL 2.5 standards**.",
      "Assisted in material planning and production scheduling to support efficient manufacturing.",
      "Prepared and submitted product samples for **third-party testing (e.g., SGS)**.",
      "Followed up on factory compliance improvements under third-party audit guidance, supervising implementation progress to meet **Disney standards**, labor, workshop safety, and ethical requirements.",
      "Conducted **on-site factory evaluations** for new product development, working alongside engineers to assess manufacturing capability, process feasibility, and supplier suitability.",
    ],
  },
];
