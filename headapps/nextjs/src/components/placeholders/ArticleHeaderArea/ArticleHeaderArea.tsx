import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const ArticleHeaderArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="article-header-area" rendering={props.rendering} />
    </>
  );
};

export default ArticleHeaderArea;
