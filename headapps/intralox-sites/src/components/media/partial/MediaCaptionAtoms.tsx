import type { JSX } from 'react';

import type { Field, TextField } from '@sitecore-content-sdk/nextjs';
import { Text } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

export interface MediaCaptionTextProps {
  field: Field<string> | TextField;
  hasDarkBackground: boolean;
  region?: 'aside' | 'default';
  /** When true, forces muted ink (non-dark branch only). */
  forceMuted?: boolean;
}

/**
 * Video/image caption line — single typography `cn()` reused across inline, modal, and editing branches.
 */
export function MediaCaptionText({
  field,
  hasDarkBackground,
  region = 'default',
  forceMuted = false,
}: MediaCaptionTextProps): JSX.Element {
  return (
    <Text
      field={field}
      tag="p"
      className={cn(
        'box-border m-0 mt-2 block w-full max-w-full text-left font-normal not-italic text-font-media-tile-eyebrow leading-[19.25px] font-media-tile [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]',
        hasDarkBackground ? 'text-ink-inverse' : forceMuted ? 'text-ink-muted' : 'text-ink-muted',
        'border-0',
        region === 'aside'
          ? 'border-l-4 border-solid border-stroke-default px-2 py-0'
          : 'p-0',
      )}
    />
  );
}
