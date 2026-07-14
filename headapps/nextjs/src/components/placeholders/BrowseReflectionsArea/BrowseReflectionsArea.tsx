import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const BrowseReflectionsArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="browse-reflections-area" rendering={props.rendering} />
    </>
  );
};

export default BrowseReflectionsArea;
