/**
 * User profile API and context types.
 * API types match response shapes: leads-only, parentContact with childContacts, multiple parents.
 */

// ----- API response types -----

export interface UserProfileAccountRep {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
}

export interface UserProfileAccountManager {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
}

export interface UserProfileServiceTech {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
}

export interface UserProfileAccount {
  id: string;
  ebsAccountId?: string;
  ebsPartyNumber?: string;
  groupCode?: string;
  partyName?: string;
  partyCity?: string;
  displayName?: string;
  partyAddressStreet1?: string;
  partyAddressStreet2?: string;
  accountRep?: UserProfileAccountRep;
  accountManager?: UserProfileAccountManager;
  serviceTech?: UserProfileServiceTech;
  partyIsoCountryCode?: string;
  partyIsoCountry?: string;
  /** Account-specific technical/support email when returned by the profile API. */
  supportEmail?: string;
  hotlineNumber?: string;
}

export interface UserProfileChildContact {
  id: string;
  firstName?: string;
  lastName?: string;
  jobRole?: string;
  industryTeam?: string;
  account: UserProfileAccount;
  isDefault?: boolean;
}

export interface UserProfileParentContact {
  id: string;
  firstName?: string;
  lastName?: string;
  childContacts?: UserProfileChildContact[];
}

export interface UserProfileLead {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  leadSource?: string;
  jobRole?: string;
  industryTeam?: string;
}

/** User preference from profile API; defaultAccount is the account id. */
export interface UserProfilePreference {
  userEmail?: string;
  defaultLanguage?: string;
  defaultAccount?: string;
  userPreference?: 0 | 1;
}

export interface UserProfileResponse {
  customerSupportEmail?: string;
  isMultipleParent: boolean;
  isDomainRestricted: boolean;
  parentContact: UserProfileParentContact[];
  leads: UserProfileLead[];
  userPreference?: UserProfilePreference;
}

// ----- Derived / context payload types -----

/**
 * Single account shape for profile context, menus, nav, and modals.
 * `id` is always the account id from the API.
 */
export interface ProfileAccount {
  id: string;
  companyName: string;
  address: string;
  accountNumber: string;
  isActive: boolean;
  accountRep?: UserProfileAccountRep;
  accountRepEmail?: string;
  /** Preferred support mailto target for Related Documents; falls back to CMS when absent. */
  supportEmail?: string;
  role: string;
  organization: string;
  hotlineNumber?: string;
}


/** User display info for ViewMyProfile */
export interface UserProfileDisplay {
  fullName: string;
  email: string;
  isVerified: boolean;
}

export interface SetProfileData {
  profile: UserProfileResponse | null;
  loading: boolean;
  error: Error | null;
}
