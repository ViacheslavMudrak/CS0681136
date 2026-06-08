import { JSX } from "react";

import {
  RichText,
  Text,
  type Field,
  type TextField,
} from "@sitecore-content-sdk/nextjs";

import {
  hasPlainTextVisitorValue,
  hasRichTextVisitorValue,
} from "../quickLinkGroupUtils";
import { cn } from 'lib/utils';

export interface QuickLinkGroupAsideProps {
  Headline?: TextField;
  Description?: Field<string>;
  isEditing: boolean;
}

export const QUICK_LINK_GROUP_ASIDE_TEST_ID = "quick-link-group-aside";

/**
 * Renders aside section title (`Text` / h2) and body (`RichText`) for Quick Link Group when used as sidebar copy.
 * Parent supplies the `<aside>` landmark and `aria-label`. Empty fields are omitted for visitors; in edit mode,
 * SDK fields render so authors can use XM Cloud Pages inline editing.
 *
 * @param Headline - Single-line text field for the section title.
 * @param Description - RTE field for body copy (may include links).
 * @param isEditing - XM Cloud Pages edit mode from `page.mode.isEditing`.
 * @returns Inner stack (`div`) with optional title and RTE body.
 */

export function QuickLinkGroupAside({
  Headline,
  Description,
  isEditing,
}: QuickLinkGroupAsideProps): JSX.Element {
  const showTitle =
    hasPlainTextVisitorValue(Headline?.value as string | undefined) || isEditing;
  const showBody =
    hasRichTextVisitorValue(Description?.value as string | undefined) || isEditing;

  const headlineField = Headline ?? ({ value: "" } as TextField);
  const descriptionField = Description ?? ({ value: "" } as Field<string>);

  return (
    <div
      className="font-media-tile w-full min-w-0 max-w-full text-left"
      data-testid={QUICK_LINK_GROUP_ASIDE_TEST_ID}
    >
      {showTitle ? (
        <Text
          field={headlineField}
          tag="h2"
          className="box-border block !m-0 !border-0 !p-0 font-media-tile text-font-big font-bold leading-font-media-tile-headline uppercase text-ink-tertiary [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent]"
        />
      ) : null}
      {showBody ? (
        <div
          className={cn(
            'box-border m-0 block w-full min-w-0 h-auto min-h-[57.75px] text-left [&_p]:text-left [&_div]:text-left [&_ul]:text-left [&_ol]:text-left text-font-media-tile-eyebrow font-normal leading-[19.25px] text-ink-primary font-media-tile [unicode-bidi:isolate] [-webkit-tap-highlight-color:transparent] [&_p]:m-0 [&_p]:text-inherit [&_p]:leading-[19.25px] [&_p+_p]:mt-3 min-[481px]:max-[599px]:[&_p+_p]:mt-[10px] [&_a]:text-link [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-[color,text-decoration-color,text-decoration-line] [&_a]:duration-150 [&_a]:ease-in-out motion-reduce:[&_a]:transition-none hover:[&_a]:text-link-strong hover:[&_a]:no-underline [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-link [&_a]:focus-visible:ring-offset-2 [&_a]:focus-visible:ring-offset-surface',
            showTitle && 'mt-2',
          )}
        >
          <RichText field={descriptionField} />
        </div>
      ) : null}
    </div>
  );
}
