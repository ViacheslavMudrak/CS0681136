export enum I18N {
  WidgetBackButton = "user_widget_back_button",
  WidgetFailedToLoad = "user_widget_failed_to_load",
  WidgetReturnToLogin = "user_widget_return_to_login",

  /* View My Profile */
  AccountIdLabel = "account_id_label",
  ProfileName = "profile_name",
  ProfileVerification = "profile_verification",
  CurrentLocation = "current_location",
  SwitchLocation = "switch_location",
  ProfileEmail = "profile_email",
  ProfileSectionPersonalInformation = "profile_section_personal_information",

  /* Global Search */
  GlobalSortList = "global_sort_list",

  /* Portal Shell Side Nav / Switch Company Modal */
  PortalShellSwitch = "portalshell_switch",
  PortalShellAccount = "portalshell_account",

  /* Role & Permissions */
  EditSave = "edit_save",
  EditCancel = "edit_cancel_role",
  PermissionCancel = "permission_cancel_role",
  PermissionSave = "permission_save",
  PermissionNameColumn = "permission_name",

  /* Order Management (Sitecore dictionary) */
  FilterClear = "filter_clear",
  FilterCarrier = "filter_carrier",
  FilterTracking = "filter_tracking",
  /** Shipped date label (Sitecore key spelling). */
  FilterShipmentDate = "filter_shipmetdate",
  FilterStatus = "filter_status",
  FilterItems = "filter_items",
  FilterMatching = "filter_matching",
  FilterQuantity = "filter_quantity",
  FilterView = "filter_view",
  FilterDetail = "filter_detail",
  FilterRequest = "filter_request",
  DateApply = "date_apply",
  DateClear = "date_clear",
  /** Order Management date filter — shown when no range is applied yet (Sitecore dictionary). */
  OrderMgmtSelectDateRange = "order_mgmt_select_date_range",
  BeltClear = "belt_clear",
  BeltApply = "belt_apply",
  DefaultPageSize = "default_page_size",
  ResultPageSize = "result_page_size",

  RegisterEmailLabel = "user_register_email_label",
  RegisterEmailPlaceholder = "user_register_email_placeholder",
  RegisterFirstNameLabel = "user_register_first_name_label",
  RegisterFirstNamePlaceholder = "user_register_first_name_placeholder",
  RegisterLastNameLabel = "user_register_last_name_label",
  RegisterLastNamePlaceholder = "user_register_last_name_placeholder",
  RegisterCompanyLabel = "user_register_company_label",
  RegisterCompanyPlaceholder = "user_register_company_placeholder",
  RegisterJobRoleLabel = "user_register_job_role_label",
  RegisterJobRolePlaceholder = "user_register_job_role_placeholder",
  RegisterIndustryLabel = "user_register_industry_label",
  RegisterIndustryPlaceholder = "user_register_industry_placeholder",
  RegisterCountryLabel = "user_register_country_label",
  RegisterCountryPlaceholder = "user_register_country_placeholder",
  RegisterMarketingOptInLabel = "user_register_marketing_opt_in_label",
  RegisterPasswordLabel = "user_register_password_label", // Add= this in
  RegisterPasswordPlaceholder = "user_register_password_placeholder",
  RegisterSubmitText = "user_register_submit_text",
  RegisterAlreadyRegisteredText = "user_register_already_registered_text",
  RegisterSigninText = "user_register_signin_text",
  RegisterWidgetLoading = "user_register_widget_loading",
  RegisterDuplicateInstruction = "user_register_duplicate_instruction",
  RegisterDuplicateResetPasswordLink = "user_register_duplicate_passwordlink",

  SignInEmailLabel = "user_signin_email_label",
  SignInEmailPlaceholder = "user_signin_email_placeholder",
  SignInPasswordLabel = "user_signin_password_label",
  SignInPasswordPlaceholder = "user_signin_password_placeholder",
  SignInSubmitText = "user_signin_submit_text",
  SignInVerifyPasswordText = "user_signin_verify_password_text",
  SignInNeedHelpText = "user_signin_need_help_text",
  SignInResetPasswordText = "user_signin_reset_password_text",
  SignInCreateAccountText = "user_signin_create_account_text",
  SignInWidgetLoading = "user_signin_widget_loading",

  ResetPasswordEmailLabel = "user_reset_password_email_label",
  ResetPasswordEmailPlaceholder = "user_reset_password_email_placeholder",
  ResetPasswordSubmitText = "user_reset_password_submit_text",
  ResetPasswordBackToSignInText = "user_reset_password_back_to_signin_text",
  ResetPasswordNeedHelpText = "user_reset_password_need_help_text",
  ResetPasswordContactSupportText = "user_reset_password_contact_support_text",
  ResetPasswordWidgetLoading = "user_reset_password_widget_loading",
  ResetPasswordLinkExpiredTitle = "user_reset_password_link_expired_title",
  ResetPasswordLinkExpiredText = "user_reset_password_link_expired_text",
  ResetBackToLoginText = "user_reset_back_to_login_text",
  ResetNeedHelpText = "user_reset_need_help_text",
  ResetContactSupportText = "user_reset_contact_support_text",
}

export type I18NType = `${I18N}`;

export function isValidI18N(key: string): key is I18NType {
  return Object.values(I18N).includes(key as I18N);
}
