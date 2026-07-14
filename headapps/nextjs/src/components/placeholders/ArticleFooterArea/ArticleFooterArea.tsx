import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const ArticleFooterArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="article-footer-area" rendering={props.rendering} />
    </>
  );
};

export default ArticleFooterArea;
