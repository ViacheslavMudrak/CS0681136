import { JSX } from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';

import { ArticleStructureProps } from './ArticleStructure.types';

const ArticleStructure = (props: ArticleStructureProps): JSX.Element => {
  return (
    <>
      {/* Placeholder to hold allowed components (RTE, Quote) */}
      <Placeholder
        name="article-detail"
        rendering={props.rendering}
        render={(components) => <article className="article-structure">{components}</article>}
      />
    </>
  );
};

export default ArticleStructure;
