export const updateUrlWithFacet = (
  facetName: string,
  facetValue: string,
  isSelected: boolean,
) => {
  const currentUrl = new URL(window.location.href);
  const searchParams = currentUrl.searchParams;
  const existingValues = searchParams.getAll(facetName);
  if (isSelected) {
    if (!existingValues.includes(facetValue)) {
      existingValues.push(facetValue);
      searchParams.set(facetName, existingValues.join(","));
    }
  } else {
    existingValues.forEach((v) => {
        const trimItem = v.split(",").filter((t) => t !== facetValue);
        if (trimItem.length > 0) {
          searchParams.set(facetName, trimItem.join(","));
        } else {
          searchParams.delete(facetName);
        }
      });
  }
  window.history.pushState({}, "", currentUrl.toString());
};
