import {
  createHomeOgImage,
  OG_ALT,
  OG_CONTENT_TYPE,
  OG_SIZE,
} from "@/lib/og/home-og-image";

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * Default Open Graph image — landing-page brand composition.
 */
const OpenGraphImage = () => createHomeOgImage();

export default OpenGraphImage;
