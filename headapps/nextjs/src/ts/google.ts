export interface GoogleProfileData {
  id: string;
  primaryEmail?: string;
  name?: {
    displayName?: string;
    givenName?: string;
    familyName?: string;
  };
  suspended?: boolean;
  archived?: boolean;
  isAdmin?: boolean;
  isDelegatedAdmin?: boolean;
  isGuestUser?: boolean;
  creationTime?: string;
  lastLoginTime?: string;
  orgUnitPath?: string;
  emailAddresses?: Array<{
    value: string;
    type?: string;
  }>;
  phoneNumbers?: Array<{
    value: string;
    type?: string;
  }>;
  photos?: Array<{
    url: string;
  }>;
  organizations?: Array<{
    name?: string;
    title?: string;
    department?: string;
    location?: string;
  }>;
  relations?: Array<{
    value?: string;
    type?: string;
  }>;
  addresses?: Array<{
    formattedValue?: string;
    type?: string;
    region?: string;
  }>;
  languages?: Array<{
    languageCode?: string;
    preference?: string;
  }>;
  locations?: Array<{
    type?: string;
    area?: string;
    buildingId?: string;
    floorName?: string;
    floorSection?: string;
    deskCode?: string;
  }>;
  /**
   * Raw custom schema data from Google Workspace.
   * Do not read from this directly in application code — use `userInfo` instead.
   * This is retained to surface any new or unrecognized schema fields added to
   * the Workspace admin configuration, so they can be discovered and mapped.
   */
  customSchemas?: Record<string, Record<string, unknown> | undefined>;
  userInfo?: {
    companyCode: string;
    businessUnit: number;
    businessUnitDescription: string;
    employeeClass: string;
    employeeNumber: string;
    isManager: string;
    managerLevel: number;
    workLocationCode: string;
    city: string;
    state: string;
  };
}

export interface GoogleErrorResponse {
  error: string;
  /**
   * When true, the client should redirect to /auth/signin?error=Callback to
   * trigger the consent retry flow. Set when the user's session cannot be
   * refreshed (expired access token with no refresh token, or Google rejected
   * the token outright).
   */
  requiresReauth?: boolean;
}

export interface GoogleGroupData {
  id: string;
  email: string;
  name: string;
  description?: string;
}

/** A single node in the org structure tree */
export interface OrgTreeNode {
  email: string;
  name?: {
    displayName?: string;
    givenName?: string;
    familyName?: string;
  };
  title?: string;
  department?: string;
  photoUrl?: string;
  userInfo?: GoogleProfileData['userInfo'];
  directReports: OrgTreeNode[];
}

/** API response for the org-structure endpoint */
export interface OrgTreeResponse {
  tree: OrgTreeNode;
  totalNodes: number;
  highlightEmail?: string;
}
