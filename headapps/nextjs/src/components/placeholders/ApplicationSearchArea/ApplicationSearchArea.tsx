import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const ApplicationSearchArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="application-search-area" rendering={props.rendering} />
    </>
  );
};

export default ApplicationSearchArea;
