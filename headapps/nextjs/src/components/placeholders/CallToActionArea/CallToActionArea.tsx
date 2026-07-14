import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const CallToActionArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="call-to-action-area" rendering={props.rendering} />
    </>
  );
};

export default CallToActionArea;
