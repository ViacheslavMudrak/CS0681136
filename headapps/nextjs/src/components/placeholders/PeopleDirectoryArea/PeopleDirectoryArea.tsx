import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const PeopleDirectoryArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="people-directory-area" rendering={props.rendering} />
    </>
  );
};

export default PeopleDirectoryArea;
