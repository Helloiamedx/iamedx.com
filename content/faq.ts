import type { FAQCategories, FAQData } from "@/components/ui/faq-tabs";

/** Site FAQ — categories + copy for /faq */
export const siteFaqCategories: FAQCategories = {
  experience: "Experience",
  sourcing: "Sourcing",
  "factory-audit": "Factory Audit",
  development: "Development",
  quality: "Quality",
  operations: "Operations",
  communication: "Communication",
  pricing: "Pricing",
  partnership: "Partnership",
  integrity: "Integrity",
  logistics: "Logistics",
};

export const siteFaqTitle = "Questions You May Ask";

/** Prompt under the FAQ title — plain copy, no link chrome */
export const siteFaqSupportNote =
  "Can't find what you're looking for? Reach out at hi@iamedx.com — you'll get a reply within 18 hours.";

export const siteFaqData: FAQData = {
  experience: [
    {
      question:
        "What recent procurement or product development projects have you completed? What was the result?",
      answer:
        "I recently helped a client complete a highly customized product, managing the entire process from design communication, supplier coordination, production follow-up, and final delivery.\n\nAfter launch, the product received strong positive feedback from the target community, which gave the client confidence to continue developing similar products.",
    },
    {
      question:
        "Do you have experience working with Western e-commerce, DTC brands, or international clients?",
      answer:
        "Yes. I have supported multiple Shopify stores operated by DPI Merchandising, helping manage customized products, including China-side production coordination, inventory management, and international fulfillment.\n\nThe products were shipped from China to markets including Europe, the UK, Canada, and Australia, while U.S. domestic fulfillment was handled by the client's local team.",
    },
    {
      question:
        "Have you developed highly customized products without existing solutions in the market?",
      answer:
        "Yes. Most of the products I have worked on were not standard items. They required custom development based on the client's IP, design concepts, and brand requirements.\n\nEach project required independent planning of materials, manufacturing processes, suppliers, and production workflows, while coordinating multiple supply chain partners to bring the product to life.",
    },
  ],
  sourcing: [
    {
      question: "Can you recommend multiple factories for comparison?",
      answer:
        "Yes. I can identify and recommend multiple suitable suppliers based on product requirements, manufacturing processes, cost targets, and delivery expectations.\n\nThis allows clients to compare options and select the supplier that best fits their project needs.",
    },
  ],
  "factory-audit": [
    {
      question: "Can you personally visit factories for verification?",
      answer:
        "Yes. I can personally visit factories for on-site audits and provide formal factory audit reports based on my findings.",
    },
    {
      question: "What aspects do you evaluate during a factory audit?",
      answer:
        "In addition to standard audit areas such as production capacity, equipment, manufacturing processes, and quality systems, I also conduct deeper evaluations based on the client's specific concerns.\n\nThis may include:\n- Relevant product manufacturing experience\n- Stability of key production processes\n- Whether production capacity matches project requirements\n- Quality control procedures\n- Potential delivery risks",
    },
  ],
  development: [
    {
      question:
        "Have you developed products that required completely customized solutions?",
      answer:
        "Yes. Most projects I have handled required development from the ground up, including material selection, process planning, structural optimization, and supplier coordination.\n\nMy role is not only to find manufacturers, but also to help transform a client's design concepts into products that can be realistically manufactured.",
    },
  ],
  quality: [
    {
      question: "Can you personally conduct factory or warehouse inspections?",
      answer:
        "Yes. I can conduct on-site production inspections, pre-shipment inspections, and warehouse checks, providing inspection results and reports based on project requirements.",
    },
    {
      question: "How do you identify and solve production problems?",
      answer:
        "I do not simply report problems back to the client.\n\nI investigate the root cause and analyze whether the issue comes from:\n- Raw materials\n- Manufacturing processes\n- Production operations\n- Equipment limitations\n- Design and manufacturing incompatibility\n\nAfter identifying the cause, I work directly with the factory to develop solutions, implement improvements, and verify the results to ensure the issue is properly resolved.",
    },
  ],
  operations: [
    {
      question: "Where are you currently located in China?",
      answer: "I am based in Wenzhou, Zhejiang, China.",
    },
    {
      question: "Can you travel anywhere within mainland China?",
      answer:
        "Yes. I can travel to different regions in China for supplier audits, production follow-ups, factory meetings, and on-site coordination.",
    },
    {
      question: "Can you personally attend factory meetings?",
      answer:
        "Yes. I can directly participate in factory meetings and communicate with factory owners, management teams, engineers, and production staff.",
    },
    {
      question: "How much notice do you usually need for an on-site inspection?",
      answer:
        "Normally, three days' notice is sufficient.\n\nFor urgent projects, I can also coordinate based on the actual situation.",
    },
  ],
  communication: [
    {
      question: "What are your Chinese and English communication abilities?",
      answer:
        "Chinese is my native language.\n\nMy English is sufficient for daily business communication, project discussions, supplier coordination, and client reporting.",
    },
    {
      question:
        "Can you negotiate directly with factory owners, management teams, and production teams?",
      answer:
        "Yes. I have extensive experience communicating and negotiating directly with Chinese suppliers, factory owners, management teams, engineering teams, and production personnel.",
    },
    {
      question: "How do you report project progress to clients?",
      answer:
        "I usually use Smartsheet for project management and progress tracking.\n\nHowever, I can also adapt to the client's preferred tools, such as Notion or other project management platforms.",
    },
  ],
  pricing: [
    {
      question: "What is your hourly rate?",
      answer: "My hourly rate is $15/hour.",
    },
    {
      question:
        "Can you work under fixed project fees or milestone-based payments?",
      answer:
        "Yes. I can work under different payment structures, including hourly rates, fixed project fees, or milestone-based payments depending on the project requirements.",
    },
    {
      question: "Can clients purchase only specific stages of your service?",
      answer:
        "Yes. Clients can select individual stages based on their needs, such as supplier sourcing, product development, quality inspection, or production management.",
    },
  ],
  partnership: [
    {
      question: "Can you provide 40 hours per week of ongoing support?",
      answer: "Yes.",
    },
    {
      question: "Are you open to long-term full-time cooperation?",
      answer: "Yes.",
    },
    {
      question:
        "Can you work as an independent China manufacturing and supply chain expert?",
      answer:
        "Yes. I can participate as an independent China-based manufacturing specialist, project manager, or supply chain representative depending on the client's needs.",
    },
    {
      question: "When can you start?",
      answer:
        "This depends on my current workload and project schedule.\n\nAfter confirming the project scope and requirements, I can provide a clear start date.",
    },
    {
      question:
        "Can you negotiate deposits, milestone payments, and final payment terms?",
      answer:
        "Yes. I can assist clients in negotiating supplier payment terms and establishing a more reasonable payment structure.",
    },
  ],
  integrity: [
    {
      question: "Do you have any financial relationship with suppliers?",
      answer:
        "No. I do not have any financial relationship with suppliers, and I always make decisions based on protecting my client's interests.",
    },
    {
      question:
        "Do you accept supplier commissions, rebates, referral fees, kickbacks, or other benefits?",
      answer:
        "No. I do not accept any form of supplier incentives or benefits. My priority is always to represent and protect my client's interests.",
    },
    {
      question: "Can you sign an NDA?",
      answer: "Yes.",
    },
    {
      question: "Can you sign a conflict-of-interest statement?",
      answer: "Yes.",
    },
  ],
  logistics: [
    {
      question:
        "Can you select the best shipping method based on cost, lead time, and product requirements?",
      answer:
        "Yes. I have access to both sea and air freight resources and can select the safest and most cost-effective shipping solution based on product characteristics, timeline requirements, and budget considerations.",
    },
    {
      question: "Can you track shipments until final delivery?",
      answer:
        "Yes. I can continuously follow up on production completion, shipment arrangements, transportation progress, and final delivery status.",
    },
    {
      question: "Do you have your own warehouse or storage facilities in China?",
      answer:
        "Currently, I do not operate my own warehouse.\n\nHowever, I can help clients establish suitable third-party storage solutions at a reasonable cost based on their requirements.",
    },
    {
      question:
        "Can you handle receiving, storage, picking, inspection, photography, packaging, and individual order fulfillment?",
      answer: "Yes.",
    },
    {
      question: "Can you connect with Shopify and manage daily orders?",
      answer: "Yes.",
    },
    {
      question:
        "Have you supported multi-platform e-commerce brands with single-unit shipments to the U.S., Europe, and Australia?",
      answer:
        "Yes. I have supported international e-commerce brands with fulfillment operations, including handling individual orders shipped directly from China to markets such as the U.S., Europe, and Australia.",
    },
  ],
};
