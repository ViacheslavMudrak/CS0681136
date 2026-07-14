import { ComponentProps } from 'lib/component-props';
import { UserNewsFeed_GraphQL } from 'src/models/graphql/user-news-feed';
import { TagItem } from 'ts/common-sitecore-field-types';

import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

type UserNewsFeedFields = {
  newsFeedTitle: Field<string>;
  newsFeedSubtitle: Field<string>;
  seeAllLinkText: Field<string>;
  modalTitle: Field<string>;
  modalInstructions: Field<string>;
  tagsHeadingText: Field<string>;
  newsLookupRange: Field<number>;
  accountPageLInk: LinkField;
  globalTags: TagItem[];
  systemNewsTags: TagItem[];
};

export type UserNewsFeedProps = ComponentProps & {
  fields: UserNewsFeedFields;
};

export type QueryData = {
  userfeed: {
    results: UserNewsFeed_GraphQL[];
  };
};

export const UserNewsFeedStatics = {
  editingEmptyNote:
    'News feed is based on current user preferences. In editing mode, no news articles will be displayed.',
  UserNewsFeedSelectedTagsTitle: 'Selected',
  UserNewsFeedTagsTitle: 'Topics',
  UserNewsFeedSaveChangesText: 'Save Changes',
  UserNewsFeedSavingChangesText: 'Saving...',
  UserNewsFeedCancelText: 'Cancel',
};
