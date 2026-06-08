"use client";
import type { JSX } from "react";

import type { DashboardSplitterProps } from "./DashboardSplitter.type";
import DashboardSplitterDefault from "./variants/DashboardSplitterDefault.variant";

/**
 * Sitecore rendering **Dashboard Splitter**: hosts the `DashboardWidgets` placeholder only.
 */
const DashboardSplitter = (props: DashboardSplitterProps): JSX.Element => {
  return <DashboardSplitterDefault {...props} />;
};

export default DashboardSplitter;
