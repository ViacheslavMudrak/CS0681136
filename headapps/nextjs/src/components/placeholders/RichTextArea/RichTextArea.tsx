import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const RichTextArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="rich-text-area" rendering={props.rendering} />
    </>
  );
};

export default RichTextArea;
