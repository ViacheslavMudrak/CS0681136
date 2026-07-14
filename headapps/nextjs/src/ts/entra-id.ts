export interface EntraIdProfile {
  employeeId?: string;
  department?: string;
  companyName?: string;
  roles?: string[];
  jobTitle?: string;

  extensionAttribute10?: string;
  extensionAttribute11?: string;
  extensionAttribute12?: string;
  extensionAttribute13?: string;
  extensionAttribute14?: string;
  extensionAttribute15?: string;

  // entra profile claim specific
  preferred_username?: string;
  upn?: string;
}
