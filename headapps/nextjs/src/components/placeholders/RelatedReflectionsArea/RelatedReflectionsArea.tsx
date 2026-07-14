import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const RelatedReflectionsArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="related-reflections-area" rendering={props.rendering} />
    </>
  );
};

export default RelatedReflectionsArea;
