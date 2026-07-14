import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const CollabSiteHeroArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="collab-site-hero-area" rendering={props.rendering} />
    </>
  );
};

export default CollabSiteHeroArea;
