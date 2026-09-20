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
      body: "I don't treat anyone like a fool. Staying loyal to my clients is what allows me to stand firm, no matter what happens. If protecting my client's interests isn't at the heart of what I do, then I don't see the point of doing this job at all.",
      bodyHighlight:
        "Staying loyal to my clients is what allows me to stand firm, no matter what happens.",
      image: asset("images/home/difference/1.png"),
    },
    {
      id: "focus",
      heading: "Continuously sharpening the craft",
      title: "Focus",
      body: "I've spent most of my career developing custom products for IPs. I understand how this field works and what affects every part of the process. That understanding helps me analyze problems and know where to focus my work.",
      bodyHighlight:
        "I understand how this field works and what affects every part of the process",
      image: asset("images/home/difference/2.png"),
    },
    {
      id: "proactive",
      heading: "Risks caught before they grow",
      title: "Proactive",
      body: "My role is not only to react when issues appear. I actively look ahead, identify potential risks early, and take action before small problems become costly or difficult to solve.",
      bodyHighlight: "take action before small problems become costly",
      image: asset("images/home/difference/4.png"),
    },
    {
      id: "reliable",
      heading: "Every thread driven to a result",
      title: "Reliable",
      body: "Nothing is left unanswered, and everything is driven to a result because this is the minimum standard I uphold in every project.",
      bodyHighlight:
        "Nothing is left unanswered, and everything is driven to a result",
      image: asset("images/home/difference/3.png"),
    },
    {
      id: "practical-experience",
      heading: "Decisions rooted in the factory floor",
      title: "Hands-on",
      body: "I'm deeply involved in every project I take on, working on-site with the people in charge of each key process. I talk directly with workers, sit down with engineers, and negotiate with factory owners to get the support and resources each project needs.",
      bodyHighlight:
        "working on-site with the people in charge of each key process",
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

/** My Approach — horizontal media cards (Apple-style rail). */
export type MyApproachPoint = {
  id: string;
  title: string;
  body: string;
  /** Phrase inside `body` rendered black; rest stays muted */
  bodyHighlight?: string;
  /** Card media — dedicated approach assets later; placeholders OK for now */
  image?: string;
  video?: string;
};

export const myApproach = {
  id: "my-approach",
  /** Section title above the card rail */
  title: "My approach.",
  points: [
    {
      id: "i-care-about-your-business",
      title: "I care about your business",
      body: "I keep your business in mind throughout my work, always asking whether there is a better way to do something that could help you more. I care about whether my work can make a real difference to your business and help it grow further.",
      bodyHighlight:
        "I care about whether my work can make a real difference to your business and help it grow further",
      image: asset("images/home/difference/3.png"),
    },
    {
      id: "i-work-hard",
      title: "I work hard",
      body: "I'm always on the way to making things better, and I don't mind the extra work it takes to get there. I'll test, adjust, and iterate as many times as needed. I don't stop at “good enough.” I want the result to be as good as I know it can be.",
      bodyHighlight: "I don't stop at “good enough.”",
      video: asset(
        `/images/home/${encodeURIComponent("My approach")}/${encodeURIComponent("I work hard.mp4")}`,
      ),
    },
    {
      id: "i-dont-lie",
      title: "I don't lie",
      body: "I tell you what is actually happening, even when the answer isn't good. No hiding problems, no making promises I can't keep. I know hiding the truth only creates bigger problems later. The only way forward is to face problems honestly, deal with them directly, and get them solved.",
      bodyHighlight:
        "I know hiding the truth only creates bigger problems later",
      /* Placeholder — swap when approach media is ready */
      image: asset("images/home/difference/1.png"),
    },
    {
      id: "i-think-different",
      title: "I think different",
      body: "What matters to me is getting the problem solved. I don't limit myself to how things are normally done. I'm willing to try, adjust, and find what works. I'm always thinking about how I can do things better than I did before.",
      bodyHighlight:
        "I'm always thinking about how I can do things better than I did before",
      image: asset("images/home/difference/2.png"),
    },
    {
      id: "i-love-what-i-do",
      title: "I love what I do",
      body: "I care deeply about the result of every project. When it goes well, I'm proud of it. When it doesn't, I'm frustrated by it. I want every project I take on to be something I'm proud to have worked on.",
      bodyHighlight:
        "I want every project I take on to be something I'm proud to have worked on",
      image: asset("images/home/difference/5.png"),
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
  /**
   * Still cover — only dedicated recognition media.
   * Omit when the card is product-box / video-only (no project-cover placeholders).
   */
  image?: string;
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
  slides: [
    {
      id: "client-rehire",
      title: "Clients Come Back",
      body: "Clients rehire me when they need to develop complex or highly customized products without an existing solution.",
      /* Media: product-box packs (recognitionProductBox) — no still cover */
    },
    {
      id: "positive-reviews",
      title: "Positive reviews",
      body: "Products receive positive feedback from clients and end consumers after delivery.",
      /* Video only — no project-cover placeholder under the clip */
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
      /* Video only — no project-cover placeholder under the clip */
      video: asset(
        `/images/home/${encodeURIComponent("Recognition comes first")}/${encodeURIComponent("95% long-term supplier retention")}/video.mp4`,
      ),
      durationMs: 12000,
    },
  ],
};
