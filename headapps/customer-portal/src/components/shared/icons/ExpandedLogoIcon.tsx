import Image from "next/image";
import IntraloxLogo from "../../../assets/images/logo.png";
import { SvgIconProps } from "./SvgIcon";
export interface ExpandedLogoIconProps extends Omit<SvgIconProps, "src"> {
  decorative?: boolean;
}

/**
 * ExpandedLogoIcon component that displays an expanded logo icon.
 */
export default function ExpandedLogoIcon({
  width = 120,
  height = 73,
  className = "",
  decorative = true,
  "aria-label": ariaLabel,
  ...props
}: ExpandedLogoIconProps) {
  return (
    <Image
      src={IntraloxLogo}
      width={width as number}
      height={height as number}
      className={className}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative}
      alt='Intralox Logo'
      {...props}
    />
  );
}
