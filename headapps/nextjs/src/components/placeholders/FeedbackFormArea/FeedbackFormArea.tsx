import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const FeedbackFormArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="feedback-form-area" rendering={props.rendering} />
    </>
  );
};

export default FeedbackFormArea;
