import type { NavigationFields } from 'components/navigation/Navigation.type';
import type { FooterFields } from 'components/footer/Footer.type';

import { storybookImage1, storybookImage3 } from 'src/storybook/storybookImageAssets';

/**
 * Representative Sitecore-shaped navigation fields for Storybook: top bar, languages, logo,
 * mega-style primary nav (with children + promo), search. Aligns with `usePathname()` `/solutions`
 * in `.storybook/preview.tsx` for active-tab behavior.
 */
export const storybookFullNavigationFields: NavigationFields = {
  ShowTopBar: { value: true },
  TopBar: {
    id: 'story-topbar',
    displayName: 'Top Bar',
    fields: {
      LanguageTitle: { value: 'Language' },
      LanguageIconCssClass: { value: 'fa-solid fa-globe' },
      TopNavLinks: [
        {
          id: 'tn-contact',
          displayName: 'Contact',
          fields: {
            Title: { value: 'Contact' },
            Link: { value: { href: 'tel:+18005551212', text: '1-800-555-1212' } },
            CssClass: { value: 'fa-solid fa-phone' },
          },
        },
        {
          id: 'tn-support',
          displayName: 'Support',
          fields: {
            Title: { value: 'Support' },
            Link: { value: { href: '/support', text: 'Support center' } },
            CssClass: { value: 'fa-solid fa-headset' },
          },
        },
      ],
      Languages: [
        {
          id: 'lang-en',
          name: 'en',
          displayName: 'English',
          fields: {
            LanguageTitle: { value: 'English' },
            LanguageCountry: { value: 'U.S.' },
            LanguageCode: { value: 'en' },
          },
        },
        {
          id: 'lang-fr',
          name: 'fr-CA',
          displayName: 'Français',
          fields: {
            LanguageTitle: { value: 'Français' },
            LanguageCountry: { value: 'Canada' },
            LanguageCode: { value: 'fr-CA' },
          },
        },
      ],
    },
  },
  Logo: {
    value: {
      src: storybookImage3,
      width: 200,
      height: 56,
      alt: 'Company logo',
    },
  },
  LogoLink: { value: { href: '/', text: 'Home' } },
  MainNavigationLinks: [
    {
      id: 'nav-solutions',
      displayName: 'Solutions',
      fields: {
        Title: { value: 'Solutions' },
        Link: { value: { href: '/solutions', text: 'Solutions' } },
        Heading: { value: 'Solutions overview' },
        Description: {
          value: '<p>Modular plastic belting, automation, and services for food, logistics, and industrial lines.</p>',
        },
        Image: {
          value: {
            src: storybookImage1,
            width: 520,
            height: 347,
            alt: '',
          },
        },
        PromoLink: { value: { href: '/belt-finder', text: 'Belt finder tool' } },
        ChildLinks: [
          {
            id: 'sol-food',
            fields: {
              Title: { value: 'Food processing' },
              Link: { value: { href: '/solutions/food', text: 'Food processing' } },
            },
          },
          {
            id: 'sol-logistics',
            fields: {
              Title: { value: 'Logistics' },
              Link: { value: { href: '/solutions/logistics', text: 'Logistics' } },
            },
          },
        ],
      },
    },
    {
      id: 'nav-products',
      displayName: 'Products',
      fields: {
        Title: { value: 'Products' },
        Link: { value: { href: '/products', text: 'Products' } },
        ChildLinks: [
          {
            id: 'prod-belts',
            fields: {
              Title: { value: 'Belts' },
              Link: { value: { href: '/products/belts', text: 'Belts' } },
            },
          },
        ],
      },
    },
    {
      id: 'nav-services',
      displayName: 'Services',
      fields: {
        Title: { value: 'Services' },
        Link: { value: { href: '/services', text: 'Services' } },
      },
    },
    {
      id: 'nav-resources',
      displayName: 'Resources',
      fields: {
        Title: { value: 'Resources' },
        Link: { value: { href: '/resources', text: 'Resources' } },
      },
    },
  ],
  SearchBoxPlaceholder: { value: 'Search site' },
  SearchPage: { value: { href: '/search', text: 'Search' } },
  SearchIconCssClass: { value: 'fa-solid fa-magnifying-glass' },
};

/**
 * Full footer: multi-column nav, social icons, copyright, secondary links.
 */
export const storybookFullFooterFields: FooterFields = {
  CopyrightText: { value: '© 2026 Intralox. All rights reserved.' },
  MainLinks: [
    {
      id: 'ft-col-products',
      displayName: 'Products',
      fields: {
        Title: { value: 'Products' },
        Link: { value: { href: '/products', text: 'Products' } },
        ChildLinks: [
          {
            id: 'ft-p1',
            fields: {
              Title: { value: 'Belts' },
              Link: { value: { href: '/products/belts', text: 'Belts' } },
            },
          },
          {
            id: 'ft-p2',
            fields: {
              Title: { value: 'Sprockets' },
              Link: { value: { href: '/products/sprockets', text: 'Sprockets' } },
            },
          },
        ],
      },
    },
    {
      id: 'ft-col-company',
      displayName: 'Company',
      fields: {
        Title: { value: 'Company' },
        ChildLinks: [
          {
            id: 'ft-c1',
            fields: {
              Link: { value: { href: '/about', text: 'About us' } },
            },
          },
          {
            id: 'ft-c2',
            fields: {
              Link: { value: { href: '/careers', text: 'Careers' } },
            },
          },
        ],
      },
    },
  ],
  SocialLinks: [
    {
      id: 'ft-soc-li',
      fields: {
        Link: {
          value: {
            href: 'https://www.linkedin.com/company/example',
            text: 'LinkedIn',
            target: '_blank',
          },
        },
        IconCssClass: { value: 'fa-brands fa-linkedin' },
      },
    },
    {
      id: 'ft-soc-yt',
      fields: {
        Link: {
          value: {
            href: 'https://www.youtube.com/example',
            text: 'YouTube',
            target: '_blank',
          },
        },
        IconCssClass: { value: 'fa-brands fa-youtube' },
      },
    },
  ],
  SecondaryLinks: [
    {
      id: 'ft-sec-privacy',
      fields: {
        Link: { value: { href: '/privacy', text: 'Privacy policy' } },
      },
    },
    {
      id: 'ft-sec-terms',
      fields: {
        Link: { value: { href: '/terms', text: 'Terms of use' } },
      },
    },
  ],
};
