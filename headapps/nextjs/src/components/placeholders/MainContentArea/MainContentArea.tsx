import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const MainContentArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="main-content-area" rendering={props.rendering} />
    </>
  );
};

export default MainContentArea;
