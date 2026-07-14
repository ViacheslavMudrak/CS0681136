import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const RelatedContentArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="related-content-area" rendering={props.rendering} />
    </>
  );
};

export default RelatedContentArea;
