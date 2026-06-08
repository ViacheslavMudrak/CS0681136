import { JSX } from 'react';
import { cn } from 'lib/utils';

import { Default as Navigation } from 'src/components/navigation/Navigation';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

import type { HeaderProps } from './Header.type';

/**
 * SXA Header wrapper — Sitecore delivers nav fields on this rendering (no child Navigation placeholder).
 * Forwards fields, params, and page to {@link Navigation}.
 * Root uses `!important` utilities to override global `.component` padding from `layout.scss`.
 */
export const Default = ({ fields, params, rendering, page }: HeaderProps): JSX.Element => {
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);

  if (!fields) {
    return (
      <div
        className={cn(
          'component header w-full m-0! p-0! [&>.component-content]:m-0! [&>.component-content]:p-0!',
          styles,
        )}
        {...anchorId}
      >
        <div className="component-content" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'component header w-full m-0! p-0! [&>.component-content]:m-0! [&>.component-content]:p-0!',
        styles,
      )}
      {...anchorId}
    >
      <div className="component-content">
        <Navigation
          fields={fields}
          params={params}
          rendering={rendering}
          page={page}
        />
      </div>
    </div>
  );
};
