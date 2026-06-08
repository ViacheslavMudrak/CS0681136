// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as MediaCard from 'src/components/ui/MediaCard';
import * as Link from 'src/components/ui/Link';
import * as ctaVariants from 'src/components/ui/ctaVariants';
import * as buttonVariants from 'src/components/ui/buttonVariants';
import * as Button from 'src/components/ui/Button';
import * as alertBoxVariants from 'src/components/ui/alertBoxVariants';
import * as TimelineImageModalclient from 'src/components/timeline/partial/TimelineImageModal.client';
import * as TimelineClient from 'src/components/timeline/partial/TimelineClient';
import * as TextBlockClient from 'src/components/textBlock/partial/TextBlockClient';
import * as TextAsideVideoBlock from 'src/components/text-aside/partial/TextAsideVideoBlock';
import * as TabsClient from 'src/components/tab/partial/TabsClient';
import * as SolutionsGroupClient from 'src/components/solutions-group/partial/SolutionsGroupClient';
import * as SearchBox from 'src/components/shared/SearchBox';
import * as Modal from 'src/components/shared/Modal';
import * as MediaCardView from 'src/components/shared/MediaCardView';
import * as LinkRenderer from 'src/components/shared/LinkRenderer';
import * as ButtonView from 'src/components/shared/ButtonView';
import * as ArticleBadge from 'src/components/shared/ArticleBadge';
import * as Video from 'src/components/shared/video/Video';
import * as BrightcoveModalPlayer from 'src/components/shared/video/BrightcoveModalPlayer';
import * as Section from 'src/components/shared/section/Section';
import * as BottomPlaceholder from 'src/components/shared/bottomPlaceholder/BottomPlaceholder';
import * as SearchResults from 'src/components/search/widgets/SearchResults';
import * as SearchPagination from 'src/components/search/widgets/SearchPagination';
import * as GlobalSearchBox from 'src/components/search/widgets/GlobalSearchBox';
import * as Filter from 'src/components/search/widgets/Filter';
import * as Facets from 'src/components/search/widgets/Facets';
import * as DropdownFacets from 'src/components/search/widgets/DropdownFacets';
import * as BeltFacets from 'src/components/search/widgets/BeltFacets';
import * as RenderSelectedFacets from 'src/components/search/widgets/PopupFacet/RenderSelectedFacets';
import * as RenderFacetList from 'src/components/search/widgets/PopupFacet/RenderFacetList';
import * as PopupFacet from 'src/components/search/widgets/PopupFacet/PopupFacet';
import * as SearchComponentClient from 'src/components/search/partial/SearchComponentClient';
import * as SearchBeltSeriesPageClient from 'src/components/search/partial/SearchBeltSeriesPageClient';
import * as SearchBeltFinderClient from 'src/components/search/partial/SearchBeltFinderClient';
import * as GlobalSearchClient from 'src/components/search/partial/GlobalSearchClient';
import * as ScriptContent from 'src/components/scriptContent/ScriptContent';
import * as RelatedCaseStudyBaseCardKindLabel from 'src/components/related-case-studies/partial/RelatedCaseStudyBaseCardKindLabel';
import * as ProductSegmentPartials from 'src/components/product-segment/partial/ProductSegmentPartials';
import * as ProductSegmentClient from 'src/components/product-segment/partial/ProductSegmentClient';
import * as ProductModalDialog from 'src/components/product-segment/partial/ProductModalDialog';
import * as useNavigationLinkForAppRouter from 'src/components/navigation/useNavigationLinkForAppRouter';
import * as Navigation from 'src/components/navigation/Navigation';
import * as UtilityBar from 'src/components/navigation/partial/UtilityBar';
import * as NavMainNavItem from 'src/components/navigation/partial/NavMainNavItem';
import * as NavigationSearchPartials from 'src/components/navigation/partial/NavigationSearchPartials';
import * as NavigationMobilePartials from 'src/components/navigation/partial/NavigationMobilePartials';
import * as NavigationMobileAtoms from 'src/components/navigation/partial/NavigationMobileAtoms';
import * as NavigationDesktopPartials from 'src/components/navigation/partial/NavigationDesktopPartials';
import * as MediaTileVideo from 'src/components/media-tile/partial/MediaTileVideo';
import * as MediaBoxVideoclient from 'src/components/media-box/partial/MediaBoxVideo.client';
import * as MediaBoxImageModalclient from 'src/components/media-box/partial/MediaBoxImageModal.client';
import * as MediaClient from 'src/components/media/partial/MediaClient';
import * as LocationListIntroNav from 'src/components/location-list/partial/LocationListIntroNav';
import * as LocalNavigationClient from 'src/components/local-navigation/partial/LocalNavigationClient';
import * as LinkGridClient from 'src/components/linkGrid/partial/LinkGridClient';
import * as LinkGridCard from 'src/components/linkGrid/partial/LinkGridCard';
import * as LinkCardClient from 'src/components/linkCards/partial/LinkCardClient';
import * as IntroductionClient from 'src/components/introduction/partial/IntroductionClient';
import * as HeadingComponentTitleclient from 'src/components/heading-component/partial/HeadingComponentTitle.client';
import * as FloatingFabFooterAwareWrap from 'src/components/floating-action-button/partial/FloatingFabFooterAwareWrap';
import * as FeaturedNewsReadMoreLink from 'src/components/featured-news/partial/FeaturedNewsReadMoreLink';
import * as FAQClient from 'src/components/faq/partial/FAQClient';
import * as Divider from 'src/components/divider/Divider';
import * as CountryLanguageDropdown from 'src/components/country-language-dropdown/CountryLanguageDropdown';
import * as CookieBannerClient from 'src/components/cookie-banner/partial/CookieBannerClient';
import * as TabAccordionTabPlaceholder from 'src/components/contentSwitcher/partial/TabAccordionTabPlaceholder';
import * as TabAccordion from 'src/components/contentSwitcher/partial/TabAccordion';
import * as DirectotyTable from 'src/components/contactDirectory/partial/DirectotyTable';
import * as ContactDirectoryClient from 'src/components/contactDirectory/partial/ContactDirectoryClient';
import * as CarouselClient from 'src/components/carousel/partial/CarouselClient';
import * as CardCarouselClient from 'src/components/cardCarousel/partial/CardCarouselClient';
import * as LinkVIew from 'src/components/callToAction/partial/LinkVIew';
import * as CallToActionClient from 'src/components/callToAction/partial/CallToActionClient';
import * as TextAsideCalloutEqualRowBands from 'src/components/callout/partial/TextAsideCalloutEqualRowBands';
import * as CADFilesCLient from 'src/components/cadFiles/partial/CADFilesCLient';
import * as BreadcrumbsClient from 'src/components/breadcrumbs/partial/BreadcrumbsClient';
import * as BillboardClient from 'src/components/billboard/partial/BillboardClient';
import * as BeltLandingLink from 'src/components/beltLanding/partial/BeltLandingLink';
import * as useBeltIdentifierFacetState from 'src/components/beltIdentifier/partial/useBeltIdentifierFacetState';
import * as BeltIdentifierSearchResult from 'src/components/beltIdentifier/partial/BeltIdentifierSearchResult';
import * as BeltIdentifierClient from 'src/components/beltIdentifier/partial/BeltIdentifierClient';
import * as Tools from 'src/components/belt/partial/Tools';
import * as Specification from 'src/components/belt/partial/Specification';
import * as SharedButton from 'src/components/belt/partial/SharedButton';
import * as ImageCarousel from 'src/components/belt/partial/ImageCarousel';
import * as Download from 'src/components/belt/partial/Download';
import * as BeltDetailComponent from 'src/components/belt/partial/BeltDetailComponent';
import * as BeltData from 'src/components/belt/partial/BeltData';
import * as BeltCardAccordion from 'src/components/belt/partial/BeltCardAccordion';
import * as ArticleBannerClient from 'src/components/articleBanner/partial/ArticleBannerClient';
import * as AlertBoxPartials from 'src/components/alert-box/partial/AlertBoxPartials';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['MediaCard', { ...MediaCard }],
  ['Link', { ...Link }],
  ['ctaVariants', { ...ctaVariants }],
  ['buttonVariants', { ...buttonVariants }],
  ['Button', { ...Button }],
  ['alertBoxVariants', { ...alertBoxVariants }],
  ['TimelineImageModal', { ...TimelineImageModalclient }],
  ['TimelineClient', { ...TimelineClient }],
  ['TextBlockClient', { ...TextBlockClient }],
  ['TextAsideVideoBlock', { ...TextAsideVideoBlock }],
  ['TabsClient', { ...TabsClient }],
  ['SolutionsGroupClient', { ...SolutionsGroupClient }],
  ['SearchBox', { ...SearchBox }],
  ['Modal', { ...Modal }],
  ['MediaCardView', { ...MediaCardView }],
  ['LinkRenderer', { ...LinkRenderer }],
  ['ButtonView', { ...ButtonView }],
  ['ArticleBadge', { ...ArticleBadge }],
  ['Video', { ...Video }],
  ['BrightcoveModalPlayer', { ...BrightcoveModalPlayer }],
  ['Section', { ...Section }],
  ['BottomPlaceholder', { ...BottomPlaceholder }],
  ['SearchResults', { ...SearchResults }],
  ['SearchPagination', { ...SearchPagination }],
  ['GlobalSearchBox', { ...GlobalSearchBox }],
  ['Filter', { ...Filter }],
  ['Facets', { ...Facets }],
  ['DropdownFacets', { ...DropdownFacets }],
  ['BeltFacets', { ...BeltFacets }],
  ['RenderSelectedFacets', { ...RenderSelectedFacets }],
  ['RenderFacetList', { ...RenderFacetList }],
  ['PopupFacet', { ...PopupFacet }],
  ['SearchComponentClient', { ...SearchComponentClient }],
  ['SearchBeltSeriesPageClient', { ...SearchBeltSeriesPageClient }],
  ['SearchBeltFinderClient', { ...SearchBeltFinderClient }],
  ['GlobalSearchClient', { ...GlobalSearchClient }],
  ['ScriptContent', { ...ScriptContent }],
  ['RelatedCaseStudyBaseCardKindLabel', { ...RelatedCaseStudyBaseCardKindLabel }],
  ['ProductSegmentPartials', { ...ProductSegmentPartials }],
  ['ProductSegmentClient', { ...ProductSegmentClient }],
  ['ProductModalDialog', { ...ProductModalDialog }],
  ['useNavigationLinkForAppRouter', { ...useNavigationLinkForAppRouter }],
  ['Navigation', { ...Navigation }],
  ['UtilityBar', { ...UtilityBar }],
  ['NavMainNavItem', { ...NavMainNavItem }],
  ['NavigationSearchPartials', { ...NavigationSearchPartials }],
  ['NavigationMobilePartials', { ...NavigationMobilePartials }],
  ['NavigationMobileAtoms', { ...NavigationMobileAtoms }],
  ['NavigationDesktopPartials', { ...NavigationDesktopPartials }],
  ['MediaTileVideo', { ...MediaTileVideo }],
  ['MediaBoxVideo', { ...MediaBoxVideoclient }],
  ['MediaBoxImageModal', { ...MediaBoxImageModalclient }],
  ['MediaClient', { ...MediaClient }],
  ['LocationListIntroNav', { ...LocationListIntroNav }],
  ['LocalNavigationClient', { ...LocalNavigationClient }],
  ['LinkGridClient', { ...LinkGridClient }],
  ['LinkGridCard', { ...LinkGridCard }],
  ['LinkCardClient', { ...LinkCardClient }],
  ['IntroductionClient', { ...IntroductionClient }],
  ['HeadingComponentTitle', { ...HeadingComponentTitleclient }],
  ['FloatingFabFooterAwareWrap', { ...FloatingFabFooterAwareWrap }],
  ['FeaturedNewsReadMoreLink', { ...FeaturedNewsReadMoreLink }],
  ['FAQClient', { ...FAQClient }],
  ['Divider', { ...Divider }],
  ['CountryLanguageDropdown', { ...CountryLanguageDropdown }],
  ['CookieBannerClient', { ...CookieBannerClient }],
  ['TabAccordionTabPlaceholder', { ...TabAccordionTabPlaceholder }],
  ['TabAccordion', { ...TabAccordion }],
  ['DirectotyTable', { ...DirectotyTable }],
  ['ContactDirectoryClient', { ...ContactDirectoryClient }],
  ['CarouselClient', { ...CarouselClient }],
  ['CardCarouselClient', { ...CardCarouselClient }],
  ['LinkVIew', { ...LinkVIew }],
  ['CallToActionClient', { ...CallToActionClient }],
  ['TextAsideCalloutEqualRowBands', { ...TextAsideCalloutEqualRowBands }],
  ['CADFilesCLient', { ...CADFilesCLient }],
  ['BreadcrumbsClient', { ...BreadcrumbsClient }],
  ['BillboardClient', { ...BillboardClient }],
  ['BeltLandingLink', { ...BeltLandingLink }],
  ['useBeltIdentifierFacetState', { ...useBeltIdentifierFacetState }],
  ['BeltIdentifierSearchResult', { ...BeltIdentifierSearchResult }],
  ['BeltIdentifierClient', { ...BeltIdentifierClient }],
  ['Tools', { ...Tools }],
  ['Specification', { ...Specification }],
  ['SharedButton', { ...SharedButton }],
  ['ImageCarousel', { ...ImageCarousel }],
  ['Download', { ...Download }],
  ['BeltDetailComponent', { ...BeltDetailComponent }],
  ['BeltData', { ...BeltData }],
  ['BeltCardAccordion', { ...BeltCardAccordion }],
  ['ArticleBannerClient', { ...ArticleBannerClient }],
  ['AlertBoxPartials', { ...AlertBoxPartials }],
]);

export default componentMap;
