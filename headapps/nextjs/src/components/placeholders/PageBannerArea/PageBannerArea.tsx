import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const PageBannerArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="page-banner-area" rendering={props.rendering} />
    </>
  );
};

export default PageBannerArea;
