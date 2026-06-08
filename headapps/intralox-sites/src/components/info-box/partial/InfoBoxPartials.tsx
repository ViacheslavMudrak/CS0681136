import { CheckCircle, Zap } from '@laitram-l-l-c/intralox-icon-library';
import { CHROME_ICON_BASE } from 'lib/chrome-icons';
import { JSX } from 'react';

import type { InfoBoxContextKey } from '../infoBoxUtils';
import { INFOBOX_ICON_HEIGHT_PX, INFOBOX_ICON_INFO_SCALE_X, INFOBOX_ICON_SUCCESS_SCALE_X } from '../infoBoxUtils';

/**
 * Decorative Font Awesome icon for the Info context (outline lightbulb).
 */
export function InfoBoxInfoIcon(): JSX.Element {
  const h = INFOBOX_ICON_HEIGHT_PX;
  return (
    <span
      className="box-border m-0 block h-[32px] w-[calc(18.27px+24px)] shrink-0 overflow-hidden pr-6 text-center text-ink-primary antialiased [unicode-bidi:isolate]"
      data-testid="info-box-icon-info"
    >
      {}
      <Zap
        className={`${CHROME_ICON_BASE} m-0 block p-0 text-ink-primary antialiased`}
        style={{
          width: `${h}px`,
          height: `${h}px`,
          transform: `scaleX(${INFOBOX_ICON_INFO_SCALE_X})`,
          transformOrigin: 'left center',
        }}
        aria-hidden="true"
      />
    </span>
  );
}

/**
 * Decorative Font Awesome icon for the Success context (solid circle check; live tone via `text-accent-cyan`).
 */
export function InfoBoxSuccessIcon(): JSX.Element {
  const h = INFOBOX_ICON_HEIGHT_PX;
  return (
    <span
      className="box-border m-0 block h-[32px] w-[calc(27.43px+24px)] shrink-0 overflow-hidden pr-6 text-center antialiased [unicode-bidi:isolate]"
      data-testid="info-box-icon-success"
    >
      <CheckCircle
        className={`${CHROME_ICON_BASE} m-0 block p-0 text-accent-cyan antialiased`}
        style={{
          width: `${h}px`,
          height: `${h}px`,
          transform: `scaleX(${INFOBOX_ICON_SUCCESS_SCALE_X})`,
          transformOrigin: 'left center',
        }}
        aria-hidden="true"
      />
    </span>
  );
}

interface InfoBoxIconProps {
  context: InfoBoxContextKey;
}

/**
 * Renders the context-appropriate decorative icon, or nothing when not applicable.
 *
 * @param context - Resolved Info / Success / None
 */
export function InfoBoxIcon({ context }: InfoBoxIconProps): JSX.Element | null {
  if (context === 'info') {
    return <InfoBoxInfoIcon />;
  }
  if (context === 'success') {
    return <InfoBoxSuccessIcon />;
  }
  return null;
}
