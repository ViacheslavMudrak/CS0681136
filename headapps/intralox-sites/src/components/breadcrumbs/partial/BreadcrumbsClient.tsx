"use client";
import { useMemo, type JSX } from "react";
import { Link, Page, Text } from "@sitecore-content-sdk/nextjs";
import { IParams } from "src/utils/interface";
import { IBreadcrumbsFields } from "../Breadcrumbs.type";
import { Container } from "components/shared/BaseContainer";
import { ChevronRight } from '@laitram-l-l-c/intralox-icon-library';
import { CHROME_ICON_BASE } from 'lib/chrome-icons';
import { cx } from "@laitram-l-l-c/intralox-ui-components";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";
import { TemplateName } from "src/utils/enum";

interface IBreadcrumbsClientProps extends IParams {
  fields: IBreadcrumbsFields;
  page: Page;
}

const BreadcrumbsClientBase = ({
  fields,
  params,
  page,
}: IBreadcrumbsClientProps): JSX.Element => {
  const textAlign = params?.TextAlign?.Value?.value?.toLowerCase() ?? "left";
  const border = params?.HasBorder ?? "";
  const colorScheme =
    params?.ColorScheme?.Value?.value?.toLowerCase() ?? "light";
  const templateName = page?.layout?.sitecore?.route?.templateName;
  const isSprocketToolAccessoryTemplate =
    templateName === TemplateName.SPROCKETS ||
    templateName === TemplateName.TOOLS ||
    templateName === TemplateName.ACCESSORIES;
  const shouldSkipFirstBreadcrumb =
    isSprocketToolAccessoryTemplate ||
    templateName?.includes(TemplateName.BELTS);
  const contrast = params?.HasContrast ?? false;

  const visibleBreadcrumbItems = useMemo(() => {
    const breadcrumbItems = [
      ...(fields?.data?.currentPage?.BreadcrumbData ?? []),
    ]
      .reverse()
      .filter((item) => item.IsPageSearchable.value);
    if (shouldSkipFirstBreadcrumb) {
      return breadcrumbItems.slice(1);
    }
    return breadcrumbItems;
  }, [fields?.data?.currentPage?.BreadcrumbData, shouldSkipFirstBreadcrumb]);

  return (
    <Container width="default">
      <div
        className={cx(
          border &&
            cx(
              'border-0 border-l-4 border-solid px-2',
              colorScheme === 'dark' ? 'border-orange' : 'border-cyan',
            ),
          'uppercase tracking-wider text-sm font-bold',
          contrast ? 'text-ink-inverse bg-chrome-bar' : 'text-ink-secondary',
        )}
        data-analytics-title="Breadcrumbs"
        {...renderingAnchorIdProps(params?.RenderingIdentifier)}
      >
        <ul
          className={cx(
            'flex flex-wrap -ml-2! p-0!',
            textAlign === 'center' && 'justify-center',
          )}
        >
          {visibleBreadcrumbItems.map((item, index) => {
            const isLastItem = index === visibleBreadcrumbItems.length - 1;
            const isCurrentItemLink =
              isSprocketToolAccessoryTemplate && isLastItem;
            return (
              <li
                key={`${item.Link.url}-${item.Title.data.value}`}
                className="pl-2 pr-2 relative ml-0! text-xs! uppercase tracking-wide font-bold"
              >
                <Link
                  field={{ value: { href: item.Link.url } }}
                  className={cx(
                    !contrast && {
                      "text-action-link hover:text-action focus:text-action focus:outline-none": true,
                    },
                    isCurrentItemLink &&
                      !contrast && {
                        "text-ink-secondary hover:text-ink-secondary focus:text-ink-secondary": true,
                      },
                    contrast && "text-ink-inverse",
                  )}
                  data-analytics-title={item.Title.data.value}
                >
                  {item.Title.data.value}
                </Link>
                {!isCurrentItemLink && (
                  <span
                    className={cx("inline-flex items-center justify-center shrink-0", contrast ? "text-ink-inverse" : "text-chrome-chevron", "absolute left-full top-1/2 -translate-y-1/2 -translate-x-1/2")}
                    aria-hidden="true"
                  >
                    <ChevronRight
                      className={`${CHROME_ICON_BASE} size-[9px] md:size-[11px]`}
                      aria-hidden="true"
                    />
                  </span>
                )}
              </li>
            );
          })}
          {!isSprocketToolAccessoryTemplate && (
            <li className="pl-2 pr-2 relative ml-0! text-xs! uppercase tracking-wide font-bold">
              <Text
                className={cx(
                  !contrast && {
                    "text-ink-secondary": true,
                  },
                  contrast && "text-ink-inverse",
                )}
                tag="span"
                field={fields.data.currentPage.Title.data}
              />
            </li>
          )}
        </ul>
      </div>
    </Container>
  );
};

export const BreadcrumbsClient = BreadcrumbsClientBase;
