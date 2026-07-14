import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const FeaturedMarketNewsArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="featured-market-news-area" rendering={props.rendering} />
    </>
  );
};

export default FeaturedMarketNewsArea;
