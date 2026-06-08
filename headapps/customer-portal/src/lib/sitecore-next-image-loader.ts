import type { ImageLoaderProps } from "next/image";

/**
 * XM Cloud / Content Hub media URLs are already resized and signed by Sitecore.
 * Next.js 15.5+ can fail when re-processing some remote PNGs through the built-in
 * optimizer ("received null" / format detection). Serve those URLs directly.
 *
 * @see https://github.com/vercel/next.js/issues/84187
 */
function useDirectSrc(src: string): boolean {
  if (!/^https?:\/\//i.test(src)) return false;
  try {
    const { hostname } = new URL(src);
    return (
      hostname.endsWith(".sitecorecloud.io") ||
      hostname.endsWith(".sitecorecontenthub.cloud")
    );
  } catch {
    return false;
  }
}

export default function sitecoreNextImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (useDirectSrc(src)) {
    return src;
  }
  const q = quality ?? 75;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${q}`;
}
