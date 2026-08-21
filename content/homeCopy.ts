export type HomeCopyPoint = {
  id: string;
  title: string;
  body: string;
  /** Phrase inside `body` rendered white on the gray card copy */
  bodyHighlight?: string;
  /** Card face fill (What Makes Me Different) */
  cardColor?: string;
};

export type HomeCopySection = {
  id: string;
  title: string;
  /** Short line under the title — leave empty until copy is ready */
  subtitle: string;
  /** Points — empty array until user supplies copy */
  points: HomeCopyPoint[];
};

/**
 * Home editorial sections — titles locked; body/points filled when ready.
 */
/** Collapsed deck face label (reference “Value”). */
export const whatMakesMeDifferentDeckLabel = "Value";

export const whatSetsMeApart: HomeCopySection = {
  id: "what-sets-me-apart",
  title: "What Makes Me Different",
  subtitle:
    "What makes me different is not just what I do, but how I approach every project.",
  points: [
    {
      id: "loyalty",
      title: "Loyalty",
      cardColor: "#000",
      body: "I believe my responsibility is to represent your interests in China. I remain fully aligned with your goals, make decisions from your perspective, and never allow supplier relationships or personal incentives to influence my judgment.",
      bodyHighlight:
        "I remain fully aligned with your goals, make decisions from your perspective",
    },
    {
      id: "professional",
      title: "Professional",
      cardColor: "#000",
      body: "Manufacturing is constantly evolving, and I continuously improve my knowledge of materials, processes, product development, and supply chain management to provide better solutions for every project.",
      bodyHighlight:
        "I continuously improve my knowledge of materials, processes, product development, and supply chain management",
    },
    {
      id: "proactive",
      title: "Proactive",
      cardColor: "#000",
      body: "My role is not only to react when issues appear. I actively look ahead, identify potential risks early, and take action before small problems become costly or difficult to solve.",
      bodyHighlight: "I actively look ahead, identify potential risks early",
    },
    {
      id: "reliable",
      title: "Reliable",
      cardColor: "#000",
      body: "Nothing is left unanswered, and everything is driven to a result — this is the minimum standard I uphold in every project.",
      bodyHighlight:
        "Nothing is left unanswered, and everything is driven to a result",
    },
    {
      id: "practical-experience",
      title: "Hands-on",
      cardColor: "#000",
      body: "I understand how products move from ideas to reality. Years of working directly with factories and production teams allow me to solve problems based on real manufacturing conditions.",
      bodyHighlight: "Years of working directly with factories and production teams",
    },
  ],
};

export const whyWorkWithMe: HomeCopySection = {
  id: "why-work-with-me",
  title: "Are You Looking for Someone Like This?",
  subtitle: "If the answer is YES, you've landed on the right page.",
  points: [],
};

export type SomeoneLikeThisLine = {
  ability: string;
  challenge: string;
};

/** Scroll-pinned statements — static frame: Someone who {ability}, even if {challenge}. */
export const someoneLikeThisLines: SomeoneLikeThisLine[] = [
  {
    ability: "protects your interests in China",
    challenge:
      "supplier relationships or personal incentives create pressure to compromise",
  },
  {
    ability: "takes full ownership of your business matters in China",
    challenge:
      "you are thousands of miles away and cannot be physically present",
  },
  {
    ability: "solves problems directly with factories",
    challenge:
      "unexpected issues arise during product development or production",
  },
  {
    ability: "communicates with complete honesty and transparency",
    challenge:
      "the situation is difficult or the answer is not what you want to hear",
  },
  {
    ability: "makes sure every matter receives attention and follow-up",
    challenge: "the issue seems small or outside the original scope",
  },
  {
    ability: "understands your brand and business goals",
    challenge:
      "the challenge requires more than simple sourcing and manufacturing support",
  },
  {
    ability: "builds a sourcing and manufacturing system around your needs",
    challenge:
      "your business requires a different approach from traditional suppliers",
  },
];
