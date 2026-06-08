"use client";

import { cva } from "@laitram-l-l-c/intralox-ui-components";

export type TableBorderStyle = "full" | "header" | "rows" | "none";
export type TableSize = "sm" | "md" | "lg";
export type TableDensity = "compact" | "normal" | "comfortable";
export type TableHeaderAlign = "left" | "center" | "right";
export type TableStripe = "even" | "odd";

export const tableWrapperClasses = cva({
  base: ["w-full", "overflow-x-auto"],
  variants: {
    scrollY: {
      true: ["overflow-y-auto"],
    },
  },
});

export const tableClasses = cva({
  base: ["h-auto", "w-full", "min-w-full", "bg-bg-basic-color"],
  variants: {
    borderStyle: {
      header: ["border-b", "border-border-gray"],
      rows: ["border-b", "border-border-gray"],
      full: ["border", "border-border-gray", "border-collapse"],
      none: [],
    },
  },
  defaultVariants: {
    borderStyle: "full",
  },
});

export const tablePaddingClasses = cva({
  variants: {
    density: {
      compact: ["px-[12px]", "py-[12px]"],
      normal: ["px-[12px]", "py-[12px]"],
      comfortable: ["px-[12px]", "py-[12px]"],
    },
  },
  defaultVariants: {
    density: "normal",
  },
});

export const tableHeaderTextClasses = cva({
  variants: {
    size: {
      sm: ["text-[11px]"],
      md: [
        "text-[11px]",
        "font-[700]",
        "leading-[100%]",
        "tracking-[0.5px]",
        "text-text-heading-color",
      ],
      lg: ["text-[11px]"],
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const tableCellBorderClasses = cva({
  variants: {
    borderStyle: {
      none: [],
      header: [],
      rows: [],
      full: ["border-b", "border-border-gray"],
    },
  },
  defaultVariants: {
    borderStyle: "full",
  },
});

export const tableCellInlineEndBorderClasses = cva({
  variants: {
    showInlineEnd: {
      true: ["border-e", "border-border-gray"],
      false: [],
    },
  },
  defaultVariants: {
    showInlineEnd: false,
  },
});

export const tableHeaderCellClasses = cva({
  base: [
    "uppercase",
    "tracking-wide",
    "relative",
    "whitespace-nowrap",
    "[&_svg]:!w-[10px]",
    "[&_svg]:!h-[10px]",
  ],
  variants: {
    sortable: {
      true: ["cursor-pointer", "hover:bg-bg-lighter-gray"],
    },
  },
});

export const tableBodyCellClasses = cva({
  base: ["text-font-normal", "font-[500]", "leading-[1.38]", "text-text-heading-color"],
});

export const tablePlaceholderCellClasses = cva({
  base: ["text-font-normal", "font-[500]", "leading-[1.38]"],
});

export const tableLoadingContainerClasses = cva({
  base: ["flex", "items-center", "justify-center"],
});

export const tableLoadingTextClasses = cva({
  base: ["text-text-basic"],
});

export const tableEmptyStateClasses = cva({
  base: ["flex", "items-center", "justify-center", "py-8", "px-4", "text-text-basic"],
});

export const tableHeaderStickyClasses = cva({
  base: ["sticky", "top-0", "z-10"],
});

export const tableSelectHeaderCellClasses = cva({
  base: ["relative", "text-center", "border-b", "border-border-gray", "text-font-small"],
});

export const tableHeaderLabelFlexClasses = cva({
  base: ["flex", "items-center", "gap-2"],
  variants: {
    align: {
      left: ["justify-start"],
      center: ["justify-center"],
      right: ["justify-end"],
    },
  },
  defaultVariants: {
    align: "left",
  },
});

export const tableHeaderLabelTextClasses = cva({
  variants: {
    wrap: {
      true: ["break-words"],
      false: ["whitespace-nowrap"],
    },
  },
  defaultVariants: {
    wrap: false,
  },
});

export const tableSortIndicatorClasses = cva({
  base: ["text-font-small"],
});

export const tableRowClasses = cva({
  base: ["transition-colors", "last:border-0"],
  variants: {
    clickable: {
      true: ["cursor-pointer"],
    },
  },
});

export const tableSelectBodyCellClasses = cva({
  base: ["text-center"],
});

export const tableCheckboxClasses = cva({
  base: ["h-4", "w-4", "cursor-pointer"],
});

export const tablePlaceholderLoadingInnerClasses = cva({
  base: ["flex", "items-center", "justify-center", "gap-2", "py-4"],
});

export const tablePlaceholderEmptyInnerClasses = cva({
  base: ["w-full", "min-w-0"],
});

export const tableStripedRowBgClasses = cva({
  variants: {
    stripe: {
      even: ["bg-bg-basic-color"],
      odd: ["bg-bg-lighter-gray"],
    },
  },
});

export const tableDefaultRowBgClasses = cva({
  base: ["bg-bg-basic-color"],
});

/** Whether vertical inline-end borders apply for the given border style. */
export function tableShowsInlineEndBorder(borderStyle: TableBorderStyle): boolean {
  return borderStyle === "rows" || borderStyle === "full";
}
