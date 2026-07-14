import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const RecognitionCardsArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="recognition-cards-area" rendering={props.rendering} />
    </>
  );
};

export default RecognitionCardsArea;
