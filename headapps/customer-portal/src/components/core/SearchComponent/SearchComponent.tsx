"use client";

import type { ReactElement } from "react";
import React from "react";

import type { SearchComponentProps } from "./SearchComponent.type";
import { SearchComponentDefaultVariant } from "./variants/SearchComponentDefault.variant";

const SearchComponentBase = (props: SearchComponentProps): ReactElement => {
  return <SearchComponentDefaultVariant {...props} />;
};

const SearchComponent = React.memo(SearchComponentBase);
export default SearchComponent;
