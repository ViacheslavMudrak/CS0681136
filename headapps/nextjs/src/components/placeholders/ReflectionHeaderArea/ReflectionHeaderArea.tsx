import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const ReflectionHeaderArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="reflection-header-area" rendering={props.rendering} />
    </>
  );
};

export default ReflectionHeaderArea;
