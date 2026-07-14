import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const LinkListingArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="link-listing-area" rendering={props.rendering} />
    </>
  );
};

export default LinkListingArea;
