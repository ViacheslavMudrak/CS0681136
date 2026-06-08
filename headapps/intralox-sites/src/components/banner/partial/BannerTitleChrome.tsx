import { JSX } from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import type { TextField } from '@sitecore-content-sdk/nextjs';
import { cn } from 'lib/utils';

type BannerChromeVariant = 'overlay' | 'titleStrip';

/**
 * Title strip + scrim chrome (parity with former `banner.scss` on `dev`).
 */
export function BannerTitleChrome({
  variant,
  titleField,
}: {
  variant: BannerChromeVariant;
  titleField?: TextField;
}): JSX.Element {
  const isTitleStrip = variant === 'titleStrip';

  return (
    <div
      className={cn(
        'banner-strip flex h-[90px] w-full items-center border-0 border-solid border-stroke-default box-border m-0 p-0 isolate [-webkit-tap-highlight-color:transparent] bg-[oklab(0_0_0/0.5)] max-md:!h-auto max-md:min-h-[90px] max-md:box-border max-md:py-3',
        variant === 'overlay' &&
          'banner-strip--overlay absolute bottom-0 left-0 right-0 top-auto',
        isTitleStrip && 'md:max-lg:bg-surface lg:bg-[oklab(0_0_0/0.5)]',
      )}
    >
      <div className="banner-title-column mx-auto box-border w-full min-w-0 max-w-[1200px] px-4 min-[2100px]:!mx-[450px] md:max-xl:max-w-none md:max-xl:px-0">
        {titleField !== undefined && (
          <div className="banner-title-text-container box-border block h-[37.5px] w-full max-w-[1168px] max-md:!h-auto max-md:min-h-0 md:max-lg:mx-auto md:max-lg:max-w-[768px] md:max-lg:px-4 lg:max-xl:max-w-[992px] lg:max-xl:px-4 lg:max-xl:w-[calc(100%-32px)] lg:max-[1024px]:mx-4 min-[1025px]:max-xl:mx-auto min-[1025px]:max-xl:w-[min(992px,100%)]">
            <Text
              className={cn(
                'banner-title-text m-0 block max-w-full break-words p-0 font-media-tile font-medium! text-[30px] leading-[37.5px] text-ink-inverse',
                isTitleStrip &&
                  'md:max-lg:text-ink-primary md:max-lg:text-font-extrabig md:max-lg:leading-6 lg:max-xl:text-ink-primary lg:max-xl:text-font-extrabig lg:max-xl:leading-6',
              )}
              field={titleField}
              tag="h2"
            />
          </div>
        )}
      </div>
    </div>
  );
}
