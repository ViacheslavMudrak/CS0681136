import { Field } from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from "lib/component-props";

export interface PortalShellLanguageField {
  value?: string;
}

export interface PortalShellLanguageSourceTargetFields {
  Iso?: PortalShellLanguageField;
  "Regional Iso Code"?: PortalShellLanguageField;
}

export interface PortalShellLanguageSourceTarget {
  name?: string;
  fields?: PortalShellLanguageSourceTargetFields;
}

export interface PortalShellLanguageSourceField extends PortalShellLanguageField {
  targetItem?: PortalShellLanguageSourceTarget;
}

export interface PortalShellLanguageItem {
  id?: string;
  name?: string;
  languageTitle?: PortalShellLanguageField;
  languageSource?: PortalShellLanguageSourceField;
  languageAlignment?: PortalShellLanguageField;
}

export interface PortalShellFields {
  Title?: Field<string>;
  data?: {
    item?: {
      children?: {
        results?: PortalShellLanguageItem[];
      };
    };
  };
}

/** Language switcher item from Top placeholder (LanguageSwitcher component) */
export interface LanguageSwitcherSelection {
  fields?: {
    LanguageSource?: {
      id?: string;
      fields?: {
        Iso?: { value?: string };
        "Regional Iso Code"?: { value?: string };
      };
    };
  };
}

/** Rendering shape for Top placeholder components */
export interface TopPlaceholderRendering {
  componentName?: string;
  fields?: {
    LanguageSelection?: LanguageSwitcherSelection[];
  };
}

export interface PortalShellProps extends ComponentProps {
  fields: PortalShellFields;
  /** Optional for tests; production gets component map via require(".sitecore/component-map") */
  componentMap?: Record<string, unknown>;
}
