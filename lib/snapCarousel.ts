/** Apple-style snap carousel — measure stops, paddle nav, settle sync. */

export type SnapCarouselOptions = {
  root: HTMLElement;
  scroller: HTMLElement;
  slides: HTMLElement[];
  prev: HTMLButtonElement;
  next: HTMLButtonElement;
  onIndexChange?: (index: number, count: number) => void;
};

export class SnapCarousel {
  root: HTMLElement;
  scroller: HTMLElement;
  slides: HTMLElement[];
  prev: HTMLButtonElement;
  next: HTMLButtonElement;
  onIndexChange?: (index: number, count: number) => void;
  stops: { left: number; item: number }[] = [];
  index = 0;
  pending = false;
  timer = 0;
  frame = 0;
  width: number;
  abort = new AbortController();
  reduceMotion: MediaQueryList;
  observer: ResizeObserver;

  constructor({
    root,
    scroller,
    slides,
    prev,
    next,
    onIndexChange,
  }: SnapCarouselOptions) {
    this.root = root;
    this.scroller = scroller;
    this.slides = slides;
    this.prev = prev;
    this.next = next;
    this.onIndexChange = onIndexChange;
    this.width = scroller.clientWidth;
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const { signal } = this.abort;

    this.measure();
    this.sync();

    /* Clicks are wired from React — keep scroll/keyboard/resize here. */
    this.scroller.addEventListener(
      "scroll",
      () => {
        if (!this.pending) this.sync();
        clearTimeout(this.timer);
        this.timer = window.setTimeout(() => this.settle(), 180);
      },
      { passive: true, signal },
    );
    this.scroller.addEventListener("scrollend", () => this.settle(), {
      signal,
    });

    const interrupt = () => {
      this.pending = false;
      clearTimeout(this.timer);
      this.sync();
    };
    this.scroller.addEventListener("pointerdown", interrupt, {
      passive: true,
      signal,
    });
    this.scroller.addEventListener("touchstart", interrupt, {
      passive: true,
      signal,
    });
    this.scroller.addEventListener("wheel", interrupt, {
      passive: true,
      signal,
    });
    this.scroller.addEventListener(
      "keydown",
      (event) => {
        if (event.target !== this.scroller) return;
        const destinations: Record<string, number> = {
          ArrowLeft: this.index - 1,
          ArrowRight: this.index + 1,
          Home: 0,
          End: this.stops.length - 1,
        };
        if (!(event.key in destinations)) return;
        event.preventDefault();
        this.go(destinations[event.key]);
      },
      { signal },
    );

    this.observer = new ResizeObserver(() => {
      const width = this.scroller.clientWidth;
      const scrollW = this.scroller.scrollWidth;
      if (
        Math.abs(width - this.width) < 0.5 &&
        this.stops.length === this.slides.length
      ) {
        /* Still remeasure when content width changes (images / type). */
        const max = Math.max(0, scrollW - width);
        const last = this.stops[this.stops.length - 1]?.left ?? 0;
        if (Math.abs(last - max) < 2 && this.stops.length > 1) return;
      }
      this.width = width;
      const item = this.stops[this.index]?.item ?? 0;
      this.pending = true;
      clearTimeout(this.timer);
      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(() => {
        this.measure();
        let best = 0;
        this.stops.forEach((stop, i) => {
          if (
            Math.abs(stop.item - item) <
            Math.abs(this.stops[best].item - item)
          ) {
            best = i;
          }
        });
        this.go(best, "instant");
      });
    });
    this.observer.observe(this.scroller);
    const track = this.scroller.querySelector(".home-someone__track");
    if (track) this.observer.observe(track);
  }

  measure() {
    const max = Math.max(
      0,
      this.scroller.scrollWidth - this.scroller.clientWidth,
    );
    /*
     * Use layout offsets (not getBoundingClientRect) so stops stay correct
     * regardless of current scrollLeft / subpixel paint.
     */
    const origin = this.slides[0]?.offsetLeft ?? 0;
    this.stops = [];
    this.slides.forEach((slide, item) => {
      const left = Math.min(max, Math.max(0, slide.offsetLeft - origin));
      const previous = this.stops[this.stops.length - 1];
      if (previous && Math.abs(previous.left - left) < 1) previous.item = item;
      else this.stops.push({ left, item });
    });
  }

  go(index: number, behavior: ScrollBehavior | "instant" = "smooth") {
    this.measure();
    if (!this.stops.length) return;
    clearTimeout(this.timer);
    this.index = Math.max(0, Math.min(index, this.stops.length - 1));
    const left = this.stops[this.index].left;
    const instant = behavior === "instant" || this.reduceMotion.matches;
    this.pending =
      !instant && Math.abs(this.scroller.scrollLeft - left) > 1;
    this.update();
    this.scroller.scrollTo({
      left,
      behavior: instant ? "instant" : "smooth",
    });
    if (!this.pending) this.sync();
  }

  settle() {
    clearTimeout(this.timer);
    this.pending = false;
    this.sync();
  }

  sync() {
    const position = this.scroller.scrollLeft;
    let closest = 0;
    this.stops.forEach((stop, i) => {
      if (
        Math.abs(stop.left - position) <
        Math.abs(this.stops[closest].left - position)
      ) {
        closest = i;
      }
    });
    this.index = closest;
    this.update();
  }

  update() {
    const active = this.stops[this.index]?.item;
    this.slides.forEach((slide, i) => {
      slide.classList.toggle("is-current", i === active);
      if (i === active) slide.setAttribute("aria-current", "true");
      else slide.removeAttribute("aria-current");
    });
    this.onIndexChange?.(this.index, this.stops.length);
  }

  destroy() {
    this.abort.abort();
    this.observer.disconnect();
    clearTimeout(this.timer);
    cancelAnimationFrame(this.frame);
  }
}
