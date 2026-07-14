import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const ApplicationsArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="applications-area" rendering={props.rendering} />
    </>
  );
};

export default ApplicationsArea;
