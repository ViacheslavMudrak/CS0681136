export interface SvgIconProps {
  /**
   * Path to the SVG file in the public folder (e.g., '/images/figma/invoice.svg')
   */
  src: string;
  /**
   * Width of the icon
   * @default 16
   */
  width?: number | string;
  /**
   * Height of the icon
   * @default 16
   */
  height?: number | string;
  /**
   * Additional CSS class name
   */
  className?: string;
  /**
   * Alt text for accessibility
   */
  alt?: string;
  /**
   * Accessibility label
   */
  "aria-label"?: string;
  /**
   * Whether the icon is decorative (hidden from screen readers)
   * @default true
   */
  decorative?: boolean;
}

/**
 * SvgIcon component that loads SVG files from the public folder.
 * This component renders an img tag with proper styling and accessibility attributes.
 */
export default function SvgIcon({
  src,
  alt = "",
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: SvgIconProps) {
  const widthValue = typeof width === "number" ? `${width}px` : width;
  const heightValue = typeof height === "number" ? `${height}px` : height;

  return (
    <img
      src={src}
      alt={decorative ? "" : ariaLabel || alt}
      width={widthValue}
      height={heightValue}
      className={`inline-block flex-shrink-0 ${className}`}
      aria-label={decorative ? undefined : ariaLabel || alt}
      aria-hidden={decorative}
      role={decorative ? "presentation" : "img"}
      {...props}
    />
  );
}
