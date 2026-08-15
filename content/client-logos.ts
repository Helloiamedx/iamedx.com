import { asset } from "@/lib/assets";

export type ClientLogo = {
  id: string;
  src: string;
  label: string;
};

type HomeLogoEntry =
  | { file: string; label: string }
  | { id: string; path: string; label: string };

/** Homepage strip — CDN under client-logos/brands/* unless `path` is set */
const HOME_BRAND_LOGOS: HomeLogoEntry[] = [
  { file: "2K_Games_Logo.svg", label: "2K Games" },
  { file: "Bethesda_Softworks_Logo.svg", label: "Bethesda Softworks" },
  { file: "BioWare-Logo.wine.svg", label: "BioWare" },
  { file: "Blizzard_Entertainment_Logo.svg", label: "Blizzard Entertainment" },
  { file: "Capcom_logo.svg", label: "Capcom" },
  /* Not list-first — marquee centers this id on every load while already scrolling */
  {
    id: "disney",
    path: "/images/client-logos/homeroll/Disney.svg",
    label: "Disney",
  },
  { file: "DPI Merchandising.svg", label: "DPI Merchandising" },
  { file: "Embracer Group.svg", label: "Embracer Group" },
  { file: "IGN Gaming.svg", label: "IGN Gaming" },
  { file: "LimitedRun.svg", label: "Limited Run Games" },
  { file: "Nintendo.svg", label: "Nintendo" },
  { file: "PLAION-Logo_horizontal_RGB_neg.svg", label: "PLAION" },
  { file: "Rockstar_Games_Logo.svg", label: "Rockstar Games" },
  { file: "Sony_Interactive_Entertainment.svg", label: "Sony Interactive Entertainment" },
  { file: "Ubisoft_logo.svg", label: "Ubisoft" },
  { file: "ZeniMax Media.svg", label: "ZeniMax Media" },
  { file: "cd-projekt-red-seeklogo.svg", label: "CD PROJEKT RED" },
  { file: "electronic-arts-1.svg", label: "Electronic Arts" },
  { file: "site-logo.svg", label: "Partner" },
];

/** Logo that sits in the viewport center on every homepage load */
export const HOME_LOGO_CENTER_ID = "disney";

export const homeClientLogos: ClientLogo[] = HOME_BRAND_LOGOS.map((entry) => {
  if ("path" in entry) {
    return {
      id: entry.id,
      src: asset(entry.path),
      label: entry.label,
    };
  }
  return {
    id: entry.file.replace(/\.[^.]+$/, "").replace(/\s+/g, "-").toLowerCase(),
    src: asset(`/images/client-logos/brands/${encodeURIComponent(entry.file)}`),
    label: entry.label,
  };
});
