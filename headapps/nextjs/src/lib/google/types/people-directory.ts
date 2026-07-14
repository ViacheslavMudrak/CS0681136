/** Person data returned from Google Admin Directory for the People Directory component */
export interface DirectoryPerson {
  id: string;
  primaryEmail: string;
  name: {
    givenName?: string;
    familyName?: string;
    fullName?: string;
  };
  thumbnailPhotoUrl?: string;
  /** From organizations[0].title */
  jobTitle?: string;
  /** From organizations[0].department */
  department?: string;
  phone?: string;
  location?: string;
  orgUnitPath?: string;
  /** Custom schema fields from User_Info */
  businessUnit?: string;
  employeeClass?: string;
  employeeNumber?: string;
  isManager?: string;
  managerLevel?: string;
  workLocationCode?: string;
}

/**
 * Response shape from `/api/google/admin/directory/users/list`.
 * `users` is the current page slice (server-paginated); `totalCount` is the
 * unfiltered total for the company code, and `filteredCount` reflects how
 * many users matched the active search/filter set before pagination.
 */
export interface PeopleDirectoryListResponse {
  users: DirectoryPerson[];
  totalCount: number;
  filteredCount: number;
  locations: string[];
  departments: string[];
  page: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Internal cache shape stored in Redis under `people-directory:users:{code}`.
 * The full unfiltered user list is cached together with derived locations and
 * a `refreshedAt` timestamp used to drive stale-while-revalidate refreshes.
 */
export interface PeopleDirectoryCacheEntry {
  users: DirectoryPerson[];
  totalCount: number;
  refreshedAt: number;
}
