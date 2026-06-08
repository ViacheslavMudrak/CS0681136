import componentMap from ".sitecore/component-map";
import { AppPlaceholder } from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from "lib/component-props";
import { JSX } from "react";

type ColumnNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type ColumnWidths = {
  [K in ColumnNumber as `ColumnWidth${K}`]?: string;
};

type ColumnStyles = {
  [K in ColumnNumber as `Styles${K}`]?: string;
};

interface ColumnSplitterProps extends ComponentProps {
  params: ComponentProps["params"] & ColumnWidths & ColumnStyles;
}

export const Default = ({ params, rendering, page }: ColumnSplitterProps): JSX.Element => {
  const { EnabledPlaceholders, RenderingIdentifier: id, styles } = params;

  const enabledColumns = EnabledPlaceholders?.split(",") ?? [];

  const isFirstColumn = (index: number) => index === 0;
  const isLastColumn = (index: number) => index === enabledColumns.length - 1;

  return (
    <div className={`component column-splitter ${styles}`} id={id}>
      {enabledColumns.map((columnNum, index) => {
        const num = Number(columnNum) as ColumnNumber;
        const columnWidth = params[`ColumnWidth${num}`] ?? "";
        const columnStyle = params[`Styles${num}`] ?? "";
        const columnClassNames = `${columnWidth} ${columnStyle}`.trim();

        return (
          <div
            key={index}
            className={`${columnClassNames} ${
              isFirstColumn(index) ? "column-splitter-left" : ""
            } ${isLastColumn(index) ? "column-splitter-right" : ""}`}
          >
            <div className="flex flex-col gap-2 h-full">
              <AppPlaceholder
                name={`column-${columnNum}-{*}`}
                rendering={rendering}
                page={page}
                componentMap={componentMap}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
