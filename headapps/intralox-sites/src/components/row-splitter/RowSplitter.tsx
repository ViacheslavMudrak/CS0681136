import React, { JSX } from 'react';
import { ComponentRendering } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from 'lib/utils';
import componentMap from '.sitecore/component-map';
import { AppPlaceholder } from "@sitecore-content-sdk/nextjs";

import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";

/**
 * The number of rows that can be inserted into the row splitter component.
 * The maximum number of rows is 8.
 */
type RowNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * The styles specified for each rendered row.
 * The key is the row number, and the value is the styles.
 */
type RowStyles = {
  [K in `Styles${RowNumber}`]?: string;
};

interface RowSplitterProps extends ComponentProps {
  rendering: ComponentRendering;
  params: ComponentProps["params"] & RowStyles;
}

export const Default = ({
  params,
  rendering,
  page,
}: RowSplitterProps): JSX.Element => {
  const enabledPlaceholders = params.EnabledPlaceholders?.split(",") ?? [];

  return (
    <div
      className={cn('component row-splitter', params.styles)}
      {...renderingAnchorIdProps(params.RenderingIdentifier)}
    >
      {enabledPlaceholders.map((ph, index) => {
        const num = Number(ph) as RowNumber;
        const placeholderKey = `row-${num}-{*}`;
        const rowStyles = `${params[`Styles${num}`] ?? ""}`.trimEnd();

        return (
          <div key={index} className={cn('container-fluid', rowStyles)}>
            <div>
              <div className="row">
                <AppPlaceholder
                  name={placeholderKey}
                  rendering={rendering}
                  page={page}
                  componentMap={componentMap}
                  disableSuspense
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
