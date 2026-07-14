export type LInkModel = {
  url?: string;
  text?: string;
  target?: string;
  anchor?: string;
};

//New iconmodel for graphql for droplink field which differs from the iconsmodel for multilist
export type IconModel = {
  targetItem?: {
    name?: string;
    value?: { value?: string };
  };
};

export type FavoritesModel = {
  targetItems?: {
    id?: string;
    name?: string;
    url?: LInkModel;
    icon?: IconModel;
  }[];
};

export type IconsModel = {
  targetItems?: {
    name?: string;
    value?: { value?: string };
  }[];
};

export type VisibleByModel = {
  targetItems?: {
    id?: string;
    name?: string;
    email?: { value?: string };
    disableGroup?: { value?: string };
  }[];
};

export type SiteChoiceModel = {
  targetItems?: {
    id?: string;
    name?: string;
    title?: { value?: string };
    visibleBy?: VisibleByModel;
  }[];
};

export type UserDefaultSettings = {
  targetItem?: {
    defaultFavorites?: FavoritesModel;
    recommendedFavorites?: FavoritesModel;
    iconsForFavorites?: IconsModel;
    newsSiteChoiceSelection?: SiteChoiceModel;
    supplementalSiteChoiceSelection?: SiteChoiceModel;
  };
};
