/**
 * Tailwind Utility Classes
 * Contains commonly used Tailwind class combinations extracted from CSS Modules
 * This helps standardize styling across the application during the Tailwind migration
 */

export const responsiveLayout = {
  contentPadding: "p-[16px] lg:p-[24px]",
  portalContentArea: "flex-1 pt-[70px] p-[16px] lg:p-[24px]",
  hideBelowTablet: "max-md:hidden",
  hideDesktop: "lg:hidden",
  hideMobile: "md:hidden",
} as const;

export const tailwindClasses = {
  // Layout utilities
  layout: {
    dashboardContainer: "min-h-screen bg-[#f5f5f7] flex",
    mainContent: "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
    contentArea: responsiveLayout.portalContentArea,
    mobileOverlay: "fixed inset-0 bg-black/50 z-30 lg:hidden",
  },

  // Sidebar utilities
  sidebar: {
    container:
      "fixed top-0 h-screen left-0 bg-[#1e293b] flex flex-col z-40 transition-all duration-300 ease-in-out",
    expanded: "w-[233px]",
    collapsed: "w-[56px]",
    logoSection: "bg-[#ea1c24] h-[68px] w-full flex items-center gap-[10.5px] px-[21px] relative",
    logoButton:
      "bg-[#ea1c24] h-[63px] w-[56px] flex items-center justify-center transition-colors duration-150 hover:bg-[#d01a20]",
    userProfile: "px-[14px] pt-[21px] pb-0",
    userCard:
      "bg-[rgba(51,65,85,0.5)] h-[52.5px] rounded-[7px] w-full flex items-center px-[10.5px] gap-[10.5px]",
    userAvatar: "size-[31.5px] rounded-full bg-white flex items-center justify-center shrink-0",
    navigation: "flex-1 overflow-y-auto px-[14px] pt-[14px] flex flex-col gap-[20px]",
    navItem:
      "flex items-center gap-[10.5px] h-[35px] px-[10.5px] rounded-[7px] text-[#99a1af] text-[12.25px] font-normal transition-colors duration-150 w-full relative bg-transparent border-none cursor-pointer hover:bg-[rgba(51,65,85,0.5)]",
  },

  // Header utilities
  header: {
    container:
      "bg-white border-b border-border-default h-[70px] flex items-center justify-between px-[24px]",
    title: "text-[24px] font-bold text-text-heading",
    searchBar: "flex-1 max-w-[400px] mx-[24px]",
  },

  // Modal utilities
  modal: {
    overlay: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center",
    content: "bg-white rounded-md shadow-modal w-full max-w-md max-h-[90vh]",
    header: "border-b border-border-default px-[24px] py-[16px]",
    body: "p-[24px] overflow-y-auto",
    footer: "border-t border-border-default px-[24px] py-[16px] flex gap-2 justify-end",
  },

  // Toast utilities
  toast: {
    container: "fixed bottom-[20px] right-[20px] z-50 flex flex-col gap-[12px]",
    item: "bg-white border border-border-default rounded-md shadow-card-large px-[16px] py-[12px] min-w-[300px]",
    success: "border-l-4 border-l-[#92be43]",
    error: "border-l-4 border-l-[#de232f]",
    warning: "border-l-4 border-l-[#bc4526]",
    info: "border-l-4 border-l-[#00287b]",
  },

  // Card utilities
  card: {
    container: "bg-white rounded-[8px] p-[24px] shadow-card-large",
    header: "text-[24px] font-bold text-text-heading mb-[16px]",
    body: "text-text-basic text-[14px] leading-[1.5]",
    footer: "border-t border-border-default pt-[16px] mt-[16px]",
  },

  // Button utilities
  button: {
    primary:
      "bg-action-primary text-white px-[16px] py-[8px] rounded-md hover:bg-[#00205a] transition-colors",
    secondary:
      "bg-white text-text-basic border border-border-default px-[16px] py-[8px] rounded-md hover:bg-bg-light-gray",
    danger:
      "bg-text-red text-white px-[16px] py-[8px] rounded-md hover:bg-red-dark transition-colors",
  },

  // Table utilities
  table: {
    container: "w-full border-collapse",
    header: "bg-[#f5f5f7] text-text-heading font-bold text-[11px] leading-[100%] tracking-[0.5px]",
    cell: "border border-border-default px-[12px] py-[12px] text-[14px]",
    row: "hover:bg-[#f9f9f9] transition-colors",
    alternateRow: "bg-[#fafafa]",
  },

  // Form utilities
  form: {
    group: "flex flex-col gap-[8px] mb-[16px]",
    label: "text-[14px] font-medium text-text-heading",
    input:
      "w-full px-[12px] py-[8px] border border-border-default rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-action-primary",
    error: "border-red-500",
    disabled: "bg-gray-100 text-gray-500 cursor-not-allowed",
  },

  // Typography utilities
  typography: {
    h1: "text-[32px] md:text-[24px] font-bold leading-[1.2] mb-[12px]",
    h2: "text-[24px] font-bold leading-[1.3] mb-[10px]",
    h3: "text-[20px] font-bold leading-[1.4] mb-[8px]",
    h4: "text-[18px] font-semibold leading-[1.4] mb-[6px]",
    body: "text-[14px] leading-[1.5] text-text-basic",
    small: "text-[12px] leading-[1.4] text-text-muted",
    link: "text-action-link hover:text-link-visited underline",
  },

  // Spacing utilities
  spacing: {
    xs: "space-y-[4px]",
    sm: "space-y-[8px]",
    md: "space-y-[12px]",
    lg: "space-y-[16px]",
    xl: "space-y-[24px]",
  },

  // Utility functions (returning strings)
  colors: {
    getBrandColor: (state: "default" | "hover" | "active") => {
      switch (state) {
        case "hover":
          return "hover:bg-[#d01a20]";
        case "active":
          return "bg-[#a01818]";
        default:
          return "bg-[#ea1c24]";
      }
    },
  },
} as const;

/**
 * Combines multiple Tailwind class arrays into a single string
 * Useful for combining multiple utility groups
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes
    .filter((c) => typeof c === "string")
    .join(" ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
};

/**
 * Extracts arbitrary Tailwind values that should be moved to theme
 * This is useful for identifying values that are used frequently and should be added to tailwind.config.js
 */
export const arbitraryValueMap = {
  // Colors not yet in theme
  sidebarBg: "#1e293b",
  brandRed: "#ea1c24",
  brandRedHover: "#d01a20",
  brandRedDark: "#a01818",
  sidebarHoverBg: "rgba(51,65,85,0.5)",

  // Sizes commonly used
  sidebarExpandedWidth: "233px",
  sidebarCollapsedWidth: "56px",
  headerHeight: "70px",
  logoSectionHeight: "68px",

  // Border radius
  smallRadius: "4px",
  mediumRadius: "7px",

  // Shadows already in theme
  // See tailwind.config.js for others
} as const;

export type TailwindClasses = typeof tailwindClasses;
export type ArbitraryValueMap = typeof arbitraryValueMap;
