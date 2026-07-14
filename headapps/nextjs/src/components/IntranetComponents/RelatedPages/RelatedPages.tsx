import { JSX } from 'react';
import {
  Link,
  Text,
  withDatasourceCheck,
  GetComponentServerProps,
  ComponentRendering,
  LayoutServiceData,
  Item,
} from '@sitecore-content-sdk/nextjs';
import classNames from 'classnames/bind';
import { createGraphQLClientFactory } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

import compose from 'lib/enhancers/compose';
import withStyles from 'lib/enhancers/withStyles';
import {
  RelatedPagesProps,
  QueryData,
  RelatedPagesStatics,
  DisplayPageItem,
} from './RelatedPages.types';
import { RelatedPagesSearch_GQL } from './RelatedPagesSearch.graphql';
import { buildOrPredicateString } from 'src/util/graphql/helpers/buildGraphqlOrPredicateString';
import { ContextSiteHomeInfo_GQL } from 'src/util/graphql/queries/getContextSiteInfo.graphql';
import { ContextSiteHome_GraphQL } from 'src/models/graphql/site-home';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { useI18n } from 'next-localization';

// CSS module styles
import styles from './RelatedPages.module.scss';
import { withJumplink } from 'lib/enhancers/withJumplink';

const cx = classNames.bind(styles);

const RelatedPages = (props: RelatedPagesProps): JSX.Element => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const { t } = useI18n();
  const isPageEditing = page.mode.isEditing;

  const hasHeadline = !!fields.headLine?.value;

  // Determine which data source to use: manual cards or search results
  let pagesToDisplay: DisplayPageItem[] = [];

  // Priority 1: Use manually selected relatedPages if available
  if (fields.relatedPages && fields.relatedPages.length > 0) {
    const limitedrelatedPages = fields.relatedPages.slice(0, 4); // Limit to 4
    pagesToDisplay = limitedrelatedPages.map((card) => ({
      id: card.id || '',
      url: card.url || '',
      eyebrow: card.fields.eyebrow,
      title: card.fields.title,
      pageIntroduction: card.fields.pageIntroduction,
    }));
  }
  // Priority 2: Use tag-based search results (prioritize by tag matches, then randomize)
  else if (props.search?.results && props.search.results.length > 0) {
    const selectedTags = fields.pageTags || [];
    const selectedTagIds = selectedTags.map((tag) => tag.id).filter((id): id is string => !!id);

    // Count how many tags each result matches across the two V2 tag fields
    const resultsWithMatchCount = props.search.results.map((result) => {
      const topicTagIds = result.topicTags?.targetItems?.map((tag) => tag.id) || [];
      const areaTagIds = result.areaTags?.targetItems?.map((tag) => tag.id) || [];
      const allResultTagIds = [...topicTagIds, ...areaTagIds];

      const matchCount = selectedTagIds.filter((id) => allResultTagIds.includes(id)).length;
      return { result, matchCount };
    });

    // Sort by match count (descending)
    resultsWithMatchCount.sort((a, b) => b.matchCount - a.matchCount);

    // Group by match count
    const grouped = resultsWithMatchCount.reduce(
      (acc, item) => {
        if (!acc[item.matchCount]) acc[item.matchCount] = [];
        acc[item.matchCount].push(item.result);
        return acc;
      },
      {} as Record<number, typeof props.search.results>
    );

    // Randomize within each group using seeded random
    const seed = props.search.results.reduce((acc, r) => acc + r.id.charCodeAt(0), 0);
    const seededRandom = (function (s) {
      return function () {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
      };
    })(seed);

    const shuffledResults: typeof props.search.results = [];
    Object.keys(grouped)
      .sort((a, b) => Number(b) - Number(a)) // Sort groups by match count descending
      .forEach((matchCount) => {
        const group = [...grouped[Number(matchCount)]];
        // Shuffle within group
        for (let i = group.length - 1; i > 0; i--) {
          const j = Math.floor(seededRandom() * (i + 1));
          [group[i], group[j]] = [group[j], group[i]];
        }
        shuffledResults.push(...group);
      });

    const randomFour = shuffledResults.slice(0, 4);

    pagesToDisplay = randomFour.map((result) => ({
      id: result.id,
      url: result.url.path,
      eyebrow: result.eyebrow,
      title: result.title || { value: result.name }, // Use title field or fallback to name
      pageIntroduction: result.pageIntroduction,
    }));
  }

  const cardCount = pagesToDisplay.length;

  // Show authoring note in editing mode when no pages to display
  const authoringNote =
    t('RelatedPagesEditModeMessageNoPagesFound') || RelatedPagesStatics.editingEmptyNote;
  const learnMoreText = t('RelatedPagesLearnMoreLinkText') || RelatedPagesStatics.learnMoreText;

  if (cardCount === 0 && !hasHeadline) {
    if (isPageEditing) {
      return (
        <section
          className={cx('related-pages', 'container component', props.stylesSXA)}
          id={rendering.params?.RenderingIdentifier}
        >
          <p className="text-sm italic text-gray-600">{authoringNote}</p>
        </section>
      );
    }
    return <></>;
  }

  return (
    <div
      className={cx(
        'related-pages',
        'container component flex flex-col gap-8 md:gap-6',
        props.stylesSXA
      )}
    >
      <Text
        field={fields.headLine}
        tag="h2"
        editable={true}
        className={cx('related-pages__headline')}
      />

      {/* Container for the cards */}
      <div className={cx('flex flex-col md:flex-row gap-8 md:gap-6 w-full')}>
        {pagesToDisplay.map((page, index) => {
          const description = page.pageIntroduction;

          return (
            <div
              key={page.id || index}
              className={cx(
                'related-pages__card',
                'bg-brand-blue-bglight rounded-3xl flex flex-col flex-[1_1_25%]',
                {
                  'one-card': cardCount === 1,
                  'two-cards': cardCount === 2,
                  'three-cards': cardCount === 3,
                  'four-cards': cardCount === 4,
                }
              )}
            >
              <div className="flex flex-col h-full">
                {page.eyebrow && (
                  <Text
                    tag="span"
                    className="eyebrow text-eyebrow eyebrow-font-size"
                    field={page.eyebrow}
                  />
                )}
                <Text
                  field={page.title}
                  tag="h2"
                  editable={true}
                  className={cx('related-pages__card-title')}
                />
                {description && <Text field={description} tag="p" />}
              </div>
              <Link
                className={cx('asc-btn asc-btn--primary w-fit')}
                field={{ value: { href: page.url, text: learnMoreText } }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const getComponentServerProps: GetComponentServerProps = async (
  rendering: ComponentRendering,
  layoutData: LayoutServiceData
) => {
  // If cards are manually selected, skip search
  const relatedPages = rendering.fields?.relatedPages as Item[];
  if (relatedPages && relatedPages.length > 0) {
    return { search: { results: [] } };
  }

  // If no pageTags, return empty results
  const pageTags = rendering.fields?.pageTags as Item[];
  if (!pageTags || pageTags.length === 0) {
    return { search: { results: [] } };
  }

  const graphQLClientFactory = createGraphQLClientFactory({ api: scConfig.api });
  const graphQLClient = graphQLClientFactory();

  const contextSiteName = layoutData.sitecore.context.site?.name || '';
  const contextSiteLanguage = layoutData.sitecore.context.language || 'en';

  // Get site home item ID
  let queryForSiteHome = ContextSiteHomeInfo_GQL;
  queryForSiteHome = queryForSiteHome.replace('__SiteName__', contextSiteName);
  queryForSiteHome = queryForSiteHome.replace('__Language__', contextSiteLanguage);
  const siteHomeResponse = await graphQLClient.request<ContextSiteHome_GraphQL>(queryForSiteHome);
  const siteHomeItemId = siteHomeResponse?.layout?.item?.homeItemId || '';

  // Build predicates for the two V2 tag fields
  const topicTagsPredicate = buildOrPredicateString(pageTags, 'topicTags');
  const areaTagsPredicate = buildOrPredicateString(pageTags, 'areaTags');

  // Combine predicates with OR logic
  const tagPredicate = `${topicTagsPredicate},${areaTagsPredicate}`;

  // Build and execute search query
  let query = RelatedPagesSearch_GQL;
  query = query.replace('__TAG_PREDICATES__', tagPredicate);
  query = query.replace('__ANCESTOR_ID__', siteHomeItemId);
  query = query.replace('__LANGUAGE__', contextSiteLanguage);

  const response = await graphQLClient.request<QueryData>(query);

  return response;
};

export const Default = compose<RelatedPagesProps>(
  withDatasourceCheck(),
  withStyles(),
  withJumplink()
)(RelatedPages);

export default Default;
