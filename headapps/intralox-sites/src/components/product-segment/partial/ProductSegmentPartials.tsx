'use client';

import type { JSX, KeyboardEvent } from 'react';

import {
  Field,
  RichText,
  Text,
  type TextField,
} from '@sitecore-content-sdk/nextjs';
import { ChevronRight } from '@laitram-l-l-c/intralox-icon-library';

import { cn } from 'lib/utils';
import { ImageView } from 'components/shared/ImageView/ImageView';

import type {
  ProductModalItem,
  ProductSegmentApplicationFilter,
  ProductSegmentItem,
} from '../ProductSegment.type';
import { PRODUCT_SEGMENT_LABELS } from '../ProductSegment.type';
import {
  getModalPrimaryApplicationLabel,
  getSegmentSlug,
} from '../productSegmentUtils';

export interface ProductSegmentHeaderProps {
  eyebrow?: TextField;
  headline?: TextField;
  subHeadline?: Field<string>;
  description?: Field<string>;
  isEditing: boolean;
}

/** Eyebrow, headline, and overview copy. */
export function ProductSegmentHeader({
  eyebrow,
  headline,
  subHeadline,
  description,
  isEditing,
}: ProductSegmentHeaderProps): JSX.Element {
  return (
    <div className="mb-8 text-center md:mb-10">
      {(eyebrow?.value || isEditing) && (
        <Text
          field={eyebrow}
          tag="p"
          className="mb-[7px] block text-center text-sm font-bold uppercase leading-[17.5px] tracking-[0.35px] text-ink-muted"
        />
      )}
      {(headline?.value || isEditing) && (
        <Text
          field={headline}
          tag="h2"
          className="block text-center text-2xl font-bold leading-[30px] text-ink-primary"
        />
      )}
      {(subHeadline?.value || isEditing) && (
        <RichText
          field={subHeadline}
          tag="h3"
          className="mt-10 block text-center text-xl font-bold leading-tight text-ink-primary"
        />
      )}
      {(description?.value || isEditing) && (
        <RichText
          field={description}
          tag="p"
          className="mt-2 block text-center text-lg leading-normal text-ink-secondary"
        />
      )}
    </div>
  );
}

export interface ProductSegmentSegmentGridProps {
  segments: ProductSegmentItem[];
  activeSlug: string;
  isEditing: boolean;
  onSelect: (slug: string) => void;
}

/** Industry/category segment cards (2×2 grid). */
export function ProductSegmentSegmentGrid({
  segments,
  activeSlug,
  isEditing,
  onSelect,
}: ProductSegmentSegmentGridProps): JSX.Element {
  return (
    <div
      className="relative mt-6 flex flex-wrap lg:-mr-4"
      role="radiogroup"
      aria-label={PRODUCT_SEGMENT_LABELS.segmentGroupLabel}
    >
      {segments.map((segment) => {
        const { Heading, Description, Icon } = segment.fields ?? {};
        const slug = getSegmentSlug(segment);
        const isSelected = slug === activeSlug;
        const label =
          Heading?.value ?? segment.displayName ?? segment.name ?? 'Segment';

        return (
          <div key={segment.id} className="flex w-full lg:w-1/2 lg:pr-4">
            <button
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={String(label)}
              onClick={() => !isEditing && onSelect(slug)}
              disabled={isEditing}
              className={cn(
                'mt-6 box-border flex w-full flex-auto items-center rounded-2xl border border-stroke-default p-5 text-left leading-5 transition-[color,background-color,border-color] duration-150 ease-in-out motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-link-strong focus-visible:ring-offset-2',
                isEditing && 'cursor-default',
                isSelected
                  ? 'bg-link'
                  : 'bg-surface hover:bg-surface-muted',
              )}
            >
              <span className="mr-2 w-12 shrink-0">
                {Icon && (Icon.value?.src || isEditing) && (
                  <ImageView
                    image={Icon}
                    objectFit="contain"
                    cropWidth={48}
                    cropRatio={1}
                    className="size-12"
                    imageClass="size-full object-contain"
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                {(Heading?.value || isEditing) && (
                  <Text
                    field={Heading}
                    tag="span"
                    className={cn(
                      'mt-1 block text-lg font-bold leading-5',
                      isSelected ? 'text-ink-inverse' : 'text-link',
                    )}
                  />
                )}
                {(Description?.value || isEditing) && (
                  <Text
                    field={Description}
                    tag="span"
                    className={cn(
                      'block text-sm leading-5',
                      isSelected ? 'text-ink-inverse' : 'text-ink-tertiary',
                    )}
                  />
                )}
              </span>
            </button>
          </div>
        );
      })}
      {!segments.length && isEditing && (
        <span className="is-empty-hint w-full">
          {PRODUCT_SEGMENT_LABELS.noSegmentsHint}
        </span>
      )}
    </div>
  );
}

export interface ProductSegmentApplicationFiltersProps {
  filters: ProductSegmentApplicationFilter[];
  activeSlug: string | null;
  isEditing: boolean;
  onSelect: (slug: string | null) => void;
}

/** Horizontal application filter tabs for the active segment. */
export function ProductSegmentApplicationFilters({
  filters,
  activeSlug,
  isEditing,
  onSelect,
}: ProductSegmentApplicationFiltersProps): JSX.Element | null {
  if (filters.length === 0) {
    return null;
  }

  const tabs = [
    { slug: null as string | null, label: PRODUCT_SEGMENT_LABELS.allFilter },
    ...filters.map((f) => ({ slug: f.slug, label: f.label })),
  ];

  return (
    <div className="z-10 mt-12 w-full border-b border-stroke-default bg-surface">
      <div
        className="-ml-4 flex items-center overflow-x-auto text-sm tracking-wide text-ink-secondary [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label={PRODUCT_SEGMENT_LABELS.applicationTabsLabel}
      >
        <span className="shrink-0 pl-4 font-bold whitespace-nowrap">
          {PRODUCT_SEGMENT_LABELS.applicationsPrefix}
        </span>
        {tabs.map((tab) => {
          const isActive = tab.slug === activeSlug;
          return (
            <button
              key={tab.slug ?? 'all'}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => !isEditing && onSelect(tab.slug)}
              disabled={isEditing}
              className={cn(
                'shrink-0 pl-4 whitespace-nowrap border-b-[3px] pt-[3px] leading-10 transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-link-strong focus-visible:ring-offset-2',
                isEditing && 'cursor-default',
                isActive
                  ? 'border-brand-red text-ink-primary focus:border-brand-red'
                  : 'border-transparent hover:border-stroke-default focus:border-stroke-default',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface ProductSegmentSolutionCardsProps {
  modals: ProductModalItem[];
  isEditing: boolean;
  onOpen: (modal: ProductModalItem) => void;
}

/** Solution card grid for the active segment + application filter. */
export function ProductSegmentSolutionCards({
  modals,
  isEditing,
  onOpen,
}: ProductSegmentSolutionCardsProps): JSX.Element {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    modal: ProductModalItem,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(modal);
    }
  };

  return (
    <div
      className="-mx-3 flex flex-wrap"
      role="list"
      aria-label={PRODUCT_SEGMENT_LABELS.solutionCardsLabel}
    >
      {modals.map((modal) => {
        const { Title, Description, Thumbnail } = modal.fields ?? {};
        const appLabel = getModalPrimaryApplicationLabel(modal);
        const titleText =
          Title?.value ?? modal.displayName ?? modal.name ?? 'Solution';

        return (
          <div
            key={modal.id}
            className="mt-6 flex w-full items-stretch px-3 min-[768px]:w-1/3"
          >
            <button
              type="button"
              role="listitem"
              aria-label={`${titleText}${appLabel ? `, ${appLabel}` : ''}`}
              onClick={() => !isEditing && onOpen(modal)}
              onKeyDown={(e) => !isEditing && handleKeyDown(e, modal)}
              disabled={isEditing}
              className={cn(
                'group flex w-full flex-col overflow-hidden rounded-lg border border-stroke-default bg-surface text-left shadow-md transition-shadow duration-150 motion-reduce:transition-none motion-reduce:hover:shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-link-strong focus-visible:ring-offset-2',
                isEditing && 'cursor-default hover:shadow-md',
              )}
            >
              <figure className="relative block min-h-px w-full overflow-hidden aspect-[16/10] bg-surface-muted-light">
                {Thumbnail && (Thumbnail.value?.src || isEditing) && (
                  <ImageView
                    image={Thumbnail}
                    objectFit="cover"
                    className="size-full"
                    imageClass="size-full object-cover"
                  />
                )}
              </figure>
              <div className="flex flex-auto flex-col space-y-1 px-4 pt-4 pb-6">
                <div className="flex items-start justify-between gap-2">
                  {(Title?.value || isEditing) && (
                    <Text
                      field={Title}
                      tag="span"
                      className="text-lg font-bold leading-snug text-ink-primary transition-colors duration-150 motion-reduce:transition-none group-hover:text-ink-secondary"
                    />
                  )}
                  <ChevronRight
                    className="inline-block shrink-0 mt-1 size-[18px] text-ink-subtle"
                    aria-hidden="true"
                  />
                </div>
                {(Description?.value || isEditing) && (
                  <RichText
                    field={Description}
                    tag="p"
                    className="text-sm leading-snug text-ink-secondary prose prose-sm max-w-none"
                  />
                )}
                {appLabel ? (
                  <div className="flex flex-auto flex-col justify-end pt-4">
                    <span className="text-xs font-bold uppercase leading-tight text-ink-secondary">
                      {appLabel}
                    </span>
                  </div>
                ) : null}
              </div>
            </button>
          </div>
        );
      })}
      {!modals.length && isEditing && (
        <span className="is-empty-hint w-full px-3">
          {PRODUCT_SEGMENT_LABELS.noSolutionsHint}
        </span>
      )}
    </div>
  );
}
