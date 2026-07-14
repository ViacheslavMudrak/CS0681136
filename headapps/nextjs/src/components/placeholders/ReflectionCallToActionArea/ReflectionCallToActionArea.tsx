import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const ReflectionCallToActionArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="reflection-call-to-action-area" rendering={props.rendering} />
    </>
  );
};

export default ReflectionCallToActionArea;
