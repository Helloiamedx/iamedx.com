import { asset } from "@/lib/assets";

export type HomeCopyPoint = {
  id: string;
  /** Small top heading — optional; currently not shown */
  heading?: string;
  /** Large vertical keyword at the foot */
  title: string;
  body: string;
  /** Phrase inside `body` that auto-polishes; rest stays dim */
  bodyHighlight?: string;
  /** Column foot product cutout — bottom-right, ≤ half the card */
  image?: string;
};

export type HomeCopySection = {
  id: string;
  /** Small mono eyebrow above the headline */
  eyebrow: string;
  title: string;
  /** Short line under the title — leave empty until copy is ready */
  subtitle: string;
  /** Points — empty array until user supplies copy */
  points: HomeCopyPoint[];
};

/**
 * Home editorial sections — titles locked; body/points filled when ready.
 */
export const whatSetsMeApart: HomeCopySection = {
  id: "what-sets-me-apart",
  eyebrow: "Character",
  title: "What Makes Me Stand Out From Other Candidates?",
  subtitle: "",
  points: [
    {
      id: "loyalty",
      heading: "Always aligned with your interests",
      title: "Loyalty",
      body: "I believe my responsibility is to represent your interests in China. I remain fully aligned with your goals, make decisions from your perspective, and never allow supplier relationships or personal incentives to influence my judgment.",
      bodyHighlight:
        "I remain fully aligned with your goals, make decisions from your perspective",
      image: asset("images/home/difference/1.png"),
    },
    {
      id: "focus",
      heading: "Continuously sharpening the craft",
      title: "Focus",
      body: "Manufacturing is constantly evolving, and I continuously improve my knowledge of materials, processes, product development, and supply chain management to provide better solutions for every project.",
      bodyHighlight:
        "I continuously improve my knowledge of materials, processes, product development, and supply chain management",
      image: asset("images/home/difference/2.png"),
    },
    {
      id: "proactive",
      heading: "Risks caught before they grow",
      title: "Proactive",
      body: "My role is not only to react when issues appear. I actively look ahead, identify potential risks early, and take action before small problems become costly or difficult to solve.",
      bodyHighlight: "I actively look ahead, identify potential risks early",
      image: asset("images/home/difference/4.png"),
    },
    {
      id: "reliable",
      heading: "Every thread driven to a result",
      title: "Reliable",
      body: "Nothing is left unanswered, and everything is driven to a result — this is the minimum standard I uphold in every project.",
      bodyHighlight:
        "Nothing is left unanswered, and everything is driven to a result",
      image: asset("images/home/difference/3.png"),
    },
    {
      id: "practical-experience",
      heading: "Decisions rooted in the factory floor",
      title: "Hands-on",
      body: "I understand how products move from ideas to reality. Years of working directly with factories and production teams allow me to solve problems based on real manufacturing conditions.",
      bodyHighlight:
        "Years of working directly with factories and production teams",
      image: asset("images/home/difference/5.png"),
    },
  ],
};

export const whyWorkWithMe: HomeCopySection = {
  id: "why-work-with-me",
  eyebrow: "",
  title: "Are You Looking for Someone Like This?",
  subtitle: "If the answer is YES, you've landed on the right page.",
  points: [],
};

export type SomeoneLikeThisLine = {
  /** Small heading above the rule */
  title: string;
  /** Body under the rule */
  body: string;
};

/** Seven points — draft band above My Approach until layout is decided. */
export const someoneLikeThisLines: SomeoneLikeThisLine[] = [
  {
    title: "Protects your interests in China",
    body: "Even if supplier relationships or personal incentives create pressure to compromise.",
  },
  {
    title: "Takes full ownership of your business matters in China",
    body: "Even if you are thousands of miles away and cannot be physically present.",
  },
  {
    title: "Solves problems directly with factories",
    body: "Even if unexpected issues arise during product development or production.",
  },
  {
    title: "Communicates with complete honesty and transparency",
    body: "Even if the situation is difficult or the answer is not what you want to hear.",
  },
  {
    title: "Makes sure every matter receives attention and follow-up",
    body: "Even if the issue seems small or outside the original scope.",
  },
  {
    title: "Understands your brand and business goals",
    body: "Even if the challenge requires more than simple sourcing and manufacturing support.",
  },
  {
    title: "Builds a sourcing and manufacturing system around your needs",
    body: "Even if your business requires a different approach from traditional suppliers.",
  },
];

/** My Approach — photo plate band (former someone layout). Bodies TBD. */
export type MyApproachPoint = {
  id: string;
  title: string;
  body: string;
};

export const myApproach = {
  id: "my-approach",
  title: "My Approach",
  titleEm: "My",
  subtitle: "",
  points: [
    { id: "transparent", title: "Transparent", body: "" },
    { id: "collaborative", title: "Collaborative", body: "" },
    { id: "dedicated", title: "Dedicated", body: "" },
    { id: "practical", title: "Practical", body: "" },
    { id: "result-driven", title: "Result-Driven", body: "" },
    { id: "accountable", title: "Accountable", body: "" },
    { id: "proactive", title: "Proactive", body: "" },
  ] satisfies MyApproachPoint[],
};
/** Home recognition / metrics band — layout locked; swap copy & figures when ready. */
export type HomeRecognitionMetric = {
  id: string;
  /** Large figure or short value */
  value: string;
  /** Small uppercase label under the value */
  label: string;
  /** One-line blurb under the label */
  blurb: string;
};

export type HomeRecognitionCopy = {
  id: string;
  /**
   * Headline as segments so an optional inline portrait can sit between words.
   * Example: ["Client recognition has always", "been the starting point…"]
   */
  headlineBefore: string;
  headlineAfter: string;
  body: string;
  /** Optional square cut-in inside the headline — leave empty until asset is ready */
  portrait?: string;
  metrics: HomeRecognitionMetric[];
};

export const homeRecognition: HomeRecognitionCopy = {
  id: "client-recognition",
  headlineBefore: "Client recognition has always",
  headlineAfter: "been the starting point of everything I do.",
  body: "I care deeply about doing things right, solving problems that matter, and earning the kind of trust that makes people want to work with me again.",
  portrait: asset(`/images/about/${encodeURIComponent("My Profile.jpg")}`),
  metrics: [
    {
      id: "years",
      value: "10+",
      label: "Years hands-on experience",
      blurb:
        "From ideas to production, with over a decade on the front line.",
    },
    {
      id: "brands",
      value: "20+",
      label: "IP brands served",
      blurb:
        "Worked across a diverse range of gaming and entertainment IPs.",
    },
    {
      id: "pass-rate",
      value: "100%",
      label: "Product pass rate",
      blurb: "Focused on quality from prototype to final delivery.",
    },
    {
      id: "retained",
      value: "100%",
      label: "Client relationships retained",
      blurb: "Built on trust, transparency, and long-term collaboration.",
    },
  ],
};
