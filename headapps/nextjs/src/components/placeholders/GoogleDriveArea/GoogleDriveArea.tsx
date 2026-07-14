import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const GoogleDriveArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="google-drive-area" rendering={props.rendering} />
    </>
  );
};

export default GoogleDriveArea;
