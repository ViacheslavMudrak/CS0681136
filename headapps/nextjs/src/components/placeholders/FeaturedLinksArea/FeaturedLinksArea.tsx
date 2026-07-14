import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const FeaturedLinksArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="featured-links-area" rendering={props.rendering} />
    </>
  );
};

export default FeaturedLinksArea;
