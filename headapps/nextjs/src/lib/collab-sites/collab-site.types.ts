import type { ImageField } from '@sitecore-content-sdk/nextjs';

// ---------------------------------------------------------------------------
// GraphQL query response shapes
// ---------------------------------------------------------------------------

export type VisibleByTarget = {
  email: { value: string };
};

export type CollabSitePageResult = {
  url: { path: string };
  collabSiteName: { value: string };
  collabSiteDescription: { value: string };
  collabSpaceThumbnail: { jsonValue: ImageField };
  isHiddenCollabSite: { value: string };
  collabSpaceCreationDate: { value: string };
  joinRequestEmails: { value: string } | null;
  visibleBy: {
    targetItems: VisibleByTarget[];
  } | null;
};

export type CollabSiteSearchQueryData = {
  collabSites: {
    total: number;
    pageInfo: {
      endCursor: string;
      hasNext: boolean;
    };
    results: CollabSitePageResult[];
  };
};

// ---------------------------------------------------------------------------
// Normalized collab site card model (client-side)
// ---------------------------------------------------------------------------

export type CollabSiteCard = {
  id: string;
  url: string;
  name: string;
  description: string;
  thumbnailImage: ImageField | null;
  groupEmails: string[];
  isHidden: boolean;
  creationDate: string;
  joinRequestEmails: string[];
};

// ---------------------------------------------------------------------------
// Join request status
// ---------------------------------------------------------------------------

export type JoinRequestStatus = 'none' | 'pending';

/** Explore collab site card enriched with join request state */
export type ExploreCollabSiteCard = CollabSiteCard & {
  joinRequestStatus: JoinRequestStatus;
};

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

export type CollabSiteSortOption = 'newest' | 'oldest' | 'alphabetical';

// ---------------------------------------------------------------------------
// API response shapes
// ---------------------------------------------------------------------------

export type CollabSitesListResponse = {
  myCollabSites: CollabSiteCard[];
  exploreCollabSites: ExploreCollabSiteCard[];
};

export type LeaveGroupRequest = {
  groupEmails: string[];
};

export type LeaveGroupResponse = {
  success: boolean;
  removedFrom?: string[];
  error?: string;
  isOwner?: boolean;
};

// ---------------------------------------------------------------------------
// Request-to-join API shapes
// ---------------------------------------------------------------------------

export type RequestToJoinRequest = {
  collabSiteId: string;
};

export type RequestToJoinResponse = {
  success: boolean;
  error?: string;
};
