export interface SectionProps {
  analyticsRegion?: string;
  backgroundColor?: "white" | "gray";
  children: React.ReactNode;
  className?: string;
  id?: string;
  removeBottomPadding?: boolean;
  removeTopPadding?: boolean;
  textAlign?: "left" | "center";
}
