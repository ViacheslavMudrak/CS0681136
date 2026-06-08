import type {
  Field,
  ImageField,
  LinkField,
  TextField,
} from "@sitecore-content-sdk/nextjs";
import type { ComponentProps } from "lib/component-props";

export interface TestimonialCompanyReference {
  id?: string;
  displayName?: string;
  name?: string;
  url?: string;
  fields?: {
    Name?: TextField | Field<string>;
    Logo?: ImageField;
    Link?: LinkField;
  };
}

export type TestimonialCompanyField = TextField | TestimonialCompanyReference;

export interface TestimonialFieldsFlat {
  Quote?: Field<string>;
  Attribution?: TextField;
  JobTitle?: TextField;
  Image?: ImageField;
  Link?: LinkField;
  Company?: TestimonialCompanyField;
}

export interface TestimonialDatasource {
  quote?: { jsonValue?: Field<string> };
  attribution?: { jsonValue?: TextField };
  jobTitle?: { jsonValue?: TextField };
  authorName?: { jsonValue?: TextField };
  authorTitle?: { jsonValue?: TextField };
  image?: { jsonValue?: ImageField };
  link?: { jsonValue?: LinkField };
  company?: { jsonValue?: TestimonialCompanyField };
}

export interface TestimonialFieldsGraphQL {
  data?: {
    datasource?: TestimonialDatasource;
  };
}

export type TestimonialFields =
  | TestimonialFieldsFlat
  | TestimonialFieldsGraphQL;

/** Sitecore rendering props for testimonial variants (see XM Cloud component standards §1). */
export type TestimonialProps = Omit<ComponentProps, "params"> & {
  params: ComponentProps["params"] & {
    /**
     * Rendering dropdown: center the quote block or align left (case-insensitive: Center, Left).
     */
    Alignment?: string;
    /**
     * Layout service droplist shape (`{ Value: { value: "Center" } }`) — same intent as `Alignment`.
     */
    Position?: unknown;
    /** Legacy keys — testimonial surface is driven only by `HasBackgroundColor` in the head app. */
    BackgroundColor?: unknown;
    BackgroundStyle?: unknown;
    Background?: unknown;
    ShowBackgroundColor?: unknown;
    /**
     * Checkbox (layout service): key present + checked (`1`) → transparent figure; off → white;
     * key omitted → white. Experience Edge / JSON may use camelCase — see `hasBackgroundColor`.
     */
    HasBackgroundColor?: unknown;
    /** CamelCase alias for `HasBackgroundColor` (resolved case-insensitively in the head app). */
    hasBackgroundColor?: unknown;
  };
  /** Omitted or empty when the rendering has no datasource in layout service output. */
  fields?: TestimonialFields;
};

export interface TestimonialNormalizedFields {
  Quote?: Field<string>;
  Attribution?: TextField;
  JobTitle?: TextField;
  Image?: ImageField;
  Link?: LinkField;
  Company?: TestimonialCompanyField;
}

/** Quote alignment from rendering parameter `Alignment` (center vs left). */
export type TestimonialTextAlignment = "center" | "left";

/** Figure background: gray strip (legacy), white page surface, Media Tile section gray, or inherit. */
export type TestimonialFigureSurface =
  | "tint"
  | "white"
  | "transparent"
  | "inherit";
