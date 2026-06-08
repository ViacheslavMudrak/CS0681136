import SvgIcon, { SvgIconProps } from "./SvgIcon";

export interface CollapsedLogoIconProps extends Omit<SvgIconProps, "src"> {
  decorative?: boolean;
}

/**
 * CollapsedLogoIcon component that displays a collapsed logo icon.
 */
export default function CollapsedLogoIcon({
  width = 16,
  height = 16,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: CollapsedLogoIconProps) {
  return (
    <SvgIcon
      src='/images/figma/collapsed-logo.svg'
      width={width}
      height={height}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      {...props}
    />
  );
}
