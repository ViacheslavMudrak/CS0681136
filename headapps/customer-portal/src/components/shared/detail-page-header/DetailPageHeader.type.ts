import type React from "react";

export interface DetailPageHeaderAction {
  key: string;
  ariaLabel: string;
  variant: "primary" | "inverse";
  border?: boolean;
  icon: React.ReactNode;
  label?: React.ReactNode;
  onPress: () => void;
  visible?: boolean;
}

export interface DetailPageHeaderProps {
  backAriaLabel: string;
  onBack: () => void;
  title: React.ReactNode;
  headingTag?: "h1" | "h2";
  statusBadge: React.ReactNode;
  actions?: DetailPageHeaderAction[];
  metadata: React.ReactNode;
  reference?: React.ReactNode;
}
