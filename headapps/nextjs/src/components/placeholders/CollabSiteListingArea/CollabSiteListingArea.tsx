import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const CollabSiteListingArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="collab-site-listing-area" rendering={props.rendering} />
    </>
  );
};

export default CollabSiteListingArea;
