import { JSX } from "react";
import { Text, Link as ContentSdkLink } from "@sitecore-content-sdk/nextjs";
import { cn } from "lib/utils";

import type { FooterProps } from "./Footer.type";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";
import { resolveCopyrightText } from "./footerUtils";
import { FooterNavColumn, FooterSocialLink } from "./partial/FooterPartials";

/**
 * Renders the default footer layout with navigation columns, social links,
 * copyright text, and legal/secondary links.
 * @param props - Sitecore component props including fields, params, and page.
 * @returns The rendered footer component.
 */
export const Default = ({ fields, params, page }: FooterProps): JSX.Element => {
  const { isEditing } = page.mode;
  const { styles } = params;
  const anchorId = renderingAnchorIdProps(params.RenderingIdentifier);

  if (!fields) {
    return (
      <div className={cn("component footer w-full p-0!", styles)} {...anchorId}>
        <div
          className={
            "component-content footer-wrapper box-border block w-full m-0 px-0! pt-6 pb-8 md:py-12 font-sans leading-6 text-ink-inverse bg-chrome-stripe [-webkit-tap-highlight-color:transparent] isolate"
          }
        >
          <div className="footer-inner box-border block w-full max-w-none my-0 mx-0 py-0 px-4 font-[inherit] leading-[inherit] text-inherit [-webkit-tap-highlight-color:transparent] isolate sm:mx-auto sm:max-w-[600px] md:max-w-[768px] lg:max-w-[992px] xl:max-w-[1200px]">
            <span className="is-empty-hint">Footer</span>
          </div>
        </div>
      </div>
    );
  }

  const { MainLinks, CopyrightText, SecondaryLinks, SocialLinks } =
    fields ?? {};
  const copyrightText = resolveCopyrightText(CopyrightText?.value);
  const filteredMainLinks = MainLinks?.filter((item) => item?.fields) ?? [];
  const filteredSocialLinks =
    SocialLinks?.filter(
      (item) => item?.fields && (item.fields.Link?.value?.href || isEditing),
    ) ?? [];
  const filteredSecondaryLinks =
    SecondaryLinks?.filter((item) => item?.fields) ?? [];

  return (
    <div className={cn("component footer w-full p-0!", styles)} {...anchorId}>
      <div
        className={
          "component-content footer-wrapper box-border block w-full m-0 px-0! pt-8 pb-8 md:py-12 font-sans leading-6 text-ink-inverse bg-chrome-stripe [-webkit-tap-highlight-color:transparent] isolate"
        }
      >
        <div className="footer-inner box-border block w-full max-w-none my-0 mx-0 py-0 px-4 font-[inherit] leading-[inherit] text-inherit [-webkit-tap-highlight-color:transparent] isolate sm:mx-auto sm:max-w-[600px] md:max-w-[768px] lg:max-w-[992px] xl:max-w-[1200px]">
          <div className="footer-top flex flex-wrap items-start content-start -mt-4 pb-0! max-md:-ml-6 md:-ml-18">
            {(filteredMainLinks.length > 0 || isEditing) && (
              <nav
                aria-label="Footer navigation"
                className="footer-columns contents"
              >
                {filteredMainLinks.map((item, index) => (
                  <FooterNavColumn
                    key={item.id}
                    item={item}
                    columnIndex={index}
                    isEditing={isEditing}
                  />
                ))}
                {!filteredMainLinks.length && isEditing && (
                  <span className="is-empty-hint">
                    No navigation links configured
                  </span>
                )}
              </nav>
            )}

            {(filteredSocialLinks.length > 0 || isEditing) && (
              <div
                className="footer-social flex max-md:mt-12 max-mobile:mt-16 max-md:w-full max-md:basis-full flex-wrap items-center justify-center gap-4 max-mobile:ml-5 [@media(min-width:381px)_and_(max-width:430px)]:ml-5 [@media(min-width:381px)_and_(max-width:430px)]:mt-16 md:mt-4 md:shrink-0 md:grow-0 md:basis-auto md:pl-12 md:ml-auto md:w-1/4 md:justify-end lg:w-2/5"
                role="list"
                aria-label="Social media links"
              >
                {filteredSocialLinks.map((item) => (
                  <FooterSocialLink
                    key={item.id}
                    item={item}
                    isEditing={isEditing}
                  />
                ))}
                {!filteredSocialLinks.length && isEditing && (
                  <span className="is-empty-hint">
                    No social links configured
                  </span>
                )}
              </div>
            )}
          </div>

          <hr
            className="footer-divider my-4 w-full min-w-0 border-0 border-t border-ink-primary lg:my-8"
            aria-hidden="true"
          />

          <div className="footer-bottom flex flex-wrap flex-row items-start justify-center gap-0 -ml-4 -mt-2 text-sm leading-[21px] tracking-[0.7px] text-ink-inverse md:max-lg:ml-0 md:max-lg:justify-center md:max-lg:content-center lg:-ml-4 lg:-mt-2 lg:justify-center lg:content-normal">
            {(CopyrightText?.value || isEditing) && (
              <Text
                field={
                  isEditing
                    ? { ...CopyrightText, value: copyrightText }
                    : { value: copyrightText }
                }
                tag="p"
                className="footer-copyright m-0 mt-2 block shrink-0 grow-0 basis-auto pl-4 text-sm font-normal leading-[21px] tracking-[0.7px] text-stroke-default md:max-lg:w-fit md:max-lg:max-w-full md:max-lg:text-center lg:w-auto lg:max-w-none"
              />
            )}

            {(filteredSecondaryLinks.length > 0 || isEditing) && (
              <nav
                aria-label="Legal and compliance links"
                className="footer-legal-links contents [&_a:focus-visible]:outline-none [&_a:focus-visible]:text-ink-inverse [&_a:focus-visible]:no-underline [&_a:focus-visible]:rounded-[2px] [&_a:focus-visible]:shadow-[0_0_0_2px_var(--color-focus-interactive),0_0_0_3px_var(--color-ink-inverse)]"
              >
                {filteredSecondaryLinks.map((item) => {
                  const link = item?.fields?.Link;
                  const linkTarget = link?.value?.target;

                  if (!link?.value?.href && !isEditing) return null;
                  if (!link) return null;

                  return (
                    <ContentSdkLink
                      key={item.id}
                      field={link}
                      editable={isEditing}
                      className={
                        "footer-legal-link focus:outline-none focus-visible:outline-none focus-visible:text-ink-inverse focus-visible:no-underline focus-visible:rounded-[2px] focus-visible:shadow-[0_0_0_2px_var(--color-focus-interactive),0_0_0_3px_var(--color-ink-inverse)] mt-2 mb-0 ml-4 inline-block shrink-0 grow-0 basis-auto cursor-pointer list-none p-0 box-border text-sm font-normal leading-[21px] tracking-[0.7px] text-ink-inverse no-underline transition-[color,background-color,border-color,outline-color,text-decoration-color] duration-150 ease-in-out motion-reduce:transition-none hover:text-stroke-default hover:underline md:max-lg:whitespace-nowrap lg:whitespace-normal [&_*]:font-inherit"
                      }
                      aria-label={
                        link?.value?.text ?? item.displayName ?? "Legal link"
                      }
                      target={linkTarget || undefined}
                      rel={
                        linkTarget === "_blank"
                          ? "noopener noreferrer"
                          : undefined
                      }
                    />
                  );
                })}
                {!filteredSecondaryLinks.length && isEditing && (
                  <span className="is-empty-hint">
                    No legal links configured
                  </span>
                )}
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
