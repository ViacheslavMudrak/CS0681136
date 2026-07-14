import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const HighlightedContentArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="highlighted-content-area" rendering={props.rendering} />
    </>
  );
};

export default HighlightedContentArea;
