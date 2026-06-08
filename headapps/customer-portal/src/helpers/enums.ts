export enum TEST_CASE_DATA_IDS {
  FEATURED_CONTENT = "featured-content",
  AUTH = "auth",
  LANGUAGE_SWITCHER = "language-switcher",
  GLOBAL_SEARCH = "global-search",
  USER_PROFILE_MENU = "user-profile-menu",
  PORTAL_SHELL = "portal-shell",
  VIEW_MY_PROFILE = "view-my-profile",
  PORTAL_SHELL_SIDE_NAV = "portal-shell-side-nav",
  CONTACT_SUPPORT = "contact-support",
  ROLE_PERMISSIONS = "role-permissions",
  ORDER_MANAGEMENT = "order-management",
  USER_INFO = "user-info",
  DASHBOARD_INFO_BANNER = "dashboard-info-banner",
  USER_ACTION_TILES = "user-action-tiles",
  FEATURED_CONTENT_TILE = "featured-content-tile",
  UTILITY_LINKS = "utility-links",
  RECENT_ORDER_WIDGET = "recent-order-widget",
  RECENT_QUOTE_WIDGET = "recent-quote-widget",
  ORDER_DETAIL = "order-detail",
  QUOTE_DETAIL = "quote-detail",
}

export const AUTH_TYPES = {
  LOGIN: "Sign in",
  REGISTER: "Register",
  RESET: "Reset",
};

export type AuthTypeKey = keyof typeof AUTH_TYPES; // "LOGIN" | "REGISTER" | "RESET"
export type AuthTypeValue = (typeof AUTH_TYPES)[AuthTypeKey]; // "LOGIN" | "REGISTER" | "RESET"

export enum AUTH_ERROR_MESSAGES {
  LOGIN_DEFAULT = "An error occurred during sign in",
  LOGIN_FAILED = "An error occurred during sign in. Please try again.",
  REGISTER_DEFAULT = "An error occurred during registration.",
  REGISTER_FAILED = "Registration failed. Please try again.",
  RESET_DEFAULT = "An error occurred during password reset.",
  RESET_FAILED = "Password reset failed. Please try again.",
}

export enum AUTH_SUCCESS_MESSAGES {
  RESET_TITLE = "Reset Password",
  RESET_MESSAGE = "Password Changed",
  RESET_COMPLETE_TITLE = "Password reset successful!",
  RESET_COMPLETE_MESSAGE = "Your password has been successfully reset. You can now sign in with your new password.",
  REGISTER_TITLE = "Registration Successful",
  REGISTER_MESSAGE = "Please check your email to verify your account and complete registration.",
  REGISTER_ACTIVATED_TITLE = "Account activated",
  REGISTER_ACTIVATED_MESSAGE = "Your account has been activated successfully. You can now sign in.",
  OTP_FALLBACK_MESSAGE = "Use the OTP shown above on the screen where you started this request, then return here to continue.",
}

export enum FEATURED_CONTENT_VARIANTS {
  DEFAULT = "default",
  NO_CARD = "noCard",
  LOBBY_EXPERIENCE = "lobbyExperience",
}

export enum AUTH_METHODS {
  PASSWORD = "password",
  SSO = "sso",
  MAGIC_LINK = "passwordless",
  TOKEN = "token",
}
