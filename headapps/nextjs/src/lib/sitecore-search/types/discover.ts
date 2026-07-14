/**
 * Sitecore Search Discover API types
 * @see https://doc.sitecore.com/search/en/developers/search-developer-guide/integrating-using-rest-apis.html
 */

export interface DiscoverWidgetItem {
  rfk_id: string;
  entity: string;
  search?: Record<string, unknown>;
  sources?: string[];
  [key: string]: unknown;
}

export interface DiscoverPayload {
  widget: { items: DiscoverWidgetItem[] };
  context?: Record<string, unknown>;
}

/** Site mapping content item from Discover API sitemapping entity */
export interface SiteMappingItem {
  id: string;
  rule_one_company_codes: string[] | null;
  rule_two_business_unit_codes: string[] | null;
  rule_two_company_codes: string[] | null;
  site_name: string;
  site_tag: string[] | null;
  site_type: string;
  site_id: string | null;
  source_id: string;
}

/** Site mapping widget from Discover API response */
export interface SiteMappingWidget {
  rfk_id: string;
  type: string;
  used_in: string;
  entity: string;
  content: SiteMappingItem[];
  total_item: number;
  limit: number;
  offset: number;
}

/** Discover API response for site mapping queries */
export interface SiteMappingResponse {
  widgets: SiteMappingWidget[];
  dt: number;
  ts: number;
}

/** Content item from Discover API content entity */
export interface DiscoverContentItem {
  item_id: string;
  id: string;
  name: string;
  title: string;
  navigation_title: string;
  is_market: boolean;
  is_ascension_site: boolean;
  description: string | null;
  excerpt: string | null;
  url: string;
  thumbnail: string | null;
  type: string;
  result_type: string;
  template_name: string;
  source_id: string;
  author: string | null;
  published_date: string | null;
  updated_date: string;
  last_update_computed: string;
  last_update_computed_label: string;
  jsonld: string;
  all_tags: string[] | null;
  site_area_tags: string[] | null;
  topic_tags: string[] | null;
  content_tags: string[] | null;
  ministries_tags: string[] | null;
  functions_tags: string[] | null;
  healthcare_operations_tags: string[] | null;
  news_tags: string[] | null;
  reflections_tags: string[] | null;
  regional_news_tags: string[] | null;
  resources_tags: string[] | null;
  utilities_tags: string[] | null;
  communication_tags: string[] | null;
  workplace_culture_tags: string[] | null;
  site_level_association_tags: string[] | null;
  reflections_published_date_start_date: number | null;
  reflections_published_date_end_date: number | null;
  page_introduction?: string;
  page_visible_by_groups?: string[] | null;
  ancestor_visible_by_groups?: string[] | null;
  is_gated?: boolean;
  is_gated_by_page?: boolean;
  is_gated_by_ancestor?: boolean;
}

/** Content widget from Discover API response (entity: content) */
export interface ContentWidget {
  rfk_id: string;
  type: string;
  used_in: string;
  entity: string;
  content: DiscoverContentItem[];
  total_item: number;
  limit: number;
  offset: number;
}

/** Discover API response for content queries */
export interface ContentResponse {
  widgets: ContentWidget[];
  dt: number;
  ts: number;
}
