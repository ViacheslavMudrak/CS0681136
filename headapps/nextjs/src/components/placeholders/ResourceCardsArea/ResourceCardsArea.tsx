import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const ResourceCardsArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="resource-cards-area" rendering={props.rendering} />
    </>
  );
};

export default ResourceCardsArea;
