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
  /** Optional blurred photo plate behind the band */
  backgroundImage?: string;
};

/**
 * Home editorial sections — titles locked; body/points filled when ready.
 */
export const whatSetsMeApart: HomeCopySection = {
  id: "what-sets-me-apart",
  eyebrow: "Character",
  title: "What makes me stand out",
  subtitle: "",
  /* Solid gray plate — photo underlay retired */
  backgroundImage: undefined,
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

/** My Approach — black plate band (former someone layout). */
export type MyApproachPoint = {
  id: string;
  title: string;
  body: string;
};

export const myApproach = {
  id: "my-approach",
  /** Left-column section title */
  title: "My approach.",
  points: [
    {
      id: "i-dont-lie",
      title: "I don't lie",
      body: "I tell you what is actually happening — even when the answer isn't good. No hiding problems, no making promises I can't keep. I'd rather tell you the truth early than make you regret trusting me later.",
    },
    {
      id: "i-think-different",
      title: "I think different",
      body: "I don't always follow the obvious way. When the usual solution doesn't work, I look for another one — whether it's a different material, process, supplier, or way to solve the problem.",
    },
    {
      id: "i-work-hard",
      title: "I work hard",
      body: "I don't just give instructions and wait for things to happen. I get into the details, talk to factories, check samples, solve problems, and keep things moving until the job is done.",
    },
    {
      id: "i-care-you",
      title: "I care you",
      body: "Your feedback tells me whether I actually did a good job. I listen, I ask questions, and I make changes when something can be better. A successful project isn't just one that gets delivered — it's one you're happy to receive.",
    },
    {
      id: "i-own-it",
      title: "I own it",
      body: "Once I take on a project, I take responsibility for it. If something goes wrong, I don't look for someone to blame. I figure out what happened, find a solution, and stay with it until it's fixed.",
    },
  ] satisfies MyApproachPoint[],
};
/** Home recognition — Apple-style highlights carousel (demo; refine media later). */
export type HomeRecognitionSlide = {
  id: string;
  /** Card title — Grtsk SemiBold; no all-caps */
  title: string;
  /** Card body — Grtsk Regular */
  body: string;
  image: string;
  /** Optional mobile (≤700px) still — falls back to `image` */
  imageMobile?: string;
  /** Optional looping cover — preferred over `image` when set */
  video?: string;
  /** Optional mobile (≤700px) cover video — falls back to `video` */
  videoMobile?: string;
  /**
   * Dwell for this slide’s pager (ms). Required for video slides so the
   * progress bar matches the clip (default `slideDurationMs` is too short).
   */
  durationMs?: number;
  /** Mobile cover duration when `videoMobile` differs from desktop */
  durationMsMobile?: number;
  /** Optional photo accordion panels (order = display order) */
  photoAccordion?: string[];
};

export type HomeRecognitionCopy = {
  id: string;
  /** Small label above the headline */
  eyebrow: string;
  /**
   * Headline as segments so an optional inline portrait can sit between words.
   * Example: ["Client recognition has always", "been the starting point…"]
   */
  headlineBefore: string;
  headlineAfter: string;
  /** Optional square cut-in inside the headline — unused in current layout */
  portrait?: string;
  /** Autoplay duration per slide (ms) */
  slideDurationMs: number;
  slides: HomeRecognitionSlide[];
};

export const homeRecognition: HomeRecognitionCopy = {
  id: "client-recognition",
  eyebrow: "",
  headlineBefore: "Recognition comes first.",
  headlineAfter: "",
  portrait: asset(`/images/about/${encodeURIComponent("My Profile.jpg")}`),
  slideDurationMs: 6000,
  /* Demo stills — swap for dedicated recognition media later */
  slides: [
    {
      id: "client-rehire",
      title: "Clients Come Back",
      body: "Clients rehire me when they need to develop complex or highly customized products without an existing solution.",
      image: asset(
        `/images/projects/${encodeURIComponent("Dragon Age Writing Bundle")}/${encodeURIComponent("VARRIC TETHRAS cover.jpg")}`,
      ),
    },
    {
      id: "positive-reviews",
      title: "Positive reviews",
      body: "Products receive positive feedback from clients and end consumers after delivery.",
      image: asset(
        `/images/projects/${encodeURIComponent("Mass Effect Tali Companion Bundle")}/${encodeURIComponent("Mass Effect Tali Companion Bundle.jpg")}`,
      ),
      video: asset(
        `/images/home/${encodeURIComponent("Recognition comes first")}/${encodeURIComponent("Positive reviews")}/video.mp4`,
      ),
      videoMobile: asset(
        `/images/home/${encodeURIComponent("Recognition comes first")}/${encodeURIComponent("Positive reviews")}/phone.mp4`,
      ),
      /* Match real clip length — pager must not cut the video short */
      durationMs: 29500,
      durationMsMobile: 36400,
    },
    {
      id: "series",
      title: "Products developed into a series",
      body: "When the first small-batch product sells well, clients continue developing more products based on the same proven design.",
      image: asset(
        `/images/home/${encodeURIComponent("Recognition comes first")}/${encodeURIComponent("Products developed into a series")}/picture.jpg`,
      ),
      imageMobile: asset(
        `/images/home/${encodeURIComponent("Recognition comes first")}/${encodeURIComponent("Products developed into a series")}/phone.jpg`,
      ),
    },
    {
      id: "reordered",
      title: "Clients Reorder",
      body: "Strong sales often lead clients to place repeat orders soon after the first production run.",
      image: asset(
        `/images/home/${encodeURIComponent("Recognition comes first")}/${encodeURIComponent("Clients Reorder")}/1.jpg`,
      ),
      photoAccordion: [1, 2, 3, 4].map((n) =>
        asset(
          `/images/home/${encodeURIComponent("Recognition comes first")}/${encodeURIComponent("Clients Reorder")}/${n}.jpg`,
        ),
      ),
      /* Mobile hard-cut: 4 frames × 2s — carousel waits for one full pass */
      durationMsMobile: 8000,
    },
    {
      id: "supplier-retention",
      title: "95% long-term supplier retention",
      body: "I maintain strong relationships with factories, small workshops, material suppliers, and key process specialists, allowing me to quickly access the manufacturing information I need.",
      image: asset(
        `/images/projects/${encodeURIComponent("Halo 5 Guardians Limited Edition Collectors Statue")}/${encodeURIComponent("1.jpg")}`,
      ),
      video: asset(
        `/images/home/${encodeURIComponent("Recognition comes first")}/${encodeURIComponent("95% long-term supplier retention")}/video.mp4`,
      ),
      durationMs: 12000,
    },
  ],
};
