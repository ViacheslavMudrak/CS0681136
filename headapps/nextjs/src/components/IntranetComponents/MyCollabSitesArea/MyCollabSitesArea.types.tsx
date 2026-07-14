import type { Field } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from 'lib/component-props';
import { IconItem } from 'ts/custom-link';

export type {
  CollabSiteCard,
  CollabSiteSortOption,
  CollabSitesListResponse,
  ExploreCollabSiteCard,
  JoinRequestStatus,
  LeaveGroupRequest,
  LeaveGroupResponse,
  RequestToJoinRequest,
  RequestToJoinResponse,
} from 'lib/collab-sites/collab-site.types';

// ---------------------------------------------------------------------------
// Datasource fields (authored in Sitecore)
// ---------------------------------------------------------------------------

type MyCollabSitesAreaFields = {
  pageHeaderTitle: Field<string>;
  pageHeaderIcon: IconItem;
  tabLabelMyCollabSites: Field<string>;
  tabLabelExploreCollabSites: Field<string>;
  emptyStateHeadline: Field<string>;
  emptyStateSubheading: Field<string>;
  emptyStateDescription: Field<string>;
  emptyStateCTAButtonText: Field<string>;
  requestToJoinSuccessMessage: Field<string>;
  requestToJoinFailureMessage: Field<string>;
};

type MyCollabSitesAreaParams = {
  CardsPerPage: string;
  DynamicPlaceholderId: string;
  FieldNames: string;
};

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export type MyCollabSitesAreaProps = ComponentProps & {
  fields: MyCollabSitesAreaFields;
  params: MyCollabSitesAreaParams;
};
