import { homeClientLogos } from "@/content/client-logos";
import "./ClientLogoMarquee.css";

/**
 * Infinite logo rail overlaid on the home hero video (bottom, transparent).
 * Two identical tracks — CSS translate -50% loops without a jump.
 */
function LogoTrack({ copy }: { copy: "a" | "b" }) {
  return (
    <ul className="client-logo-marquee__track" aria-hidden="true">
      {homeClientLogos.map((logo) => (
        <li key={`${copy}-${logo.id}`} className="client-logo-marquee__item">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="client-logo-marquee__img"
            src={logo.src}
            alt=""
            width={160}
            height={48}
            /* Eager — lazy load changes widths mid-loop and makes -50% hitch */
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </li>
      ))}
    </ul>
  );
}

export function ClientLogoMarquee() {
  return (
    <section
      className="client-logo-marquee"
      aria-label="Selected clients and partners"
    >
      <div className="client-logo-marquee__viewport">
        <div className="client-logo-marquee__rail">
          <LogoTrack copy="a" />
          <LogoTrack copy="b" />
        </div>
      </div>
    </section>
  );
}
