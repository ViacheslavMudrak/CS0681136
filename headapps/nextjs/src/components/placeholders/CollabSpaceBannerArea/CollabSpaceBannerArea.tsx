import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const CollabSpaceBannerArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="collab-space-banner-area" rendering={props.rendering} />
    </>
  );
};

export default CollabSpaceBannerArea;
