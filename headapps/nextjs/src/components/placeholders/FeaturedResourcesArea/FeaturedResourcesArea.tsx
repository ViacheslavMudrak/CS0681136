import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const FeaturedResourcesArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="featured-resources-area" rendering={props.rendering} />
    </>
  );
};

export default FeaturedResourcesArea;
