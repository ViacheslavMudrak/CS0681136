import type { JSX } from "react";

import type { ColumnSpiltterClientSideProps } from "./ColumnSpiltterClientSide.type";
import ColumnSpiltterClientSideDefault from "./variants/ColumnSpiltterClientSideDefault.variant";

/**
 * Sitecore loading rendering **Column Spiltter Client Side**: left and right placeholder shell until the client-side splitter is active.
 */
const ColumnSpiltterClientSide = (props: ColumnSpiltterClientSideProps): JSX.Element => {
  return <ColumnSpiltterClientSideDefault {...props} />;
};

export default ColumnSpiltterClientSide;
