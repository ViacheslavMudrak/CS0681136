// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as utilitycomponents from 'src/components/ui/utility-components';
import * as Textarea from 'src/components/ui/Textarea';
import * as StatusBadge from 'src/components/ui/StatusBadge';
import * as Select from 'src/components/ui/Select';
import * as Popover from 'src/components/ui/Popover';
import * as Link from 'src/components/ui/Link';
import * as Input from 'src/components/ui/Input';
import * as Heading from 'src/components/ui/Heading';
import * as Card from 'src/components/ui/Card';
import * as buttonVariants from 'src/components/ui/buttonVariants';
import * as Button from 'src/components/ui/Button';
import * as AlertBox from 'src/components/ui/AlertBox';
import * as utils from 'src/components/ui/table/utils';
import * as tableVariants from 'src/components/ui/table/tableVariants';
import * as Tabletypes from 'src/components/ui/table/Table.types';
import * as Table from 'src/components/ui/table/Table';
import * as hooks from 'src/components/ui/table/hooks';
import * as Title from 'src/components/title/Title';
import * as ToastProvider from 'src/components/shared/toast/ToastProvider';
import * as Toast from 'src/components/shared/toast/Toast';
import * as SuccessMessage from 'src/components/shared/success-message/SuccessMessage';
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
import * as InfoBanner from 'src/components/shared/info-banner/InfoBanner';
import * as UserKeyIcon from 'src/components/shared/icons/UserKeyIcon';
import * as SvgIcon from 'src/components/shared/icons/SvgIcon';
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
import * as LogoIcon from 'src/components/shared/icons/LogoIcon';
import * as LanguageCheckIcon from 'src/components/shared/icons/LanguageCheckIcon';
import * as InvoicesIcon from 'src/components/shared/icons/InvoicesIcon';
import * as index from 'src/components/shared/icons/index';
import * as Icon from 'src/components/shared/icons/Icon';
import * as HelpCenterIcon from 'src/components/shared/icons/HelpCenterIcon';
import * as HamburgerMenuIcon from 'src/components/shared/icons/HamburgerMenuIcon';
import * as GlobeIcon from 'src/components/shared/icons/GlobeIcon';
import * as ExpandedLogoIcon from 'src/components/shared/icons/ExpandedLogoIcon';
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
import * as CollapsedLogoIcon from 'src/components/shared/icons/CollapsedLogoIcon';
import * as CollapsedDocumentsIcon from 'src/components/shared/icons/CollapsedDocumentsIcon';
import * as CollapsedDashboardIcon from 'src/components/shared/icons/CollapsedDashboardIcon';
import * as CloseIcon from 'src/components/shared/icons/CloseIcon';
import * as ChevronUpIcon from 'src/components/shared/icons/ChevronUpIcon';
import * as ChevronRightIcon from 'src/components/shared/icons/ChevronRightIcon';
import * as ChevronLeftIcon from 'src/components/shared/icons/ChevronLeftIcon';
import * as ChevronDownIcon from 'src/components/shared/icons/ChevronDownIcon';
import * as CheckIcon from 'src/components/shared/icons/CheckIcon';
import * as HelpLinks from 'src/components/shared/help-links/HelpLinks';
import * as ErrorMessage from 'src/components/shared/error-message/ErrorMessage';
import * as EmptyStatePanel from 'src/components/shared/empty-state/EmptyStatePanel';
import * as DocumentRequestPanel from 'src/components/shared/document-request-panel/DocumentRequestPanel';
import * as DetailPageHeadertype from 'src/components/shared/detail-page-header/DetailPageHeader.type';
import * as DetailPageHeader from 'src/components/shared/detail-page-header/DetailPageHeader';
import * as ContextualPanel from 'src/components/shared/contextual-panel/ContextualPanel';
import * as AuthHeader from 'src/components/shared/auth-header/AuthHeader';
import * as AuthCard from 'src/components/shared/auth-card/AuthCard';
import * as AppDialogShell from 'src/components/shared/app-dialog-shell/AppDialogShell';
import * as RowSplitter from 'src/components/row-splitter/RowSplitter';
import * as types from 'src/components/roles-permissions/types';
import * as RolesPageHeader from 'src/components/roles-permissions/RolesPageHeader';
import * as PermissionsTableComponent from 'src/components/roles-permissions/PermissionsTableComponent';
import * as CheckmarkCellComponent from 'src/components/roles-permissions/CheckmarkCellComponent';
import * as AuditLog from 'src/components/roles-permissions/AuditLog';
import * as RichText from 'src/components/rich-text/RichText';
import * as PortalFeatureProviders from 'src/components/providers/PortalFeatureProviders';
import * as Promo from 'src/components/promo/Promo';
import * as PartialDesignDynamicPlaceholder from 'src/components/partial-design-dynamic-placeholder/PartialDesignDynamicPlaceholder';
import * as PageContent from 'src/components/page-content/PageContent';
import * as Navigation from 'src/components/navigation/Navigation';
import * as LinkList from 'src/components/link-list/LinkList';
import * as DashboardLayout from 'src/components/layout/DashboardLayout';
import * as UserProfile from 'src/components/layout/Sidebar/UserProfile';
import * as SidebarNavSection from 'src/components/layout/Sidebar/SidebarNavSection';
import * as SidebarNavItem from 'src/components/layout/Sidebar/SidebarNavItem';
import * as Sidebar from 'src/components/layout/Sidebar/Sidebar';
import * as UserMenu from 'src/components/layout/Header/UserMenu';
import * as SearchBar from 'src/components/layout/Header/SearchBar';
import * as Notifications from 'src/components/layout/Header/Notifications';
import * as NotificationBell from 'src/components/layout/Header/NotificationBell';
import * as Language from 'src/components/layout/Header/Language';
import * as Help from 'src/components/layout/Header/Help';
import * as Header from 'src/components/layout/Header/Header';
import * as HeaderClient from 'src/components/layout/Header/partial/HeaderClient';
import * as LocalizedImageFieldLink from 'src/components/image/LocalizedImageFieldLink';
import * as Image from 'src/components/image/Image';
import * as DashboardWelcome from 'src/components/dashboard/DashboardWelcome';
import * as ViewMyProfiletype from 'src/components/core/ViewMyProfile/ViewMyProfile.type';
import * as ViewMyProfile from 'src/components/core/ViewMyProfile/ViewMyProfile';
import * as ViewMyProfileDefaultvariant from 'src/components/core/ViewMyProfile/variants/ViewMyProfileDefault.variant';
import * as SupportBanner from 'src/components/core/ViewMyProfile/variants/components/SupportBanner';
import * as PersonalInfoCard from 'src/components/core/ViewMyProfile/variants/components/PersonalInfoCard';
import * as NoAccountCard from 'src/components/core/ViewMyProfile/variants/components/NoAccountCard';
import * as AccountCard from 'src/components/core/ViewMyProfile/variants/components/AccountCard';
import * as utilityLinksUtils from 'src/components/core/UtilityLinks/utilityLinksUtils';
import * as UtilityLinkstype from 'src/components/core/UtilityLinks/UtilityLinks.type';
import * as UtilityLinks from 'src/components/core/UtilityLinks/UtilityLinks';
import * as UtilityLinksDefaultvariant from 'src/components/core/UtilityLinks/variants/UtilityLinksDefault.variant';
import * as UtilityLinksClickTracker from 'src/components/core/UtilityLinks/partial/UtilityLinksClickTracker';
import * as UserProfileMenutype from 'src/components/core/UserProfileMenu/UserProfileMenu.type';
import * as UserProfileMenu from 'src/components/core/UserProfileMenu/UserProfileMenu';
import * as UserProfileMenuDefaultvariant from 'src/components/core/UserProfileMenu/variants/UserProfileMenuDefault.variant';
import * as UserProfileMenuContent from 'src/components/core/UserProfileMenu/variants/UserProfileMenuContent';
import * as UserInfotype from 'src/components/core/UserInfo/UserInfo.type';
import * as UserInfo from 'src/components/core/UserInfo/UserInfo';
import * as UserInfoDefaultvariant from 'src/components/core/UserInfo/variants/UserInfoDefault.variant';
import * as UserActionTilestype from 'src/components/core/UserActionTiles/UserActionTiles.type';
import * as UserActionTiles from 'src/components/core/UserActionTiles/UserActionTiles';
import * as UserActionTilesDefaultvariant from 'src/components/core/UserActionTiles/variants/UserActionTilesDefault.variant';
import * as RenderLocalizedLink from 'src/components/core/UserActionTiles/variants/components/RenderLocalizedLink';
import * as SearchComponenttype from 'src/components/core/SearchComponent/SearchComponent.type';
import * as SearchComponent from 'src/components/core/SearchComponent/SearchComponent';
import * as SearchComponentDefaultvariant from 'src/components/core/SearchComponent/variants/SearchComponentDefault.variant';
import * as ScriptContenttype from 'src/components/core/ScriptContent/ScriptContent.type';
import * as ScriptContent from 'src/components/core/ScriptContent/ScriptContent';
import * as RolePermissionstype from 'src/components/core/RolePermissions/RolePermissions.type';
import * as RolePermissions from 'src/components/core/RolePermissions/RolePermissions';
import * as RolePermissionsDefaultvariant from 'src/components/core/RolePermissions/variants/RolePermissionsDefault.variant';
import * as RolePermissionsSaveModal from 'src/components/core/RolePermissions/partial/RolePermissionsSaveModal';
import * as RolePermissionsAuditLog from 'src/components/core/RolePermissions/partial/RolePermissionsAuditLog';
import * as PermissionsTable from 'src/components/core/RolePermissions/partial/PermissionsTable';
import * as CheckmarkCell from 'src/components/core/RolePermissions/partial/CheckmarkCell';
import * as auditLogTypes from 'src/components/core/RolePermissions/partial/auditLogTypes';
import * as RecentQuoteWidgettype from 'src/components/core/RecentQuoteWidget/RecentQuoteWidget.type';
import * as RecentQuoteWidget from 'src/components/core/RecentQuoteWidget/RecentQuoteWidget';
import * as RecentQuoteWidgetDefaultvariant from 'src/components/core/RecentQuoteWidget/variants/RecentQuoteWidgetDefault.variant';
import * as RecentOrderWidgettype from 'src/components/core/RecentOrderWidget/RecentOrderWidget.type';
import * as RecentOrderWidget from 'src/components/core/RecentOrderWidget/RecentOrderWidget';
import * as RecentOrderWidgetDefaultvariant from 'src/components/core/RecentOrderWidget/variants/RecentOrderWidgetDefault.variant';
import * as RenderStatusIcon from 'src/components/core/RecentOrderWidget/components/RenderStatusIcon';
import * as QuoteDetailtype from 'src/components/core/QuoteDetail/QuoteDetail.type';
import * as QuoteDetail from 'src/components/core/QuoteDetail/QuoteDetail';
import * as QuoteDetailDefaultvariant from 'src/components/core/QuoteDetail/variants/QuoteDetailDefault.variant';
import * as QuoteDetailStatusBadges from 'src/components/core/QuoteDetail/partial/QuoteDetailStatusBadges';
import * as QuoteDetailHeader from 'src/components/core/QuoteDetail/partial/QuoteDetailHeader';
import * as QuoteDetailEmptyState from 'src/components/core/QuoteDetail/partial/QuoteDetailEmptyState';
import * as QuoteDetailBackIcon from 'src/components/core/QuoteDetail/partial/QuoteDetailBackIcon';
import * as portalShellSideNavUtils from 'src/components/core/PortalShellSideNav/portalShellSideNavUtils';
import * as PortalShellSideNavtype from 'src/components/core/PortalShellSideNav/PortalShellSideNav.type';
import * as PortalShellSideNav from 'src/components/core/PortalShellSideNav/PortalShellSideNav';
import * as PortalShellSideNavDefaultvariant from 'src/components/core/PortalShellSideNav/variants/PortalShellSideNavDefault.variant';
import * as SwitchCompanyModal from 'src/components/core/PortalShellSideNav/components/SwitchCompanyModal';
import * as PortalShelltype from 'src/components/core/PortalShell/PortalShell.type';
import * as PortalShell from 'src/components/core/PortalShell/PortalShell';
import * as PortalShellDefaultvariant from 'src/components/core/PortalShell/variants/PortalShellDefault.variant';
import * as PortalShellHeaderShell from 'src/components/core/PortalShell/partial/PortalShellHeaderShell';
import * as PortalShellClient from 'src/components/core/PortalShell/partial/PortalShellClient';
import * as MobileNavToggle from 'src/components/core/PortalShell/partial/MobileNavToggle';
import * as tabFilterLooseFields from 'src/components/core/OrderManagement/tabFilterLooseFields';
import * as OrderManagementQuoteRequesttype from 'src/components/core/OrderManagement/OrderManagementQuoteRequest.type';
import * as orderManagementLabels from 'src/components/core/OrderManagement/orderManagementLabels';
import * as OrderManagementtype from 'src/components/core/OrderManagement/OrderManagement.type';
import * as OrderManagement from 'src/components/core/OrderManagement/OrderManagement';
import * as OrderManagementDefaultvariant from 'src/components/core/OrderManagement/variants/OrderManagementDefault.variant';
import * as ShipmentsToolbar from 'src/components/core/OrderManagement/tabs/shipments/ShipmentsToolbar';
import * as ShipmentsPackingSlipButton from 'src/components/core/OrderManagement/tabs/shipments/ShipmentsPackingSlipButton';
import * as ShipmentsMobileCards from 'src/components/core/OrderManagement/tabs/shipments/ShipmentsMobileCards';
import * as ShipmentsExternalLinkIcon from 'src/components/core/OrderManagement/tabs/shipments/ShipmentsExternalLinkIcon';
import * as ShipmentsDesktopTable from 'src/components/core/OrderManagement/tabs/shipments/ShipmentsDesktopTable';
import * as renderQuoteExpiresIn from 'src/components/core/OrderManagement/tabs/quotes/renderQuoteExpiresIn';
import * as quoteTabFilterFields from 'src/components/core/OrderManagement/tabs/quotes/quoteTabFilterFields';
import * as QuotesSearchBarFilter from 'src/components/core/OrderManagement/tabs/quotes/QuotesSearchBarFilter';
import * as QuotesMobileCards from 'src/components/core/OrderManagement/tabs/quotes/QuotesMobileCards';
import * as QuotesDesktopTable from 'src/components/core/OrderManagement/tabs/quotes/QuotesDesktopTable';
import * as OrdersManagementToolbar from 'src/components/core/OrderManagement/tabs/orders/OrdersManagementToolbar';
import * as renderInvoiceDueIn from 'src/components/core/OrderManagement/tabs/invoices/renderInvoiceDueIn';
import * as invoiceTabFilterFields from 'src/components/core/OrderManagement/tabs/invoices/invoiceTabFilterFields';
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
import * as OrderManagementHighlightedText from 'src/components/core/OrderManagement/partial/OrderManagementHighlightedText';
import * as OrderManagementHeader from 'src/components/core/OrderManagement/partial/OrderManagementHeader';
import * as OrderManagementFilterPanelPartials from 'src/components/core/OrderManagement/partial/OrderManagementFilterPanelPartials';
import * as OrderManagementExpandedMatchingLine from 'src/components/core/OrderManagement/partial/OrderManagementExpandedMatchingLine';
import * as OrderManagementEmptyState from 'src/components/core/OrderManagement/partial/OrderManagementEmptyState';
import * as OrderManagementDesktopTable from 'src/components/core/OrderManagement/partial/OrderManagementDesktopTable';
import * as OrderManagementDateRangeField from 'src/components/core/OrderManagement/partial/OrderManagementDateRangeField';
import * as OrderManagementDatePanel from 'src/components/core/OrderManagement/partial/OrderManagementDatePanel';
import * as OrderManagementChipRow from 'src/components/core/OrderManagement/partial/OrderManagementChipRow';
import * as computeOrderManagementDatePanelLayout from 'src/components/core/OrderManagement/partial/computeOrderManagementDatePanelLayout';
import * as QuoteRequestSubmittingAs from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestSubmittingAs';
import * as QuoteRequestReviewStep from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestReviewStep';
import * as QuoteRequestLineStep from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestLineStep';
import * as QuoteRequestGeneralStep from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestGeneralStep';
import * as QuoteRequestDrawer from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDrawer';
import * as QuoteRequestDiscardDialog from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestDiscardDialog';
import * as QuoteRequestConfirmationStep from 'src/components/core/OrderManagement/partial/QuoteRequest/QuoteRequestConfirmationStep';
import * as orderDetailLabels from 'src/components/core/OrderDetail/orderDetailLabels';
import * as OrderDetailtype from 'src/components/core/OrderDetail/OrderDetail.type';
import * as OrderDetail from 'src/components/core/OrderDetail/OrderDetail';
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
import * as LanguageSwitchertype from 'src/components/core/LanguageSwitcher/LanguageSwitcher.type';
import * as LanguageSwitcher from 'src/components/core/LanguageSwitcher/LanguageSwitcher';
import * as LanguageSwitcherDefaultvariant from 'src/components/core/LanguageSwitcher/variants/LanguageSwitcherDefault.variant';
import * as GlobalSearchtype from 'src/components/core/GlobalSearch/GlobalSearch.type';
import * as GlobalSearch from 'src/components/core/GlobalSearch/GlobalSearch';
import * as GlobalSearchDefaultvariant from 'src/components/core/GlobalSearch/variants/GlobalSearchDefault.variant';
import * as SearchFormContent from 'src/components/core/GlobalSearch/components/SearchFormContent';
import * as CategoryPromptDropdown from 'src/components/core/GlobalSearch/components/CategoryPromptDropdown';
import * as FeaturedContentTiletype from 'src/components/core/FeaturedContentTile/FeaturedContentTile.type';
import * as FeaturedContentTile from 'src/components/core/FeaturedContentTile/FeaturedContentTile';
import * as FeaturedContentTileDefaultvariant from 'src/components/core/FeaturedContentTile/variants/FeaturedContentTileDefault.variant';
import * as FeaturedContenttype from 'src/components/core/FeaturedContent/FeaturedContent.type';
import * as FeaturedContent from 'src/components/core/FeaturedContent/FeaturedContent';
import * as FeaturedContentNoCardvariant from 'src/components/core/FeaturedContent/variants/FeaturedContentNoCard.variant';
import * as FeaturedContentLobbyExperiencevariant from 'src/components/core/FeaturedContent/variants/FeaturedContentLobbyExperience.variant';
import * as FeaturedContentDefaultvariant from 'src/components/core/FeaturedContent/variants/FeaturedContentDefault.variant';
import * as FullHeightBackground from 'src/components/core/FeaturedContent/variants/components/FullHeightBackground';
import * as FeaturedContentCardSection from 'src/components/core/FeaturedContent/variants/components/FeaturedContentCardSection';
import * as FeaturedContentCard from 'src/components/core/FeaturedContent/variants/components/FeaturedContentCard';
import * as DashboardSplittertype from 'src/components/core/DashboardSplitter/DashboardSplitter.type';
import * as DashboardSplitter from 'src/components/core/DashboardSplitter/DashboardSplitter';
import * as DashboardSplitterDefaultvariant from 'src/components/core/DashboardSplitter/variants/DashboardSplitterDefault.variant';
import * as DashboardInfoBannertype from 'src/components/core/DashboardInfoBanner/DashboardInfoBanner.type';
import * as DashboardInfoBanner from 'src/components/core/DashboardInfoBanner/DashboardInfoBanner';
import * as DashboardInfoBannerDefaultvariant from 'src/components/core/DashboardInfoBanner/variants/DashboardInfoBannerDefault.variant';
import * as DashboardRecentWidgetListState from 'src/components/core/dashboard-recent-widgets/DashboardRecentWidgetListState';
import * as DashboardRecentRowMenu from 'src/components/core/dashboard-recent-widgets/DashboardRecentRowMenu';
import * as customerSupportComponentUtils from 'src/components/core/CustomerSupportComponent/customerSupportComponentUtils';
import * as CustomerSupportComponenttype from 'src/components/core/CustomerSupportComponent/CustomerSupportComponent.type';
import * as CustomerSupportComponent from 'src/components/core/CustomerSupportComponent/CustomerSupportComponent';
import * as CustomerSupportComponentClient from 'src/components/core/CustomerSupportComponent/partial/CustomerSupportComponentClient';
import * as ContactSupporttype from 'src/components/core/ContactSupport/ContactSupport.type';
import * as ContactSupport from 'src/components/core/ContactSupport/ContactSupport';
import * as ContactSupportPanelContent from 'src/components/core/ContactSupport/variants/ContactSupportPanelContent';
import * as ContactSupportDefaultvariant from 'src/components/core/ContactSupport/variants/ContactSupportDefault.variant';
import * as ColumnSpiltterClientSidetype from 'src/components/core/ColumnSpiltterClientSide/ColumnSpiltterClientSide.type';
import * as ColumnSpiltterClientSide from 'src/components/core/ColumnSpiltterClientSide/ColumnSpiltterClientSide';
import * as ColumnSpiltterClientSideDefaultvariant from 'src/components/core/ColumnSpiltterClientSide/variants/ColumnSpiltterClientSideDefault.variant';
import * as Authtype from 'src/components/core/Auth/Auth.type';
import * as Auth from 'src/components/core/Auth/Auth';
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
import * as AuthComponenttypes from 'src/components/core/Auth/components/AuthComponent/AuthComponent.types';
import * as AuthComponent from 'src/components/core/Auth/components/AuthComponent/AuthComponent';
import * as ContentBlock from 'src/components/content-block/ContentBlock';
import * as Container from 'src/components/container/Container';
import * as ColumnSplitter from 'src/components/column-splitter/ColumnSplitter';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCServerWrapper],
  ['FEaaSWrapper', FEaaSServerWrapper],
  ['Form', Form],
  ['utility-components', { ...utilitycomponents, componentType: 'client' }],
  ['Textarea', { ...Textarea, componentType: 'client' }],
  ['StatusBadge', { ...StatusBadge, componentType: 'client' }],
  ['Select', { ...Select, componentType: 'client' }],
  ['Popover', { ...Popover, componentType: 'client' }],
  ['Link', { ...Link, componentType: 'client' }],
  ['Input', { ...Input, componentType: 'client' }],
  ['Heading', { ...Heading, componentType: 'client' }],
  ['Card', { ...Card }],
  ['buttonVariants', { ...buttonVariants, componentType: 'client' }],
  ['Button', { ...Button, componentType: 'client' }],
  ['AlertBox', { ...AlertBox, componentType: 'client' }],
  ['utils', { ...utils }],
  ['tableVariants', { ...tableVariants, componentType: 'client' }],
  ['Table', { ...Tabletypes, ...Table, componentType: 'client' }],
  ['hooks', { ...hooks, componentType: 'client' }],
  ['Title', { ...Title }],
  ['ToastProvider', { ...ToastProvider, componentType: 'client' }],
  ['Toast', { ...Toast, componentType: 'client' }],
  ['SuccessMessage', { ...SuccessMessage }],
  ['SubmittingAsHelpTooltip', { ...SubmittingAsHelpTooltip, componentType: 'client' }],
  ['PortalShellChromeLoading', { ...PortalShellChromeLoading, componentType: 'client' }],
  ['PortalRouteLoadingFallback', { ...PortalRouteLoadingFallback, componentType: 'client' }],
  ['PermissionGate', { ...PermissionGate, componentType: 'client' }],
  ['PagePermissionFallback', { ...PagePermissionFallback, componentType: 'client' }],
  ['AccessDenied', { ...AccessDenied, componentType: 'client' }],
  ['OrderManagementMobileCardShell', { ...OrderManagementMobileCardShell, componentType: 'client' }],
  ['Modal', { ...Modal, componentType: 'client' }],
  ['LoadingSkeleton', { ...LoadingSkeleton, componentType: 'client' }],
  ['LinkRender', { ...LinkRender, componentType: 'client' }],
  ['InfoBanner', { ...InfoBanner }],
  ['UserKeyIcon', { ...UserKeyIcon, componentType: 'client' }],
  ['SvgIcon', { ...SvgIcon }],
  ['SupportTicketsIcon', { ...SupportTicketsIcon, componentType: 'client' }],
  ['SupportIcon', { ...SupportIcon, componentType: 'client' }],
  ['SupportCaseIcon', { ...SupportCaseIcon, componentType: 'client' }],
  ['StackIcon', { ...StackIcon, componentType: 'client' }],
  ['ShipmentsIcon', { ...ShipmentsIcon, componentType: 'client' }],
  ['ShipmentIcon', { ...ShipmentIcon, componentType: 'client' }],
  ['SearchIcon', { ...SearchIcon, componentType: 'client' }],
  ['RequestUpdatedQuoteActionIcon', { ...RequestUpdatedQuoteActionIcon, componentType: 'client' }],
  ['RequestDocumentsActionIcon', { ...RequestDocumentsActionIcon, componentType: 'client' }],
  ['QuestionCircleIcon', { ...QuestionCircleIcon, componentType: 'client' }],
  ['ProfileIcon', { ...ProfileIcon, componentType: 'client' }],
  ['PlusIcon', { ...PlusIcon, componentType: 'client' }],
  ['PhoneIcon', { ...PhoneIcon, componentType: 'client' }],
  ['PartsIcon', { ...PartsIcon, componentType: 'client' }],
  ['OrganizationIcon', { ...OrganizationIcon, componentType: 'client' }],
  ['OrdersIcon', { ...OrdersIcon, componentType: 'client' }],
  ['OrderIcon', { ...OrderIcon, componentType: 'client' }],
  ['NotificationIcon', { ...NotificationIcon, componentType: 'client' }],
  ['LogoutIcon', { ...LogoutIcon, componentType: 'client' }],
  ['LogoIcon', { ...LogoIcon }],
  ['LanguageCheckIcon', { ...LanguageCheckIcon, componentType: 'client' }],
  ['InvoicesIcon', { ...InvoicesIcon, componentType: 'client' }],
  ['index', { ...index }],
  ['Icon', { ...Icon }],
  ['HelpCenterIcon', { ...HelpCenterIcon, componentType: 'client' }],
  ['HamburgerMenuIcon', { ...HamburgerMenuIcon, componentType: 'client' }],
  ['GlobeIcon', { ...GlobeIcon, componentType: 'client' }],
  ['ExpandedLogoIcon', { ...ExpandedLogoIcon }],
  ['EmailIcon', { ...EmailIcon, componentType: 'client' }],
  ['EditIcon', { ...EditIcon, componentType: 'client' }],
  ['DoubleChevronIcon', { ...DoubleChevronIcon, componentType: 'client' }],
  ['DocumentsIcon', { ...DocumentsIcon, componentType: 'client' }],
  ['DocumentIcon', { ...DocumentIcon, componentType: 'client' }],
  ['DocumentEditIcon', { ...DocumentEditIcon, componentType: 'client' }],
  ['CollapsedUsersIcon', { ...CollapsedUsersIcon, componentType: 'client' }],
  ['CollapsedSupportIcon', { ...CollapsedSupportIcon, componentType: 'client' }],
  ['CollapsedRolesIcon', { ...CollapsedRolesIcon, componentType: 'client' }],
  ['CollapsedResourcesIcon', { ...CollapsedResourcesIcon, componentType: 'client' }],
  ['CollapsedOrderIcon', { ...CollapsedOrderIcon, componentType: 'client' }],
  ['CollapsedLogoIcon', { ...CollapsedLogoIcon }],
  ['CollapsedDocumentsIcon', { ...CollapsedDocumentsIcon, componentType: 'client' }],
  ['CollapsedDashboardIcon', { ...CollapsedDashboardIcon, componentType: 'client' }],
  ['CloseIcon', { ...CloseIcon, componentType: 'client' }],
  ['ChevronUpIcon', { ...ChevronUpIcon, componentType: 'client' }],
  ['ChevronRightIcon', { ...ChevronRightIcon, componentType: 'client' }],
  ['ChevronLeftIcon', { ...ChevronLeftIcon, componentType: 'client' }],
  ['ChevronDownIcon', { ...ChevronDownIcon, componentType: 'client' }],
  ['CheckIcon', { ...CheckIcon, componentType: 'client' }],
  ['HelpLinks', { ...HelpLinks }],
  ['ErrorMessage', { ...ErrorMessage }],
  ['EmptyStatePanel', { ...EmptyStatePanel, componentType: 'client' }],
  ['DocumentRequestPanel', { ...DocumentRequestPanel, componentType: 'client' }],
  ['DetailPageHeader', { ...DetailPageHeadertype, ...DetailPageHeader, componentType: 'client' }],
  ['ContextualPanel', { ...ContextualPanel, componentType: 'client' }],
  ['AuthHeader', { ...AuthHeader }],
  ['AuthCard', { ...AuthCard }],
  ['AppDialogShell', { ...AppDialogShell, componentType: 'client' }],
  ['RowSplitter', { ...RowSplitter }],
  ['types', { ...types }],
  ['RolesPageHeader', { ...RolesPageHeader, componentType: 'client' }],
  ['PermissionsTableComponent', { ...PermissionsTableComponent, componentType: 'client' }],
  ['CheckmarkCellComponent', { ...CheckmarkCellComponent }],
  ['AuditLog', { ...AuditLog, componentType: 'client' }],
  ['RichText', { ...RichText }],
  ['PortalFeatureProviders', { ...PortalFeatureProviders, componentType: 'client' }],
  ['Promo', { ...Promo }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['PageContent', { ...PageContent }],
  ['Navigation', { ...Navigation, componentType: 'client' }],
  ['LinkList', { ...LinkList }],
  ['DashboardLayout', { ...DashboardLayout, componentType: 'client' }],
  ['UserProfile', { ...UserProfile, componentType: 'client' }],
  ['SidebarNavSection', { ...SidebarNavSection }],
  ['SidebarNavItem', { ...SidebarNavItem, componentType: 'client' }],
  ['Sidebar', { ...Sidebar, componentType: 'client' }],
  ['UserMenu', { ...UserMenu, componentType: 'client' }],
  ['SearchBar', { ...SearchBar, componentType: 'client' }],
  ['Notifications', { ...Notifications, componentType: 'client' }],
  ['NotificationBell', { ...NotificationBell, componentType: 'client' }],
  ['Language', { ...Language, componentType: 'client' }],
  ['Help', { ...Help, componentType: 'client' }],
  ['Header', { ...Header }],
  ['HeaderClient', { ...HeaderClient, componentType: 'client' }],
  ['LocalizedImageFieldLink', { ...LocalizedImageFieldLink, componentType: 'client' }],
  ['Image', { ...Image }],
  ['DashboardWelcome', { ...DashboardWelcome, componentType: 'client' }],
  ['ViewMyProfile', { ...ViewMyProfiletype, ...ViewMyProfile }],
  ['ViewMyProfileDefault', { ...ViewMyProfileDefaultvariant }],
  ['SupportBanner', { ...SupportBanner, componentType: 'client' }],
  ['PersonalInfoCard', { ...PersonalInfoCard, componentType: 'client' }],
  ['NoAccountCard', { ...NoAccountCard, componentType: 'client' }],
  ['AccountCard', { ...AccountCard, componentType: 'client' }],
  ['utilityLinksUtils', { ...utilityLinksUtils }],
  ['UtilityLinks', { ...UtilityLinkstype, ...UtilityLinks }],
  ['UtilityLinksDefault', { ...UtilityLinksDefaultvariant }],
  ['UtilityLinksClickTracker', { ...UtilityLinksClickTracker, componentType: 'client' }],
  ['UserProfileMenu', { ...UserProfileMenutype, ...UserProfileMenu }],
  ['UserProfileMenuDefault', { ...UserProfileMenuDefaultvariant }],
  ['UserProfileMenuContent', { ...UserProfileMenuContent, componentType: 'client' }],
  ['UserInfo', { ...UserInfotype, ...UserInfo }],
  ['UserInfoDefault', { ...UserInfoDefaultvariant }],
  ['UserActionTiles', { ...UserActionTilestype, ...UserActionTiles }],
  ['UserActionTilesDefault', { ...UserActionTilesDefaultvariant }],
  ['RenderLocalizedLink', { ...RenderLocalizedLink, componentType: 'client' }],
  ['SearchComponent', { ...SearchComponenttype, ...SearchComponent, componentType: 'client' }],
  ['SearchComponentDefault', { ...SearchComponentDefaultvariant }],
  ['ScriptContent', { ...ScriptContenttype, ...ScriptContent, componentType: 'client' }],
  ['RolePermissions', { ...RolePermissionstype, ...RolePermissions }],
  ['RolePermissionsDefault', { ...RolePermissionsDefaultvariant }],
  ['RolePermissionsSaveModal', { ...RolePermissionsSaveModal, componentType: 'client' }],
  ['RolePermissionsAuditLog', { ...RolePermissionsAuditLog, componentType: 'client' }],
  ['PermissionsTable', { ...PermissionsTable, componentType: 'client' }],
  ['CheckmarkCell', { ...CheckmarkCell }],
  ['auditLogTypes', { ...auditLogTypes }],
  ['RecentQuoteWidget', { ...RecentQuoteWidgettype, ...RecentQuoteWidget, componentType: 'client' }],
  ['RecentQuoteWidgetDefault', { ...RecentQuoteWidgetDefaultvariant }],
  ['RecentOrderWidget', { ...RecentOrderWidgettype, ...RecentOrderWidget, componentType: 'client' }],
  ['RecentOrderWidgetDefault', { ...RecentOrderWidgetDefaultvariant }],
  ['RenderStatusIcon', { ...RenderStatusIcon, componentType: 'client' }],
  ['QuoteDetail', { ...QuoteDetailtype, ...QuoteDetail }],
  ['QuoteDetailDefault', { ...QuoteDetailDefaultvariant }],
  ['QuoteDetailStatusBadges', { ...QuoteDetailStatusBadges }],
  ['QuoteDetailHeader', { ...QuoteDetailHeader, componentType: 'client' }],
  ['QuoteDetailEmptyState', { ...QuoteDetailEmptyState, componentType: 'client' }],
  ['QuoteDetailBackIcon', { ...QuoteDetailBackIcon }],
  ['portalShellSideNavUtils', { ...portalShellSideNavUtils }],
  ['PortalShellSideNav', { ...PortalShellSideNavtype, ...PortalShellSideNav }],
  ['PortalShellSideNavDefault', { ...PortalShellSideNavDefaultvariant }],
  ['SwitchCompanyModal', { ...SwitchCompanyModal, componentType: 'client' }],
  ['PortalShell', { ...PortalShelltype, ...PortalShell }],
  ['PortalShellDefault', { ...PortalShellDefaultvariant }],
  ['PortalShellHeaderShell', { ...PortalShellHeaderShell }],
  ['PortalShellClient', { ...PortalShellClient, componentType: 'client' }],
  ['MobileNavToggle', { ...MobileNavToggle, componentType: 'client' }],
  ['tabFilterLooseFields', { ...tabFilterLooseFields }],
  ['OrderManagementQuoteRequest', { ...OrderManagementQuoteRequesttype }],
  ['orderManagementLabels', { ...orderManagementLabels }],
  ['OrderManagement', { ...OrderManagementtype, ...OrderManagement }],
  ['OrderManagementDefault', { ...OrderManagementDefaultvariant }],
  ['ShipmentsToolbar', { ...ShipmentsToolbar, componentType: 'client' }],
  ['ShipmentsPackingSlipButton', { ...ShipmentsPackingSlipButton, componentType: 'client' }],
  ['ShipmentsMobileCards', { ...ShipmentsMobileCards, componentType: 'client' }],
  ['ShipmentsExternalLinkIcon', { ...ShipmentsExternalLinkIcon }],
  ['ShipmentsDesktopTable', { ...ShipmentsDesktopTable, componentType: 'client' }],
  ['renderQuoteExpiresIn', { ...renderQuoteExpiresIn, componentType: 'client' }],
  ['quoteTabFilterFields', { ...quoteTabFilterFields }],
  ['QuotesSearchBarFilter', { ...QuotesSearchBarFilter, componentType: 'client' }],
  ['QuotesMobileCards', { ...QuotesMobileCards, componentType: 'client' }],
  ['QuotesDesktopTable', { ...QuotesDesktopTable, componentType: 'client' }],
  ['OrdersManagementToolbar', { ...OrdersManagementToolbar, componentType: 'client' }],
  ['renderInvoiceDueIn', { ...renderInvoiceDueIn, componentType: 'client' }],
  ['invoiceTabFilterFields', { ...invoiceTabFilterFields }],
  ['InvoicesSearchBarFilter', { ...InvoicesSearchBarFilter, componentType: 'client' }],
  ['InvoicesMobileCards', { ...InvoicesMobileCards, componentType: 'client' }],
  ['InvoicesDesktopTable', { ...InvoicesDesktopTable, componentType: 'client' }],
  ['InvoiceDownloadButton', { ...InvoiceDownloadButton, componentType: 'client' }],
  ['RenderSelectedChip', { ...RenderSelectedChip, componentType: 'client' }],
  ['OrderManagementToolbar', { ...OrderManagementToolbar, componentType: 'client' }],
  ['OrderManagementTableShared', { ...OrderManagementTableShared, componentType: 'client' }],
  ['OrderManagementTabBar', { ...OrderManagementTabBar, componentType: 'client' }],
  ['OrderManagementRangeCalendar', { ...OrderManagementRangeCalendar, componentType: 'client' }],
  ['OrderManagementPagination', { ...OrderManagementPagination, componentType: 'client' }],
  ['OrderManagementMobileSheets', { ...OrderManagementMobileSheets, componentType: 'client' }],
  ['OrderManagementMobileCards', { ...OrderManagementMobileCards, componentType: 'client' }],
  ['OrderManagementHighlightedText', { ...OrderManagementHighlightedText }],
  ['OrderManagementHeader', { ...OrderManagementHeader, componentType: 'client' }],
  ['OrderManagementFilterPanelPartials', { ...OrderManagementFilterPanelPartials, componentType: 'client' }],
  ['OrderManagementExpandedMatchingLine', { ...OrderManagementExpandedMatchingLine, componentType: 'client' }],
  ['OrderManagementEmptyState', { ...OrderManagementEmptyState, componentType: 'client' }],
  ['OrderManagementDesktopTable', { ...OrderManagementDesktopTable, componentType: 'client' }],
  ['OrderManagementDateRangeField', { ...OrderManagementDateRangeField, componentType: 'client' }],
  ['OrderManagementDatePanel', { ...OrderManagementDatePanel, componentType: 'client' }],
  ['OrderManagementChipRow', { ...OrderManagementChipRow, componentType: 'client' }],
  ['computeOrderManagementDatePanelLayout', { ...computeOrderManagementDatePanelLayout }],
  ['QuoteRequestSubmittingAs', { ...QuoteRequestSubmittingAs, componentType: 'client' }],
  ['QuoteRequestReviewStep', { ...QuoteRequestReviewStep, componentType: 'client' }],
  ['QuoteRequestLineStep', { ...QuoteRequestLineStep, componentType: 'client' }],
  ['QuoteRequestGeneralStep', { ...QuoteRequestGeneralStep, componentType: 'client' }],
  ['QuoteRequestDrawer', { ...QuoteRequestDrawer, componentType: 'client' }],
  ['QuoteRequestDiscardDialog', { ...QuoteRequestDiscardDialog, componentType: 'client' }],
  ['QuoteRequestConfirmationStep', { ...QuoteRequestConfirmationStep, componentType: 'client' }],
  ['orderDetailLabels', { ...orderDetailLabels }],
  ['OrderDetail', { ...OrderDetailtype, ...OrderDetail }],
  ['OrderDetailDefault', { ...OrderDetailDefaultvariant }],
  ['ShipmentInformationPanel', { ...ShipmentInformationPanel, componentType: 'client' }],
  ['RelatedDocumentsPanel', { ...RelatedDocumentsPanel, componentType: 'client' }],
  ['orderLineItemColumnValue', { ...orderLineItemColumnValue, componentType: 'client' }],
  ['OrderItems', { ...OrderItems, componentType: 'client' }],
  ['OrderItemRow', { ...OrderItemRow, componentType: 'client' }],
  ['OrderItemMobileCard', { ...OrderItemMobileCard, componentType: 'client' }],
  ['OrderDetailPagination', { ...OrderDetailPagination, componentType: 'client' }],
  ['OrderDetailHeader', { ...OrderDetailHeader, componentType: 'client' }],
  ['OrderDetailEmptyState', { ...OrderDetailEmptyState, componentType: 'client' }],
  ['BillingInvoicesPanel', { ...BillingInvoicesPanel, componentType: 'client' }],
  ['LanguageSwitcher', { ...LanguageSwitchertype, ...LanguageSwitcher }],
  ['LanguageSwitcherDefault', { ...LanguageSwitcherDefaultvariant }],
  ['GlobalSearch', { ...GlobalSearchtype, ...GlobalSearch }],
  ['GlobalSearchDefault', { ...GlobalSearchDefaultvariant }],
  ['SearchFormContent', { ...SearchFormContent, componentType: 'client' }],
  ['CategoryPromptDropdown', { ...CategoryPromptDropdown, componentType: 'client' }],
  ['FeaturedContentTile', { ...FeaturedContentTiletype, ...FeaturedContentTile, componentType: 'client' }],
  ['FeaturedContentTileDefault', { ...FeaturedContentTileDefaultvariant }],
  ['FeaturedContent', { ...FeaturedContenttype, ...FeaturedContent }],
  ['FeaturedContentNoCard', { ...FeaturedContentNoCardvariant }],
  ['FeaturedContentLobbyExperience', { ...FeaturedContentLobbyExperiencevariant }],
  ['FeaturedContentDefault', { ...FeaturedContentDefaultvariant }],
  ['FullHeightBackground', { ...FullHeightBackground, componentType: 'client' }],
  ['FeaturedContentCardSection', { ...FeaturedContentCardSection, componentType: 'client' }],
  ['FeaturedContentCard', { ...FeaturedContentCard }],
  ['DashboardSplitter', { ...DashboardSplittertype, ...DashboardSplitter, componentType: 'client' }],
  ['DashboardSplitterDefault', { ...DashboardSplitterDefaultvariant }],
  ['DashboardInfoBanner', { ...DashboardInfoBannertype, ...DashboardInfoBanner }],
  ['DashboardInfoBannerDefault', { ...DashboardInfoBannerDefaultvariant }],
  ['DashboardRecentWidgetListState', { ...DashboardRecentWidgetListState, componentType: 'client' }],
  ['DashboardRecentRowMenu', { ...DashboardRecentRowMenu, componentType: 'client' }],
  ['customerSupportComponentUtils', { ...customerSupportComponentUtils }],
  ['CustomerSupportComponent', { ...CustomerSupportComponenttype, ...CustomerSupportComponent }],
  ['CustomerSupportComponentClient', { ...CustomerSupportComponentClient, componentType: 'client' }],
  ['ContactSupport', { ...ContactSupporttype, ...ContactSupport }],
  ['ContactSupportPanelContent', { ...ContactSupportPanelContent, componentType: 'client' }],
  ['ContactSupportDefault', { ...ContactSupportDefaultvariant }],
  ['ColumnSpiltterClientSide', { ...ColumnSpiltterClientSidetype, ...ColumnSpiltterClientSide }],
  ['ColumnSpiltterClientSideDefault', { ...ColumnSpiltterClientSideDefaultvariant }],
  ['Auth', { ...Authtype, ...Auth }],
  ['AuthDefault', { ...AuthDefaultvariant }],
  ['OktaSignInWidget', { ...OktaSignInWidget, componentType: 'client' }],
  ['OktaResetPasswordWidget', { ...OktaResetPasswordWidget, componentType: 'client' }],
  ['OktaRegisterWidget', { ...OktaRegisterWidget, componentType: 'client' }],
  ['ResetPasswordSuccess', { ...ResetPasswordSuccess, componentType: 'client' }],
  ['RegisterSuccess', { ...RegisterSuccess, componentType: 'client' }],
  ['AuthResetPassword', { ...AuthResetPassword, componentType: 'client' }],
  ['AuthRegister', { ...AuthRegister, componentType: 'client' }],
  ['AuthLogin', { ...AuthLogin, componentType: 'client' }],
  ['WidgetBackButton', { ...WidgetBackButton, componentType: 'client' }],
  ['AuthFooter', { ...AuthFooter, componentType: 'client' }],
  ['AuthComponent', { ...AuthComponenttypes, ...AuthComponent }],
  ['ContentBlock', { ...ContentBlock }],
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
]);

export default componentMap;
