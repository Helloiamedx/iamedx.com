import { asset } from "@/lib/assets";

const HOME_CLIENT_LOGO_COUNT = 20;
/** Skip broken / unwanted marks in the strip */
const HOME_CLIENT_LOGO_SKIP = new Set([3]);

export type ClientLogo = {
  id: string;
  src: string;
};

/** Homepage strip on the hero video — CDN: client-logos/homeroll/homerollN.svg */
export const homeClientLogos: ClientLogo[] = Array.from(
  { length: HOME_CLIENT_LOGO_COUNT },
  (_, index) => index + 1,
)
  .filter((n) => !HOME_CLIENT_LOGO_SKIP.has(n))
  .map((n) => ({
    id: `homeroll-${n}`,
    src: asset(`/images/client-logos/homeroll/homeroll${n}.svg`),
  }));
