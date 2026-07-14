import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const FeaturedContentArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="featured-content-area" rendering={props.rendering} />
    </>
  );
};

export default FeaturedContentArea;
