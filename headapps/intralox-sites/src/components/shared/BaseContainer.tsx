import { cn } from "lib/utils";

export type ContainerWidth =
  | "sm"
  | "md"
  | "lg"
  | "default"
  | "divider"
  | "contentSwitcher";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * `divider` caps at 992px at xl (live site column), unlike `default` (1200px at xl).
   * `contentSwitcher` matches live intralox.com content-switcher column: `lg` 992px, `xl` 1024px (not `default`'s 1200px).
   */
  width?: ContainerWidth;
  style?: React.CSSProperties;
  paddingX?: boolean;
  /**
   * When true, omit the Bootstrap grid `container` class (992px cap at `lg`).
   * Use inside overlays/modals where `className` max-widths must apply.
   */
  bare?: boolean;
}

const ContainerBase = ({
  children,
  className,
  width,
  paddingX = true,
  bare = false,
  ...other
}: ContainerProps) => {
  const widthClasses = bare
    ? ``
    : `
    ${
      {
        sm: "sm:!max-w-[600px] md:!max-w-[768px] lg:!max-w-195.5",
        md: "sm:!max-w-[600px] md:!max-w-[768px] lg:!max-w-4xl",
        lg: "sm:!max-w-[600px] md:!max-w-[768px] lg:!max-w-[992px] xl:!max-w-5xl",
        default:
          "sm:!max-w-[600px] md:!max-w-[768px] lg:!max-w-[992px] xl:!max-w-[1200px]",
        contentSwitcher:
          "sm:max-w-[600px] md:max-w-[768px] lg:max-w-[992px] xl:max-w-5xl",
        divider:
          "sm:max-w-[600px] md:max-w-[768px] lg:max-w-[992px] xl:max-w-[992px]",
      }[width || "default"]
    }
    `;
  const _className = `${widthClasses} ${className}`;
  return (
    <div
      className={cn(
        !bare && "container",
        "mx-auto",
        !bare && "max-w-full",
        paddingX ? "px-4" : "px-0",
        _className,
      )}
      {...other}
    >
      {children}
    </div>
  );
};
export const Container = ContainerBase;
