/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    // "./node_modules/@laitram-l-l-c/intralox-ui-components/dist/**/*.js",
  ],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require("@laitram-l-l-c/intralox-tailwind-config")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Helvetica Neue LT Pro", "sans-serif"],
      },
      fontWeight: {
        normal: "400", // Regular - maps to font-normal
        medium: "500", // Medium - maps to font-medium
        semibold: "600", // Semibold - maps to font-semibold
        bold: "700", // Bold - maps to font-bold
      },
      colors: {
        // Main colors
        "main-color": "#27272a",

        // Background colors
        "bg-basic": "#ffffff",
        "bg-light-gray": "#f7f7f7",
        "bg-lighter-gray": "#fafafa",
        "bg-light-gray-active": "#dadada",
        "bg-blue": "#89c6cc",
        "bg-blue-active": "#15909c",
        "bg-black": "#000",
        "bg-black-active": "#3d3d3d",
        "bg-dark-gray": "#262626",
        "bg-submenu": "#edebeb",
        "bg-submenu-active": "#f6f6f6",

        // Text colors
        "text-white": "#fff",
        "text-heading": "#222",
        "text-basic": "#747474",
        "text-basic-active": "#878787",
        "text-blue": "#89c6cc",
        "text-blue-active": "#15909c",
        "text-red": "#de232f",
        "text-secondary": "#4d4d4f",
        "text-muted": "#4d5b73",
        "text-primary-dark": "#19174f",
        "text-active": "#19174f",
        "text-verified": "#25803f",
        "text-placeholder": "#7a7b7f",
        "text-black": "#000",

        // Border colors
        "border-gray": "#d2d2d2",
        "border-basic": "#89c6cc",
        "border-default": "#e8eaeb",
        "border-gray-300": "#d7d9da",
        "border-active-card": "#c4d0e1",

        // Icon colors
        "icon-muted": "#a8aaae",
        "icon-cyan": "#479ebc",

        // Action/Link colors
        "action-primary": "#00287b",
        "action-primary-hover": "rgba(0, 40, 123, 0.05)",
        "action-link": "#49b7f6",
        "link-text": "#0377ba",
        "link-visited": "#5969b1",

        // Red tones
        "red-dark": "#970000",
        "red-light": "#fbdadb",
        "brand-red": "#ea1c24",

        // Cyan tones
        "cyan-default": "#479ebc",
        "cyan-light": "#e3f0f5",
        "cyan-dark": "#00708d",

        // Green tones
        "btn-green-light": "#a0ce4e",
        "btn-green": "#92be43",
        "bg-green-light": "#d1e9d6",

        // Button colors
        "btn-red": "#bc4526",
        "btn-red-active": "#c34e30",

        // Menu colors
        "menu-hover": "#1b809e",
        "menu-active": "#176f89",

        // Portal/Shell colors
        "portal-bg": "#f8f8f8",
        "portal-sidebar-start": "#151e2c",
        "portal-sidebar-end": "#1d2b42",
        "portal-nav-text": "#ffffff",
        "portal-nav-text-muted": "rgba(255, 255, 255, 0.7)",
        "portal-nav-hover": "rgba(255, 255, 255, 0.08)",
        "portal-nav-active-border": "#de232f",
        "portal-nav-section-title": "rgba(255, 255, 255, 0.6)",
        "portal-sub-nav-item": "#b3b5b8",
        "portal-footer-text": "rgba(255, 255, 255, 0.7)",
        "portal-footer-link": "#1599e6",
        "portal-modal-overlay": "rgba(0, 0, 0, 0.5)",

        // Gray palette
        "gray-100": "#f8f8f8",
        "gray-500": "#a8aaae",
        "gray-700": "#646467",

        // Badge/Chip colors
        "bg-avatar": "#053971",
        "bg-selected-tint": "#eaf1fb",
        "bg-badge-current": "#c5dcf0",

        // Promo
        "promo-bg-hero": "rgba(0, 0, 0, 0.5)",
      },
      spacing: {
        // Custom spacing values from arbitrary classes
        "12px": "12px",
        "16px": "16px",
        "24px": "24px",
        "30px": "30px",
        "70px": "70px",
      },
      shadow: {
        "portal-header": "0 0 8px 0 rgba(0, 0, 0, 0.28)",
        dropdown: "0px 0px 12px 0px rgba(0, 0, 0, 0.13)",
        "account-card": "0px 0px 12px 0px rgba(0, 0, 0, 0.1)",
        card: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
        "card-large": "0px 10px 30px 0px rgba(0, 0, 0, 0.1)",
        modal: "0px 0px 22.5px rgba(0, 0, 0, 0.23)",
      },
      borderRadius: {
        "4px": "4px",
        "8px": "8px",
      },
    },
  },
  plugins: [],
};
