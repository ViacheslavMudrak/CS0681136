import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { PlaceholderProps } from 'lib/placeholder-props';

const ArticleContentArea = (props: PlaceholderProps): JSX.Element => {
  return (
    <>
      <Placeholder name="article-content-area" rendering={props.rendering} />
    </>
  );
};

export default ArticleContentArea;
