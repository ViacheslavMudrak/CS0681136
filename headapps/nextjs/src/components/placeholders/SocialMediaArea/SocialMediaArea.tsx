import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const SocialMediaArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="social-media-area" rendering={props.rendering} />
    </>
  );
};

export default SocialMediaArea;
