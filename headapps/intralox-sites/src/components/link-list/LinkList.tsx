import { JSX } from 'react';
import {
  Link as ContentSdkLink,
  Text,
  type LinkField,
  type TextField,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from 'lib/utils';
import { renderingAnchorIdProps } from 'src/utils/renderingAnchorProps';

interface LinkListProps extends ComponentProps {
  fields: {
    data: {
      datasource: {
        children: {
          results: Array<{
            field: {
              link: LinkField;
            };
          }>;
        };
        field: {
          title: TextField;
        };
      };
    };
  };
}

const LinkListItem = ({
  index,
  total,
  field,
  isVertical,
}: {
  index: number;
  total: number;
  field: LinkField;
  isVertical: boolean;
}): JSX.Element => {
  return (
    <li
      className={cn(
        `item${index}`,
        index % 2 === 0 ? 'odd' : 'even',
        index === 0 && 'first',
        index === total - 1 && 'last',
        'block bg-transparent text-[13px]',
        isVertical && 'ml-5',
      )}
    >
      <div className="field-link">
        <ContentSdkLink
          className={cn(
            'inline relative pl-[10px] text-[1em] text-ink-secondary no-underline hover:border-b hover:border-solid hover:border-accent-teal hover:text-ink-subtle hover:no-underline before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:text-[10px] before:content-[\'\\f054\']',
            isVertical && 'border-none hover:border-none',
          )}
          field={field}
        />
      </div>
    </li>
  );
};

/**
 * Renders a Sitecore link list with optional vertical layout via `params.styles`.
 */
export const Default = ({ params, fields }: LinkListProps): JSX.Element => {
  const datasource = fields?.data?.datasource;
  const isVertical = (params.styles ?? '').split(/\s+/).includes('list-vertical');

  const renderContent = (): JSX.Element => {
    if (!datasource) {
      return <h3>Link List</h3>;
    }

    const results = datasource.children.results;
    const links = results
      .filter((element) => element?.field?.link)
      .map((element, index) => (
        <LinkListItem
          key={`${index}-${element.field?.link?.value?.href ?? index}`}
          index={index}
          total={results.length}
          field={element.field.link}
          isVertical={isVertical}
        />
      ));

    return (
      <>
        <Text
          tag="h3"
          field={datasource.field?.title}
          className={cn(
            'border-b border-solid border-accent-teal',
            isVertical &&
              'inline-block w-full border border-solid border-stroke-default bg-surface p-[3px_5px]',
          )}
        />
        <ul className="m-0 list-none bg-transparent p-0">{links}</ul>
      </>
    );
  };

  return (
    <div
      className={cn('component link-list bg-transparent', params.styles, isVertical && 'list-vertical')}
      {...renderingAnchorIdProps(params.RenderingIdentifier)}
    >
      <div className="component-content">{renderContent()}</div>
    </div>
  );
};
