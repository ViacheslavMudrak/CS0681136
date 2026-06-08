import componentMap from '.sitecore/component-map';
import { AppPlaceholder } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from 'lib/utils';
import { JSX } from 'react';

import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

function LeftPanel({ children }: any) {
  return (
    <div className='sticky top-0 lg:min-h-screen min-h-[100%] lg:h-screen overflow-visible p-4'>
      {children}
    </div>
  );
}

function RightPanel({ children }: any) {
  return (
    <div
      className='
        flex flex-col
        lg:justify-center
        lg:min-h-screen
        p-4
        md:py-[150px]
        py-[150px]
        lg:py-0
      '
    >
      <div
        className='
          w-full
          lg:mt-[150px]
        '
      >
        {children}
      </div>
    </div>
  );
}

/**
 * The number of columns that can be inserted into the column splitter component.
 * The maximum number of columns is 8.
 */
type ColumnNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * The width specified for each rendered column.
 * The key is the column number, and the value is the width.
 */
type ColumnWidths = {
  [K in ColumnNumber as `ColumnWidth${K}`]?: string;
};

/**
 * The styles specified for each rendered column.
 * The key is the column number, and the value is the styles.
 */
type ColumnStyles = {
  [K in ColumnNumber as `Styles${K}`]?: string;
};

interface ColumnSplitterProps extends ComponentProps {
  params: ComponentProps["params"] & ColumnWidths & ColumnStyles;
}

export const Default = ({
  params,
  rendering,
  page
}: ColumnSplitterProps): JSX.Element => {
  const { EnabledPlaceholders, styles } = params;

  const enabledColumns = EnabledPlaceholders?.split(",") ?? [];

  return (
    <div
      className={cn(
        'row component column-splitter mx-0 max-w-none px-[2.5px]',
        styles,
      )}
      {...renderingAnchorIdProps(params.RenderingIdentifier)}
    >
      {enabledColumns.map((columnNum, index) => {
        const num = Number(columnNum) as ColumnNumber;
        const columnWidth = params[`ColumnWidth${num}`] ?? '';
        const columnStyle = params[`Styles${num}`] ?? '';

        const isLeft = index === 0;
        const isRight = index === 1;

        return (
          <div
            key={index}
            className={cn(
              'px-[5px]',
              columnWidth,
              columnStyle,
              'w-full lg:w-1/2',
              isRight && 'lg:flex lg:justify-center',
            )}
          >
            {isLeft ? (
              <LeftPanel>
                <AppPlaceholder
                  name={`column-${columnNum}-{*}`}
                  rendering={rendering}
                  page={page}
                  componentMap={componentMap}
                  disableSuspense
                />
              </LeftPanel>
            ) : (
              <RightPanel>
                <AppPlaceholder
                  name={`column-${columnNum}-{*}`}
                  rendering={rendering}
                  page={page}
                  componentMap={componentMap}
                  disableSuspense
                />
              </RightPanel>
            )}
          </div>
        );
      })}
    </div>
  );
};
