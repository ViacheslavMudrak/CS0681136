import { ReflectionsTag } from 'components/IntranetComponents/RelatedReflections/RelatedReflections.types';
import type { GatedListingItem } from 'lib/auth/visibility-filter';

export type ReflectionDetailPage_GraphQL = {
  id: string;
  url: { path: string };
  title: { value: string };
  quote: { value: string };
  publishDate: { value: string };
  author: { value: string };
  reflectionsTags: { targetItems: ReflectionsTag[] };
} & GatedListingItem;
