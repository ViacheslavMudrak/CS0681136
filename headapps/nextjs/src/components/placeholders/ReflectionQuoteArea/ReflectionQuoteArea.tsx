import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const ReflectionQuoteArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="reflection-quote-area" rendering={props.rendering} />
    </>
  );
};

export default ReflectionQuoteArea;
