'use client';

import type { JSX } from 'react';

import type { IVideoFields } from '../../../utils/interface';
import { MediaTileVideo } from '../../media-tile/partial/MediaTileVideo';

/** Aside video inner frame: 16∶9. */
export interface TextAsideVideoBlockProps {
  video: IVideoFields;
}

export const TextAsideVideoBlock = ({ video }: TextAsideVideoBlockProps): JSX.Element | null => {
  return (
    <MediaTileVideo
      video={video}
      mediaFrameStyle={{ aspectRatio: '16 / 9' }}
      outerWrapperClassName="box-border w-full max-w-full"
    />
  );
};
