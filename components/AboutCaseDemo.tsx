"use client";

import Image from "next/image";
import { useLenis } from "lenis/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { asset } from "@/lib/assets";

const TAGS = [
  "Brand Identity",
  "Motion Graphics & Film",
  "Brand Strategy",
  "Verbal Identity",
  "Technology",
  "Climate & Sustainability",
] as const;

type MediaItem =
  | { kind: "full"; src: string; alt: string; ratio: string }
  | { kind: "pair"; left: { src: string; alt: string; ratio: string }; right: { src: string; alt: string; ratio: string } };

const MEDIA: MediaItem[] = [
  {
    kind: "full",
    src: asset("/images/projects/homeroll - 1.jpg"),
    alt: "Demo hero still",
    ratio: "56.25%",
  },
  {
    kind: "pair",
    left: {
      src: asset("/images/projects/homeroll - 2.jpg"),
      alt: "Demo frame A",
      ratio: "133.6%",
    },
    right: {
      src: asset("/images/projects/homeroll - 3.jpg"),
      alt: "Demo frame B",
      ratio: "133.6%",
    },
  },
  {
    kind: "full",
    src: asset("/images/projects/homeroll - 4.jpg"),
    alt: "Demo featured still",
    ratio: "56.25%",
  },
  {
    kind: "pair",
    left: {
      src: asset("/images/projects/homeroll - 5.jpg"),
      alt: "Demo frame C",
      ratio: "100%",
    },
    right: {
      src: asset("/images/projects/homeroll - 6.jpg"),
      alt: "Demo frame D",
      ratio: "100%",
    },
  },
  {
    kind: "full",
    src: asset("/images/projects/homeroll - 7.jpg"),
    alt: "Demo landscape still",
    ratio: "56.25%",
  },
  {
    kind: "pair",
    left: {
      src: asset("/images/projects/homeroll - 8.jpg"),
      alt: "Demo frame E",
      ratio: "133.6%",
    },
    right: {
      src: asset("/images/projects/homeroll - 9.jpg"),
      alt: "Demo frame F",
      ratio: "133.6%",
    },
  },
  {
    kind: "full",
    src: asset("/images/projects/homeroll - 10.jpg"),
    alt: "Demo closing still",
    ratio: "56.25%",
  },
  {
    kind: "pair",
    left: {
      src: asset("/images/projects/homeroll - 11.jpg"),
      alt: "Demo frame G",
      ratio: "100%",
    },
    right: {
      src: asset("/images/projects/homeroll - 12.jpg"),
      alt: "Demo frame H",
      ratio: "100%",
    },
  },
];

function readCssPx(name: string, fallback: number) {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readHeaderOffset() {
  return readCssPx("--header-offset", 60);
}

function readShellGutter() {
  return readCssPx("--shell-gutter", 24);
}

function Frame({
  src,
  alt,
  ratio,
}: {
  src: string;
  alt: string;
  ratio: string;
}) {
  return (
    <div className="about-case-demo__frame" style={{ paddingBottom: ratio }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 800px) 100vw, 70vw"
        className="about-case-demo__img"
        draggable={false}
      />
    </div>
  );
}

/**
 * Temporary About-page demo of the Pentagram-style case layout:
 * video hero with left-stacked overlay, image weave, About panel toggle.
 */
export function AboutCaseDemo() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [btnReady, setBtnReady] = useState(false);
  const [btnBox, setBtnBox] = useState({ top: 0, right: 0 });
  const panelId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const mediaStackRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const panelInnerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const scrollCopyToStart = () => {
    const body = bodyRef.current;
    if (!body) return;
    const offset = -(readHeaderOffset() + readShellGutter());
    /* Prefer panel so copy line 1 lands under the header */
    const target = panelRef.current ?? body;
    const lenisNow = lenisRef.current;
    if (lenisNow) {
      /* Desktop Lenis owns the scroll — window.scrollTo is ignored */
      lenisNow.scrollTo(target, { offset, immediate: true });
    } else {
      const y =
        window.scrollY + target.getBoundingClientRect().top + offset;
      window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
    }
    panelInnerRef.current?.scrollTo({ top: 0, behavior: "auto" });
  };

  const toggleOpen = () => setOpen((prev) => !prev);

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Shell-fixed pin, clamped to the real media(/copy) band:
   * - travels with content top (never over the video)
   * - docks under header while mid-gallery
   * - hits content bottom and leaves (same idea as the top dock)
   * X from body right edge (open-push does not move it).
   * Y band from media stack; when open, bottom = taller of media vs copy.
   */
  useEffect(() => {
    const body = bodyRef.current;
    const media = mediaStackRef.current;
    if (!body || !media) return;

    const sync = () => {
      const header = readHeaderOffset();
      const gutter = readShellGutter();
      const bodyRect = body.getBoundingClientRect();
      const mediaRect = media.getBoundingClientRect();
      const panelRect = panelRef.current?.getBoundingClientRect();
      const btnH = btnRef.current?.offsetHeight || 40;
      const contentTop = mediaRect.top;
      const contentBottom =
        open && panelRect && panelRect.height > 0
          ? Math.max(mediaRect.bottom, panelRect.bottom)
          : mediaRect.bottom;
      const dockTop = header + gutter;
      const maxTop = contentBottom - btnH;
      const top = Math.min(Math.max(contentTop, dockTop), maxTop);
      const nextReady =
        maxTop >= dockTop &&
        contentTop < window.innerHeight &&
        contentBottom > dockTop;
      const nextBox = {
        top,
        right: Math.max(0, window.innerWidth - bodyRect.right),
      };

      setBtnReady((prev) => (prev === nextReady ? prev : nextReady));
      setBtnBox((prev) =>
        prev.top === nextBox.top && prev.right === nextBox.right
          ? prev
          : nextBox,
      );
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    const ro = new ResizeObserver(sync);
    ro.observe(body);
    ro.observe(media);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      ro.disconnect();
    };
  }, [mounted, open]);

  /*
   * On open: jump to copy line 1. Layout width change can trigger scroll
   * anchoring and undo a single scrollTo — disable anchoring and re-apply.
   */
  useLayoutEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevAnchor = root.style.overflowAnchor;
    root.style.overflowAnchor = "none";
    scrollCopyToStart();
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      scrollCopyToStart();
      id2 = requestAnimationFrame(() => {
        scrollCopyToStart();
        root.style.overflowAnchor = prevAnchor;
      });
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
      root.style.overflowAnchor = prevAnchor;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (window.matchMedia("(max-width: 799px)").matches) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <div className={`about-case-demo${open ? " is-about-open" : ""}`}>
      <section className="about-case-demo__hero" aria-label="Univers demo">
        <div className="about-case-demo__hero-media" aria-hidden="true">
          <ProtectedVideo
            className="about-case-demo__hero-video"
            src={asset("videos/home-hero-video.mp4")}
            preload="metadata"
          />
          <div className="about-case-demo__hero-scrim" />
        </div>

        <div className="about-case-demo__hero-copy">
          <p className="about-case-demo__eyebrow">Demo layout · not live content</p>
          <h1 className="about-case-demo__title">Univers</h1>
          <p className="about-case-demo__summary">
            Strategy, brand system, and website for the world’s most
            comprehensive decarbonisation platform.
          </p>
          <ul className="about-case-demo__tags">
            {TAGS.map((tag) => (
              <li key={tag}>
                <span className="about-case-demo__tag">{tag}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {mounted
        ? createPortal(
            <button
              ref={btnRef}
              type="button"
              className={`about-case-demo__about-btn${btnReady ? " is-ready" : ""}${open ? " is-open" : ""}`}
              style={{ top: btnBox.top, right: btnBox.right }}
              aria-expanded={open}
              aria-controls={panelId}
              tabIndex={btnReady ? 0 : -1}
              onClick={toggleOpen}
            >
              <span>About the project</span>
              <span className="about-case-demo__about-icon" aria-hidden="true">
                +
              </span>
            </button>,
            document.body,
          )
        : null}

      <div ref={bodyRef} className="about-case-demo__body">
        <div className="about-case-demo__columns">
          <div className="about-case-demo__media-col">
            <div ref={mediaStackRef} className="about-case-demo__media-stack">
              {MEDIA.map((item, index) => {
                if (item.kind === "pair") {
                  return (
                    <div key={`pair-${index}`} className="about-case-demo__pair">
                      <Frame {...item.left} />
                      <Frame {...item.right} />
                    </div>
                  );
                }
                return (
                  <div key={`full-${index}`} className="about-case-demo__full">
                    <Frame {...item} />
                  </div>
                );
              })}
            </div>
          </div>

          <aside
            ref={panelRef}
            id={panelId}
            className="about-case-demo__panel"
            aria-hidden={!open}
            {...(!open ? { inert: true } : {})}
          >
            <div ref={panelInnerRef} className="about-case-demo__panel-inner">
              <button
                type="button"
                className="about-case-demo__panel-close"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
              <div className="about-case-demo__panel-copy">
              <p>
                <strong>Unity Through Connection</strong>
                <br />
                Univers is a global platform designed to coordinate the systems
                required to reach net zero. Connecting people, data, hardware,
                and organisations, it enables governments and businesses to
                measure impact and act collectively on climate.
              </p>
              <p>
                As the climate crisis shifts from debate to implementation, the
                need for coordinated action has become clear. Univers was
                created to meet this challenge, building an ecosystem that helps
                business and government leaders measure, manage, and accelerate
                decarbonisation. Today it connects more than 365 million
                devices, manages 845GW of renewable energy, and supports a
                network of over 500 partners, including Microsoft, Starbucks,
                and HSBC.
              </p>
              <p>
                <strong>The Challenge</strong>
                <br />
                Formerly Envision Digital, the company partnered with Pentagram
                to create a future-facing brand that matched the scale of its
                ambition and the promise of its new name, Univers. The visual
                identity and digital experience were designed to communicate a
                highly complex decarbonisation platform in a clear, compelling,
                and scalable way.
              </p>
              <p>
                <strong>Strategy</strong>
                <br />
                At the heart of Univers is a simple principle: connection
                generates energy. Previously isolated technologies are brought
                together into a single ecosystem, where environmental and
                operational data can be monitored, analysed, and coordinated in
                real time.
              </p>
              <p>
                From individual devices to global infrastructure, Univers
                reframes decarbonisation as an interconnected network working
                toward a shared goal.
              </p>
              <p>
                <strong>Identity</strong>
                <br />
                The identity translates this principle into a graphic language
                inspired by the structure of the universe. At the micro scale,
                the dot represents data, precision, and the individual actor. At
                the macro scale, the universe symbolises collective impact and
                global possibility.
              </p>
              <p>
                Together these elements create a flexible design system that
                adapts seamlessly across software, hardware, communications, and
                immersive environments.
              </p>
              <p>
                <strong>Symbol and Wordmark</strong>
                <br />
                The symbol expresses coordination through motion. Eight spheres
                orbit before converging into a single gravitational form,
                illustrating how independent elements align around a common
                purpose.
              </p>
              <p>
                The geometric wordmark balances engineered precision with
                clarity. A bespoke ‘un’ ligature anchors the identity, embodying
                the act of joining, an idea central to the original brief.
              </p>
              <p>
                <strong>Visual System</strong>
                <br />
                The visual language extends across colour, imagery, and motion. A
                neutral base palette grounds the brand, while vibrant accents
                signal energy and discovery. Art direction celebrates the Earth
                as both subject and responsibility. Cinematic 3D imagery
                reinforces the principles of harmony and connection, pairing
                human presence with a sense of the infinite.
              </p>
              <p>
                <strong>Generative Design Tool</strong>
                <br />
                A bespoke generative tool enables the design team to continuously
                expand the system. Each sphere sits within its own orbit,
                creating a miniature solar system where elements move
                independently while remaining connected. The tool produces
                infinite compositions while maintaining a coherent visual
                language.
              </p>
              <p>
                <strong>Outcome</strong>
                <br />
                Univers positions decarbonisation as a coordinated effort rather
                than a collection of isolated actions. Through strategy,
                identity, and digital design, the project establishes a flexible
                framework for communicating one of the world&apos;s most
                ambitious climate technology platforms.
              </p>

              <div className="about-case-demo__meta">
                <div className="about-case-demo__meta-col">
                  <div className="about-case-demo__meta-block">
                    <h3>Client</h3>
                    <p>Envision</p>
                  </div>
                  <div className="about-case-demo__meta-block">
                    <h3>Sector</h3>
                    <ul>
                      <li>Technology</li>
                      <li>Climate &amp; Sustainability</li>
                    </ul>
                  </div>
                  <div className="about-case-demo__meta-block">
                    <h3>Discipline</h3>
                    <ul>
                      <li>Brand Identity</li>
                      <li>Motion Graphics &amp; Film</li>
                      <li>Brand Strategy</li>
                      <li>Verbal Identity</li>
                    </ul>
                  </div>
                </div>
                <div className="about-case-demo__meta-col">
                  <div className="about-case-demo__meta-block">
                    <h3>Office</h3>
                  </div>
                  <div className="about-case-demo__meta-block">
                    <h3>Partners</h3>
                    <ul>
                      <li>Jody Hudson-Powell</li>
                      <li>Luke Powell</li>
                    </ul>
                  </div>
                  <div className="about-case-demo__meta-block">
                    <h3>Project team</h3>
                    <ul>
                      <li>Ashley Johnson (brand narrative)</li>
                      <li>Ceri Stock</li>
                      <li>Stefan van Rijn</li>
                      <li>Helena Postigo Matey</li>
                      <li>Jonathan Quaade</li>
                      <li>Harrie Yoo</li>
                      <li>Luis Gutiérrez</li>
                      <li>Matt Hill</li>
                    </ul>
                  </div>
                  <div className="about-case-demo__meta-block">
                    <h3>Collaborators</h3>
                    <ul>
                      <li>Jamie Rickett</li>
                      <li>Harry Boyd</li>
                      <li>Daniel Kozma</li>
                      <li>Yurii Khomovskyi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        </div>
      </div>
    </div>
  );
}
