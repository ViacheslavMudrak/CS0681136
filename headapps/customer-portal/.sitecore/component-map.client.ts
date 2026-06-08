// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as utilitycomponents from 'src/components/ui/utility-components';
import * as Textarea from 'src/components/ui/Textarea';
import * as StatusBadge from 'src/components/ui/StatusBadge';
import * as Select from 'src/components/ui/Select';
import * as Popover from 'src/components/ui/Popover';
import * as Link from 'src/components/ui/Link';
import * as Input from 'src/components/ui/Input';
import * as Heading from 'src/components/ui/Heading';
import * as buttonVariants from 'src/components/ui/buttonVariants';
import * as Button from 'src/components/ui/Button';
import * as AlertBox from 'src/components/ui/AlertBox';
import * as tableVariants from 'src/components/ui/table/tableVariants';
import * as Table from 'src/components/ui/table/Table';
import * as hooks from 'src/components/ui/table/hooks';
import * as ToastProvider from 'src/components/shared/toast/ToastProvider';
import * as Toast from 'src/components/shared/toast/Toast';
import * as SubmittingAsHelpTooltip from 'src/components/shared/submitting-as-help/SubmittingAsHelpTooltip';
import * as PortalShellChromeLoading from 'src/components/shared/portal-loading/PortalShellChromeLoading';
import * as PortalRouteLoadingFallback from 'src/components/shared/portal-loading/PortalRouteLoadingFallback';
import * as PermissionGate from 'src/components/shared/permissions/PermissionGate';
import * as PagePermissionFallback from 'src/components/shared/permissions/PagePermissionFallback';
import * as AccessDenied from 'src/components/shared/permissions/AccessDenied';
import * as OrderManagementMobileCardShell from 'src/components/shared/order-management/OrderManagementMobileCardShell';
import * as Modal from 'src/components/shared/modal/Modal';
import * as LoadingSkeleton from 'src/components/shared/loading-skeleton/LoadingSkeleton';
import * as LinkRender from 'src/components/shared/link-render/LinkRender';
import * as UserKeyIcon from 'src/components/shared/icons/UserKeyIcon';
import * as SupportTicketsIcon from 'src/components/shared/icons/SupportTicketsIcon';
import * as SupportIcon from 'src/components/shared/icons/SupportIcon';
import * as SupportCaseIcon from 'src/components/shared/icons/SupportCaseIcon';
import * as StackIcon from 'src/components/shared/icons/StackIcon';
import * as ShipmentsIcon from 'src/components/shared/icons/ShipmentsIcon';
import * as ShipmentIcon from 'src/components/shared/icons/ShipmentIcon';
import * as SearchIcon from 'src/components/shared/icons/SearchIcon';
import * as RequestUpdatedQuoteActionIcon from 'src/components/shared/icons/RequestUpdatedQuoteActionIcon';
import * as RequestDocumentsActionIcon from 'src/components/shared/icons/RequestDocumentsActionIcon';
import * as QuestionCircleIcon from 'src/components/shared/icons/QuestionCircleIcon';
import * as ProfileIcon from 'src/components/shared/icons/ProfileIcon';
import * as PlusIcon from 'src/components/shared/icons/PlusIcon';
import * as PhoneIcon from 'src/components/shared/icons/PhoneIcon';
import * as PartsIcon from 'src/components/shared/icons/PartsIcon';
import * as OrganizationIcon from 'src/components/shared/icons/OrganizationIcon';
import * as OrdersIcon from 'src/components/shared/icons/OrdersIcon';
import * as OrderIcon from 'src/components/shared/icons/OrderIcon';
import * as NotificationIcon from 'src/components/shared/icons/NotificationIcon';
import * as LogoutIcon from 'src/components/shared/icons/LogoutIcon';
import * as LanguageCheckIcon from 'src/components/shared/icons/LanguageCheckIcon';
import * as InvoicesIcon from 'src/components/shared/icons/InvoicesIcon';
import * as HelpCenterIcon from 'src/components/shared/icons/HelpCenterIcon';
import * as HamburgerMenuIcon from 'src/components/shared/icons/HamburgerMenuIcon';
import * as GlobeIcon from 'src/components/shared/icons/GlobeIcon';
import * as EmailIcon from 'src/components/shared/icons/EmailIcon';
import * as EditIcon from 'src/components/shared/icons/EditIcon';
import * as DoubleChevronIcon from 'src/components/shared/icons/DoubleChevronIcon';
import * as DocumentsIcon from 'src/components/shared/icons/DocumentsIcon';
import * as DocumentIcon from 'src/components/shared/icons/DocumentIcon';
import * as DocumentEditIcon from 'src/components/shared/icons/DocumentEditIcon';
import * as CollapsedUsersIcon from 'src/components/shared/icons/CollapsedUsersIcon';
import * as CollapsedSupportIcon from 'src/components/shared/icons/CollapsedSupportIcon';
import * as CollapsedRolesIcon from 'src/components/shared/icons/CollapsedRolesIcon';
import * as CollapsedResourcesIcon from 'src/components/shared/icons/CollapsedResourcesIcon';
import * as CollapsedOrderIcon from 'src/components/shared/icons/CollapsedOrderIcon';
import * as CollapsedDocumentsIcon from 'src/components/shared/icons/CollapsedDocumentsIcon';
import * as CollapsedDashboardIcon from 'src/components/shared/icons/CollapsedDashboardIcon';
import * as CloseIcon from 'src/components/shared/icons/CloseIcon';
import * as ChevronUpIcon from 'src/components/shared/icons/ChevronUpIcon';
import * as ChevronRightIcon from 'src/components/shared/icons/ChevronRightIcon';
import * as ChevronLeftIcon from 'src/components/shared/icons/ChevronLeftIcon';
import * as ChevronDownIcon from 'src/components/shared/icons/ChevronDownIcon';
import * as CheckIcon from 'src/components/shared/icons/CheckIcon';
import * as EmptyStatePanel from 'src/components/shared/empty-state/EmptyStatePanel';
import * as DocumentRequestPanel from 'src/components/shared/document-request-panel/DocumentRequestPanel';
import * as DetailPageHeader from 'src/components/shared/detail-page-header/DetailPageHeader';
import * as ContextualPanel from 'src/components/shared/contextual-panel/ContextualPanel';
import * as AppDialogShell from 'src/components/shared/app-dialog-shell/AppDialogShell';
import * as RolesPageHeader from 'src/components/roles-permissions/RolesPageHeader';
import * as PermissionsTableComponent from 'src/components/roles-permissions/PermissionsTableComponent';
import * as AuditLog from 'src/components/roles-permissions/AuditLog';
import * as PortalFeatureProviders from 'src/components/providers/PortalFeatureProviders';
import * as Navigation from 'src/components/navigation/Navigation';
import * as DashboardLayout from 'src/components/layout/DashboardLayout';
import * as UserProfile from 'src/components/layout/Sidebar/UserProfile';
import * as SidebarNavItem from 'src/components/layout/Sidebar/SidebarNavItem';
import * as Sidebar from 'src/components/layout/Sidebar/Sidebar';
import * as UserMenu from 'src/components/layout/Header/UserMenu';
import * as SearchBar from 'src/components/layout/Header/SearchBar';
import * as Notifications from 'src/components/layout/Header/Notifications';
import * as NotificationBell from 'src/components/layout/Header/NotificationBell';
import * as Language from 'src/components/layout/Header/Language';
import * as Help from 'src/components/layout/Header/Help';
import * as HeaderClient from 'src/components/layout/Header/partial/HeaderClient';
import * as LocalizedImageFieldLink from 'src/components/image/LocalizedImageFieldLink';
import * as DashboardWelcome from 'src/components/dashboard/DashboardWelcome';
import * as ViewMyProfileDefaultvariant from 'src/components/core/ViewMyProfile/variants/ViewMyProfileDefault.variant';
import * as SupportBanner from 'src/components/core/ViewMyProfile/variants/components/SupportBanner';
import * as PersonalInfoCard from 'src/components/core/ViewMyProfile/variants/components/PersonalInfoCard';
import * as NoAccountCard from 'src/components/core/ViewMyProfile/variants/components/NoAccountCard';
import * as AccountCard from 'src/components/core/ViewMyProfile/variants/components/AccountCard';
import * as UtilityLinksClickTracker from 'src/components/core/UtilityLinks/partial/UtilityLinksClickTracker';
import * as UserProfileMenuDefaultvariant from 'src/components/core/UserProfileMenu/variants/UserProfileMenuDefault.variant';
import * as UserProfileMenuContent from 'src/components/core/UserProfileMenu/variants/UserProfileMenuContent';
import * as UserInfoDefaultvariant from 'src/components/core/UserInfo/variants/UserInfoDefault.variant';
import * as RenderLocalizedLink from 'src/components/core/UserActionTiles/variants/components/RenderLocalizedLink';
import * as SearchComponent from 'src/components/core/SearchComponent/SearchComponent';
import * as SearchComponentDefaultvariant from 'src/components/core/SearchComponent/variants/SearchComponentDefault.variant';
import * as ScriptContent from 'src/components/core/ScriptContent/ScriptContent';
import * as RolePermissionsDefaultvariant from 'src/components/core/RolePermissions/variants/RolePermissionsDefault.variant';
import * as RolePermissionsSaveModal from 'src/components/core/RolePermissions/partial/RolePermissionsSaveModal';
import * as RolePermissionsAuditLog from 'src/components/core/RolePermissions/partial/RolePermissionsAuditLog';
import * as PermissionsTable from 'src/components/core/RolePermissions/partial/PermissionsTable';
import * as RecentQuoteWidget from 'src/components/core/RecentQuoteWidget/RecentQuoteWidget';
import * as RecentQuoteWidgetDefaultvariant from 'src/components/core/RecentQuoteWidget/variants/RecentQuoteWidgetDefault.variant';
import * as RecentOrderWidget from 'src/components/core/RecentOrderWidget/RecentOrderWidget';
import * as RecentOrderWidgetDefaultvariant from 'src/components/core/RecentOrderWidget/variants/RecentOrderWidgetDefault.variant';
import * as RenderStatusIcon from 'src/components/core/RecentOrderWidget/components/RenderStatusIcon';
import * as QuoteDetailDefaultvariant from 'src/components/core/QuoteDetail/variants/QuoteDetailDefault.variant';
import * as QuoteDetailHeader from 'src/components/core/QuoteDetail/partial/QuoteDetailHeader';
import * as QuoteDetailEmptyState from 'src/components/core/QuoteDetail/partial/QuoteDetailEmptyState';
import * as PortalShellSideNavDefaultvariant from 'src/components/core/PortalShellSideNav/variants/PortalShellSideNavDefault.variant';
import * as SwitchCompanyModal from 'src/components/core/PortalShellSideNav/components/SwitchCompanyModal';
import * as PortalShellClient from 'src/components/core/PortalShell/partial/PortalShellClient';
import * as MobileNavToggle from 'src/components/core/PortalShell/partial/MobileNavToggle';
import * as OrderManagementDefaultvariant from 'src/components/core/OrderManagement/variants/OrderManagementDefault.variant';
import * as ShipmentsToolbar from 'src/components/core/OrderManagement/tabs/shipments/ShipmentsToolbar';
import * as ShipmentsPackingSlipButton from 'src/components/core/OrderManagement/tabs/shipments/ShipmentsPackingSlipButton';
import * as ShipmentsMobileCards from 'src/components/core/OrderManagement/tabs/shipments/ShipmentsMobileCards';
import * as ShipmentsDesktopTable from 'src/components/core/OrderManagement/tabs/shipments/ShipmentsDesktopTable';
import * as renderQuoteExpiresIn from 'src/components/core/OrderManagement/tabs/quotes/renderQuoteExpiresIn';
import * as QuotesSearchBarFilter from 'src/components/core/OrderManagement/tabs/quotes/QuotesSearchBarFilter';
import * as QuotesMobileCards from 'src/components/core/OrderManagement/tabs/quotes/QuotesMobileCards';
import * as QuotesDesktopTable from 'src/components/core/OrderManagement/tabs/quotes/QuotesDesktopTable';
import * as OrdersManagementToolbar from 'src/components/core/OrderManagement/tabs/orders/OrdersManagementToolbar';
import * as renderInvoiceDueIn from 'src/components/core/OrderManagement/tabs/invoices/renderInvoiceDueIn';
import * as InvoicesSearchBarFilter from 'src/components/core/OrderManagement/tabs/invoices/InvoicesSearchBarFilter';
import * as InvoicesMobileCards from 'src/components/core/OrderManagement/tabs/invoices/InvoicesMobileCards';
import * as InvoicesDesktopTable from 'src/components/core/OrderManagement/tabs/invoices/InvoicesDesktopTable';
import * as InvoiceDownloadButton from 'src/components/core/OrderManagement/tabs/invoices/InvoiceDownloadButton';
import * as RenderSelectedChip from 'src/components/core/OrderManagement/partial/RenderSelectedChip';
import * as OrderManagementToolbar from 'src/components/core/OrderManagement/partial/OrderManagementToolbar';
import * as OrderManagementTableShared from 'src/components/core/OrderManagement/partial/OrderManagementTableShared';
import * as OrderManagementTabBar from 'src/components/core/OrderManagement/partial/OrderManagementTabBar';
import * as OrderManagementRangeCalendar from 'src/components/core/OrderManagement/partial/OrderManagementRangeCalendar';
import * as OrderManagementPagination from 'src/components/core/OrderManagement/partial/OrderManagementPagination';
import * as OrderManagementMobileSheets from 'src/components/core/OrderManagement/partial/OrderManagementMobileSheets';
import * as OrderManagementMobileCards from 'src/components/core/OrderManagement/partial/OrderManagementMobileCards';
import * as OrderManagementHeader from 'src/components/core/OrderManagement/partial/OrderManagementHeader';
import * as OrderManagementFilterPanelPartials from 'src/components/core/OrderManagement/partial/OrderManagementFilterPanelPartials';
import * as OrderManagementExpandedMatchingLine from 'src/components/core/OrderManagement/partial/OrderManagementExpandedMatchingLine';
import * as OrderManagementEmptyState from 'src/components/core/OrderManagement/partial/OrderManagementEmptyState';
import * as OrderManagementDesktopTable from 'src/components/core/OrderManagement/partial/OrderManagementDesktopTable';
import * as OrderManagementDateRangeField from 'src/components/core/OrderManagement/partial/OrderManagementDateRangeField';
import * as OrderManagementDatePanel from 'src/components/core/OrderManagement/partial/OrderManagementDatePanel';
import * as OrderManagementChipRow from 'src/components/core/OrderManagement/partial/OrderManagementChipRow';
import * as QuoteRequestSubmittingAs from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestSubmittingAs';
import * as QuoteRequestReviewStep from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestReviewStep';
import * as QuoteRequestLineStep from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestLineStep';
import * as QuoteRequestGeneralStep from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestGeneralStep';
import * as QuoteRequestDrawer from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDrawer';
import * as QuoteRequestDiscardDialog from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDiscardDialog';
import * as QuoteRequestConfirmationStep from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestConfirmationStep';
import * as OrderDetailDefaultvariant from 'src/components/core/OrderDetail/variants/OrderDetailDefault.variant';
import * as ShipmentInformationPanel from 'src/components/core/OrderDetail/partial/ShipmentInformationPanel';
import * as RelatedDocumentsPanel from 'src/components/core/OrderDetail/partial/RelatedDocumentsPanel';
import * as orderLineItemColumnValue from 'src/components/core/OrderDetail/partial/orderLineItemColumnValue';
import * as OrderItems from 'src/components/core/OrderDetail/partial/OrderItems';
import * as OrderItemRow from 'src/components/core/OrderDetail/partial/OrderItemRow';
import * as OrderItemMobileCard from 'src/components/core/OrderDetail/partial/OrderItemMobileCard';
import * as OrderDetailPagination from 'src/components/core/OrderDetail/partial/OrderDetailPagination';
import * as OrderDetailHeader from 'src/components/core/OrderDetail/partial/OrderDetailHeader';
import * as OrderDetailEmptyState from 'src/components/core/OrderDetail/partial/OrderDetailEmptyState';
import * as BillingInvoicesPanel from 'src/components/core/OrderDetail/partial/BillingInvoicesPanel';
import * as LanguageSwitcherDefaultvariant from 'src/components/core/LanguageSwitcher/variants/LanguageSwitcherDefault.variant';
import * as GlobalSearchDefaultvariant from 'src/components/core/GlobalSearch/variants/GlobalSearchDefault.variant';
import * as SearchFormContent from 'src/components/core/GlobalSearch/components/SearchFormContent';
import * as CategoryPromptDropdown from 'src/components/core/GlobalSearch/components/CategoryPromptDropdown';
import * as FeaturedContentTile from 'src/components/core/FeaturedContentTile/FeaturedContentTile';
import * as FeaturedContentTileDefaultvariant from 'src/components/core/FeaturedContentTile/variants/FeaturedContentTileDefault.variant';
import * as FeaturedContentLobbyExperiencevariant from 'src/components/core/FeaturedContent/variants/FeaturedContentLobbyExperience.variant';
import * as FullHeightBackground from 'src/components/core/FeaturedContent/variants/components/FullHeightBackground';
import * as FeaturedContentCardSection from 'src/components/core/FeaturedContent/variants/components/FeaturedContentCardSection';
import * as DashboardSplitter from 'src/components/core/DashboardSplitter/DashboardSplitter';
import * as DashboardInfoBannerDefaultvariant from 'src/components/core/DashboardInfoBanner/variants/DashboardInfoBannerDefault.variant';
import * as DashboardRecentWidgetListState from 'src/components/core/dashboard-recent-widgets/DashboardRecentWidgetListState';
import * as DashboardRecentRowMenu from 'src/components/core/dashboard-recent-widgets/DashboardRecentRowMenu';
import * as CustomerSupportComponentClient from 'src/components/core/CustomerSupportComponent/partial/CustomerSupportComponentClient';
import * as ContactSupportPanelContent from 'src/components/core/ContactSupport/variants/ContactSupportPanelContent';
import * as ContactSupportDefaultvariant from 'src/components/core/ContactSupport/variants/ContactSupportDefault.variant';
import * as ColumnSpiltterClientSideDefaultvariant from 'src/components/core/ColumnSpiltterClientSide/variants/ColumnSpiltterClientSideDefault.variant';
import * as AuthDefaultvariant from 'src/components/core/Auth/variants/AuthDefault.variant';
import * as OktaSignInWidget from 'src/components/core/Auth/octa-widget/OktaSignInWidget';
import * as OktaResetPasswordWidget from 'src/components/core/Auth/octa-widget/OktaResetPasswordWidget';
import * as OktaRegisterWidget from 'src/components/core/Auth/octa-widget/OktaRegisterWidget';
import * as ResetPasswordSuccess from 'src/components/core/Auth/components/ResetPasswordSuccess';
import * as RegisterSuccess from 'src/components/core/Auth/components/RegisterSuccess';
import * as AuthResetPassword from 'src/components/core/Auth/components/AuthResetPassword';
import * as AuthRegister from 'src/components/core/Auth/components/AuthRegister';
import * as AuthLogin from 'src/components/core/Auth/components/AuthLogin';
import * as WidgetBackButton from 'src/components/core/Auth/components/WidgetBackButton/WidgetBackButton';
import * as AuthFooter from 'src/components/core/Auth/components/AuthFooter/AuthFooter';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['utility-components', { ...utilitycomponents }],
  ['Textarea', { ...Textarea }],
  ['StatusBadge', { ...StatusBadge }],
  ['Select', { ...Select }],
  ['Popover', { ...Popover }],
  ['Link', { ...Link }],
  ['Input', { ...Input }],
  ['Heading', { ...Heading }],
  ['buttonVariants', { ...buttonVariants }],
  ['Button', { ...Button }],
  ['AlertBox', { ...AlertBox }],
  ['tableVariants', { ...tableVariants }],
  ['Table', { ...Table }],
  ['hooks', { ...hooks }],
  ['ToastProvider', { ...ToastProvider }],
  ['Toast', { ...Toast }],
  ['SubmittingAsHelpTooltip', { ...SubmittingAsHelpTooltip }],
  ['PortalShellChromeLoading', { ...PortalShellChromeLoading }],
  ['PortalRouteLoadingFallback', { ...PortalRouteLoadingFallback }],
  ['PermissionGate', { ...PermissionGate }],
  ['PagePermissionFallback', { ...PagePermissionFallback }],
  ['AccessDenied', { ...AccessDenied }],
  ['OrderManagementMobileCardShell', { ...OrderManagementMobileCardShell }],
  ['Modal', { ...Modal }],
  ['LoadingSkeleton', { ...LoadingSkeleton }],
  ['LinkRender', { ...LinkRender }],
  ['UserKeyIcon', { ...UserKeyIcon }],
  ['SupportTicketsIcon', { ...SupportTicketsIcon }],
  ['SupportIcon', { ...SupportIcon }],
  ['SupportCaseIcon', { ...SupportCaseIcon }],
  ['StackIcon', { ...StackIcon }],
  ['ShipmentsIcon', { ...ShipmentsIcon }],
  ['ShipmentIcon', { ...ShipmentIcon }],
  ['SearchIcon', { ...SearchIcon }],
  ['RequestUpdatedQuoteActionIcon', { ...RequestUpdatedQuoteActionIcon }],
  ['RequestDocumentsActionIcon', { ...RequestDocumentsActionIcon }],
  ['QuestionCircleIcon', { ...QuestionCircleIcon }],
  ['ProfileIcon', { ...ProfileIcon }],
  ['PlusIcon', { ...PlusIcon }],
  ['PhoneIcon', { ...PhoneIcon }],
  ['PartsIcon', { ...PartsIcon }],
  ['OrganizationIcon', { ...OrganizationIcon }],
  ['OrdersIcon', { ...OrdersIcon }],
  ['OrderIcon', { ...OrderIcon }],
  ['NotificationIcon', { ...NotificationIcon }],
  ['LogoutIcon', { ...LogoutIcon }],
  ['LanguageCheckIcon', { ...LanguageCheckIcon }],
  ['InvoicesIcon', { ...InvoicesIcon }],
  ['HelpCenterIcon', { ...HelpCenterIcon }],
  ['HamburgerMenuIcon', { ...HamburgerMenuIcon }],
  ['GlobeIcon', { ...GlobeIcon }],
  ['EmailIcon', { ...EmailIcon }],
  ['EditIcon', { ...EditIcon }],
  ['DoubleChevronIcon', { ...DoubleChevronIcon }],
  ['DocumentsIcon', { ...DocumentsIcon }],
  ['DocumentIcon', { ...DocumentIcon }],
  ['DocumentEditIcon', { ...DocumentEditIcon }],
  ['CollapsedUsersIcon', { ...CollapsedUsersIcon }],
  ['CollapsedSupportIcon', { ...CollapsedSupportIcon }],
  ['CollapsedRolesIcon', { ...CollapsedRolesIcon }],
  ['CollapsedResourcesIcon', { ...CollapsedResourcesIcon }],
  ['CollapsedOrderIcon', { ...CollapsedOrderIcon }],
  ['CollapsedDocumentsIcon', { ...CollapsedDocumentsIcon }],
  ['CollapsedDashboardIcon', { ...CollapsedDashboardIcon }],
  ['CloseIcon', { ...CloseIcon }],
  ['ChevronUpIcon', { ...ChevronUpIcon }],
  ['ChevronRightIcon', { ...ChevronRightIcon }],
  ['ChevronLeftIcon', { ...ChevronLeftIcon }],
  ['ChevronDownIcon', { ...ChevronDownIcon }],
  ['CheckIcon', { ...CheckIcon }],
  ['EmptyStatePanel', { ...EmptyStatePanel }],
  ['DocumentRequestPanel', { ...DocumentRequestPanel }],
  ['DetailPageHeader', { ...DetailPageHeader }],
  ['ContextualPanel', { ...ContextualPanel }],
  ['AppDialogShell', { ...AppDialogShell }],
  ['RolesPageHeader', { ...RolesPageHeader }],
  ['PermissionsTableComponent', { ...PermissionsTableComponent }],
  ['AuditLog', { ...AuditLog }],
  ['PortalFeatureProviders', { ...PortalFeatureProviders }],
  ['Navigation', { ...Navigation }],
  ['DashboardLayout', { ...DashboardLayout }],
  ['UserProfile', { ...UserProfile }],
  ['SidebarNavItem', { ...SidebarNavItem }],
  ['Sidebar', { ...Sidebar }],
  ['UserMenu', { ...UserMenu }],
  ['SearchBar', { ...SearchBar }],
  ['Notifications', { ...Notifications }],
  ['NotificationBell', { ...NotificationBell }],
  ['Language', { ...Language }],
  ['Help', { ...Help }],
  ['HeaderClient', { ...HeaderClient }],
  ['LocalizedImageFieldLink', { ...LocalizedImageFieldLink }],
  ['DashboardWelcome', { ...DashboardWelcome }],
  ['ViewMyProfileDefault', { ...ViewMyProfileDefaultvariant }],
  ['SupportBanner', { ...SupportBanner }],
  ['PersonalInfoCard', { ...PersonalInfoCard }],
  ['NoAccountCard', { ...NoAccountCard }],
  ['AccountCard', { ...AccountCard }],
  ['UtilityLinksClickTracker', { ...UtilityLinksClickTracker }],
  ['UserProfileMenuDefault', { ...UserProfileMenuDefaultvariant }],
  ['UserProfileMenuContent', { ...UserProfileMenuContent }],
  ['UserInfoDefault', { ...UserInfoDefaultvariant }],
  ['RenderLocalizedLink', { ...RenderLocalizedLink }],
  ['SearchComponent', { ...SearchComponent }],
  ['SearchComponentDefault', { ...SearchComponentDefaultvariant }],
  ['ScriptContent', { ...ScriptContent }],
  ['RolePermissionsDefault', { ...RolePermissionsDefaultvariant }],
  ['RolePermissionsSaveModal', { ...RolePermissionsSaveModal }],
  ['RolePermissionsAuditLog', { ...RolePermissionsAuditLog }],
  ['PermissionsTable', { ...PermissionsTable }],
  ['RecentQuoteWidget', { ...RecentQuoteWidget }],
  ['RecentQuoteWidgetDefault', { ...RecentQuoteWidgetDefaultvariant }],
  ['RecentOrderWidget', { ...RecentOrderWidget }],
  ['RecentOrderWidgetDefault', { ...RecentOrderWidgetDefaultvariant }],
  ['RenderStatusIcon', { ...RenderStatusIcon }],
  ['QuoteDetailDefault', { ...QuoteDetailDefaultvariant }],
  ['QuoteDetailHeader', { ...QuoteDetailHeader }],
  ['QuoteDetailEmptyState', { ...QuoteDetailEmptyState }],
  ['PortalShellSideNavDefault', { ...PortalShellSideNavDefaultvariant }],
  ['SwitchCompanyModal', { ...SwitchCompanyModal }],
  ['PortalShellClient', { ...PortalShellClient }],
  ['MobileNavToggle', { ...MobileNavToggle }],
  ['OrderManagementDefault', { ...OrderManagementDefaultvariant }],
  ['ShipmentsToolbar', { ...ShipmentsToolbar }],
  ['ShipmentsPackingSlipButton', { ...ShipmentsPackingSlipButton }],
  ['ShipmentsMobileCards', { ...ShipmentsMobileCards }],
  ['ShipmentsDesktopTable', { ...ShipmentsDesktopTable }],
  ['renderQuoteExpiresIn', { ...renderQuoteExpiresIn }],
  ['QuotesSearchBarFilter', { ...QuotesSearchBarFilter }],
  ['QuotesMobileCards', { ...QuotesMobileCards }],
  ['QuotesDesktopTable', { ...QuotesDesktopTable }],
  ['OrdersManagementToolbar', { ...OrdersManagementToolbar }],
  ['renderInvoiceDueIn', { ...renderInvoiceDueIn }],
  ['InvoicesSearchBarFilter', { ...InvoicesSearchBarFilter }],
  ['InvoicesMobileCards', { ...InvoicesMobileCards }],
  ['InvoicesDesktopTable', { ...InvoicesDesktopTable }],
  ['InvoiceDownloadButton', { ...InvoiceDownloadButton }],
  ['RenderSelectedChip', { ...RenderSelectedChip }],
  ['OrderManagementToolbar', { ...OrderManagementToolbar }],
  ['OrderManagementTableShared', { ...OrderManagementTableShared }],
  ['OrderManagementTabBar', { ...OrderManagementTabBar }],
  ['OrderManagementRangeCalendar', { ...OrderManagementRangeCalendar }],
  ['OrderManagementPagination', { ...OrderManagementPagination }],
  ['OrderManagementMobileSheets', { ...OrderManagementMobileSheets }],
  ['OrderManagementMobileCards', { ...OrderManagementMobileCards }],
  ['OrderManagementHeader', { ...OrderManagementHeader }],
  ['OrderManagementFilterPanelPartials', { ...OrderManagementFilterPanelPartials }],
  ['OrderManagementExpandedMatchingLine', { ...OrderManagementExpandedMatchingLine }],
  ['OrderManagementEmptyState', { ...OrderManagementEmptyState }],
  ['OrderManagementDesktopTable', { ...OrderManagementDesktopTable }],
  ['OrderManagementDateRangeField', { ...OrderManagementDateRangeField }],
  ['OrderManagementDatePanel', { ...OrderManagementDatePanel }],
  ['OrderManagementChipRow', { ...OrderManagementChipRow }],
  ['QuoteRequestSubmittingAs', { ...QuoteRequestSubmittingAs }],
  ['QuoteRequestReviewStep', { ...QuoteRequestReviewStep }],
  ['QuoteRequestLineStep', { ...QuoteRequestLineStep }],
  ['QuoteRequestGeneralStep', { ...QuoteRequestGeneralStep }],
  ['QuoteRequestDrawer', { ...QuoteRequestDrawer }],
  ['QuoteRequestDiscardDialog', { ...QuoteRequestDiscardDialog }],
  ['QuoteRequestConfirmationStep', { ...QuoteRequestConfirmationStep }],
  ['OrderDetailDefault', { ...OrderDetailDefaultvariant }],
  ['ShipmentInformationPanel', { ...ShipmentInformationPanel }],
  ['RelatedDocumentsPanel', { ...RelatedDocumentsPanel }],
  ['orderLineItemColumnValue', { ...orderLineItemColumnValue }],
  ['OrderItems', { ...OrderItems }],
  ['OrderItemRow', { ...OrderItemRow }],
  ['OrderItemMobileCard', { ...OrderItemMobileCard }],
  ['OrderDetailPagination', { ...OrderDetailPagination }],
  ['OrderDetailHeader', { ...OrderDetailHeader }],
  ['OrderDetailEmptyState', { ...OrderDetailEmptyState }],
  ['BillingInvoicesPanel', { ...BillingInvoicesPanel }],
  ['LanguageSwitcherDefault', { ...LanguageSwitcherDefaultvariant }],
  ['GlobalSearchDefault', { ...GlobalSearchDefaultvariant }],
  ['SearchFormContent', { ...SearchFormContent }],
  ['CategoryPromptDropdown', { ...CategoryPromptDropdown }],
  ['FeaturedContentTile', { ...FeaturedContentTile }],
  ['FeaturedContentTileDefault', { ...FeaturedContentTileDefaultvariant }],
  ['FeaturedContentLobbyExperience', { ...FeaturedContentLobbyExperiencevariant }],
  ['FullHeightBackground', { ...FullHeightBackground }],
  ['FeaturedContentCardSection', { ...FeaturedContentCardSection }],
  ['DashboardSplitter', { ...DashboardSplitter }],
  ['DashboardInfoBannerDefault', { ...DashboardInfoBannerDefaultvariant }],
  ['DashboardRecentWidgetListState', { ...DashboardRecentWidgetListState }],
  ['DashboardRecentRowMenu', { ...DashboardRecentRowMenu }],
  ['CustomerSupportComponentClient', { ...CustomerSupportComponentClient }],
  ['ContactSupportPanelContent', { ...ContactSupportPanelContent }],
  ['ContactSupportDefault', { ...ContactSupportDefaultvariant }],
  ['ColumnSpiltterClientSideDefault', { ...ColumnSpiltterClientSideDefaultvariant }],
  ['AuthDefault', { ...AuthDefaultvariant }],
  ['OktaSignInWidget', { ...OktaSignInWidget }],
  ['OktaResetPasswordWidget', { ...OktaResetPasswordWidget }],
  ['OktaRegisterWidget', { ...OktaRegisterWidget }],
  ['ResetPasswordSuccess', { ...ResetPasswordSuccess }],
  ['RegisterSuccess', { ...RegisterSuccess }],
  ['AuthResetPassword', { ...AuthResetPassword }],
  ['AuthRegister', { ...AuthRegister }],
  ['AuthLogin', { ...AuthLogin }],
  ['WidgetBackButton', { ...WidgetBackButton }],
  ['AuthFooter', { ...AuthFooter }],
]);

export default componentMap;
