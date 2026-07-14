import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

export interface AccountMenuProps {
  isOpen: boolean;
  accountMenuHeader: string;
  associateIdLabel?: string;
  onClose: () => void;
  globalHeaderAccountMenu?: GlobalHeaderAccountMenu;
}

export type SiteNavigationItemWithIcon = {
  _type: string;
  navigationLink: {
    jsonValue: LinkField;
  };
  navigationIcon: {
    jsonValue: Field<string>;
  };
};

export type GlobalHeaderAccountMenu = {
  _type: string;
  accountMenuTitle: {
    jsonValue: Field<string>;
  };
  accountMenuAssociateIdLabel: {
    jsonValue: Field<string>;
  };
  children: {
    results: SiteNavigationItemWithIcon[];
  };
};
