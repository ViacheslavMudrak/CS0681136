import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const DirectoryListingArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="directory-listing-area" rendering={props.rendering} />
    </>
  );
};

export default DirectoryListingArea;
