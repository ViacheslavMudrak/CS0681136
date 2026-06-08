import { ICheckedFacets } from "components/search/SearchComponent.type";

export interface IRenderSelectedFacets {
  handleRemoveSelectedFacet: (facet: ICheckedFacets) => void;
  handleClearFilters: () => void;
}

export interface IRenderFacetList {
  filterableFacets: IFacets[];
  handleCheckboxToggle: (
    facet: IFacets,
    facetValueId: string,
    isChecked: boolean,
  ) => void;
}

export interface IFacets {
  name: string;
  label: string;
  value: IValue[];
}

export interface IValue {
  id: string;
  text: string;
  count?: number;
}

export interface IPopupFacetProps {
  facets: IFacets[];
}
