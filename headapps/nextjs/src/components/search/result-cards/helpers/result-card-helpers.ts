import { ContentEntityModel } from '../../models/content-entity';

export const getFirstSiteAreaTag = (article: ContentEntityModel): string | null => {
  if (
    article.site_area_tags &&
    Array.isArray(article.site_area_tags) &&
    article.site_area_tags.length > 0
  ) {
    const firstTag = article.site_area_tags[0];
    return firstTag;
  }

  return null;
};
