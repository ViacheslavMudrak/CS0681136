import type {
  ProductModalItem,
  ProductSegmentFields,
  ProductSegmentTaxonomyItem,
} from 'components/product-segment/ProductSegment.type';

export function productSegmentApplication(
  id: string,
  url: string,
  label: string,
): ProductSegmentTaxonomyItem {
  return {
    id,
    url,
    displayName: label,
    fields: { Value: { value: label } },
  };
}

export function productSegmentModal(
  id: string,
  url: string,
  title: string,
  applications: ProductSegmentTaxonomyItem[] = [],
): ProductModalItem {
  return {
    id,
    url,
    fields: {
      Title: { value: title },
      Description: { value: `${title} description` },
      Application: applications,
    },
  };
}

/** Representative passive-transfer modal with solutions, features, and download link. */
export function passiveTransferModal(
  applications: ProductSegmentTaxonomyItem | ProductSegmentTaxonomyItem[] = [],
): ProductModalItem {
  const applicationItems = Array.isArray(applications)
    ? applications
    : applications
      ? [applications]
      : [];

  return {
    id: 'm-passive',
    url: '/data/product-model/passive-transfer',
    fields: {
      Title: { value: 'DARB S4500 Passive On, DARB S4500 Passive Off' },
      Description: { value: 'Passive transfer description' },
      Application: applicationItems,
      Solutions: [
        { id: 'sol-1', fields: { Value: { value: 'DARB S4500 Passive On' } } },
        { id: 'sol-2', fields: { Value: { value: 'DARB S4500 Passive Off' } } },
      ],
      FeaturesandBenefits: {
        value: '<ul><li>High roller density</li><li>Lower takt time</li></ul>',
      },
      Link: {
        value: {
          href: '/media/passive-transfer.pdf',
          text: 'Download our "Activated Roller Belt 90-Degree Passive Transfer" Application Highlight (PDF)',
        },
      },
    },
  };
}

export function buildProductSegmentFields(
  eCommerceModals: ProductModalItem[],
): ProductSegmentFields {
  const sorting = productSegmentApplication('1', '/application-filters/sorting', 'Sorting');

  return {
    Eyebrow: { value: 'Solutions' },
    Headline: { value: 'Find your solution' },
    SubHeadline: { value: 'Overview line' },
    Description: { value: 'Secondary overview' },
    Segments: [
      {
        id: 's1',
        url: '/product-segment/e-commerce',
        fields: {
          Heading: { value: 'E-Commerce' },
          Description: { value: 'E-commerce segment' },
          ProductModal: eCommerceModals,
        },
      },
      {
        id: 's2',
        url: '/product-segment/postal-parcel-including',
        fields: {
          Heading: { value: 'Postal & Parcel' },
          Description: { value: 'Postal segment' },
          ProductModal: [
            productSegmentModal(
              'm3',
              '/data/product-model/90-degree-sorter',
              '90-Degree Sorter',
              [sorting],
            ),
          ],
        },
      },
    ],
  };
}
