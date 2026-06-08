"use client";

import React from "react";

import { NextImage as ContentSdkImage, Text as ContentSdkText } from "@sitecore-content-sdk/nextjs";

import { LinkRender } from "@/components/shared/link-render/LinkRender";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import { useDeviceType } from "@/hooks/use-device-type";
import { cn } from "@/lib/utils";
import type { ProfileAccount } from "@/lib/profile-context";
import { useContactSupportModal } from "@/lib/contact-support-modal-context";
import { useLanguageSelectionModal } from "@/lib/language-selection-modal-context";
import type { IUserProfileMenuFields } from "../UserProfileMenu.type";

function ActiveAccountIconImage({ fields }: { fields: IUserProfileMenuFields }): React.ReactNode {
  if (!fields.ActiveAccountIcon?.value?.src) return null;
  return (
    <ContentSdkImage
      field={fields.ActiveAccountIcon}
      className={"shrink-0 w-[14px] h-[14px] self-start"}
      width={Number(fields.ActiveAccountIcon?.value?.width) || 14}
      height={Number(fields.ActiveAccountIcon?.value?.height) || 14}
      alt=""
      aria-hidden="true"
    />
  );
}

export interface UserProfileMenuContentProps {
  accounts: ProfileAccount[];
  fields: IUserProfileMenuFields;
  selectedAccount: ProfileAccount | null;
  onAccountSelect: (account: ProfileAccount) => void;
  onCloseMenu: () => void;
  onProfileItemActivate?: (item: { href: string; title: string }) => void;
  onSignOut: () => void;
  /** Optional action (e.g. close button) shown on the right of the heading row. */
  headerAction?: React.ReactNode;
  /** When true, show nothing in the account section (data still loading). */
  profileLoading?: boolean;
  /** When false, hide the no-location empty-state CTA (controlled by HideCTA rendering param). */
  showEmptyStateCTA?: boolean;
}

/**
 * Profile menu body: account list or empty state, separator, and Profile/Sign Out links.
 * Used inside both dropdown (desktop/tablet) and drawer (mobile).
 */
export default function UserProfileMenuContent({
  accounts,
  fields,
  selectedAccount,
  onAccountSelect,
  onCloseMenu,
  onProfileItemActivate,
  onSignOut,
  headerAction,
  profileLoading = false,
  showEmptyStateCTA = true,
}: UserProfileMenuContentProps): React.ReactElement {
  const { isMobile, isNarrowContactViewport } = useDeviceType();
  const { openMobileLanguageDrawer, isLanguageSwitcherDisabled } = useLanguageSelectionModal();
  const { openMobileContactDrawer } = useContactSupportModal();

  const headingBlock = profileLoading ? null : (
    <div
      className={
        "flex flex-col w-full gap-[4px] pt-[4px] pb-[8px] shrink-0 flex-1 min-w-0 pt-0 pb-0 shrink"
      }
    >
      {accounts.length > 1 && fields.SectionTitle?.value && (
        <div
          className={
            "w-full flex flex-col items-start justify-center overflow-hidden h-[31px] py-[8px] px-[16px] rounded-[4px]"
          }
        >
          <Heading
            level={3}
            className={
              "text-[12px] font-medium leading-[1.25] m-0 text-[var(--color-text-heading-color)]"
            }
          >
            <ContentSdkText field={fields.SectionTitle} tag="span" />
          </Heading>
        </div>
      )}
      {accounts.length === 1 && (
        <div
          className={
            "w-full flex flex-col items-start justify-center overflow-hidden h-[31px] py-[8px] px-[16px] rounded-[4px]"
          }
        >
          <Heading
            level={3}
            className={
              "text-[12px] font-medium leading-[1.25] m-0 text-[var(--color-text-heading-color)]"
            }
          >
            <ContentSdkText field={fields.SingleAccountTitle} tag="span" />
          </Heading>
        </div>
      )}
    </div>
  );

  return (
    <>
      {headerAction ? (
        <div
          className={
            "flex flex-row items-center justify-between w-full gap-2 shrink-0 pt-[4px] pb-[8px]"
          }
        >
          {headingBlock}
          {headerAction}
        </div>
      ) : (
        headingBlock
      )}

      {!profileLoading && (
        <div
          className={cn(
            "flex flex-col w-full min-h-0 overflow-y-auto overscroll-y-contain max-h-[min(60vh,320px)]",
            accounts.length <= 1 && "max-h-none overflow-visible"
          )}
        >
          {accounts.length > 0 ? (
            accounts.length === 1 ? (
              <div className={"w-full py-[4px] px-[4px] bg-[var(--color-bg-selected-tint)]"}>
                <div
                  className={cn("w-full flex flex-col items-start gap-[4px] px-[8px]", "px-[4px]")}
                >
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className={cn(
                        "flex items-center w-full transition-colors duration-150 border-0 cursor-pointer px-[12px] py-[10px] rounded-[4px] gap-[12px] bg-white",
                        "justify-between bg-[var(--color-bg-selected-tint)] cursor-default hover:bg-[var(--color-bg-selected-tint)]"
                      )}
                      role="presentation"
                    >
                      {fields.CompanyIcon?.value?.src && (
                        <ContentSdkImage
                          field={fields.CompanyIcon}
                          className={"shrink-0 object-contain w-[16px] h-[16px]"}
                          width={Number(fields.CompanyIcon?.value?.width) || 16}
                          height={Number(fields.CompanyIcon?.value?.height) || 16}
                          alt=""
                          aria-hidden="true"
                        />
                      )}
                      <div className={"flex flex-col flex-1 min-w-0 gap-[2px] text-left"}>
                        <span
                          className={
                            "text-[12px] font-medium leading-[1.25] overflow-hidden break-words line-clamp-2 text-[var(--color-text-muted)] text-[var(--color-text-primary-dark)]"
                          }
                        >
                          {account.companyName}
                        </span>
                        <span
                          className={
                            "text-[10.5px] font-normal leading-[14px] overflow-hidden break-words line-clamp-2 text-[var(--color-text-secondary)]"
                          }
                        >
                          {account.address}
                        </span>
                      </div>
                      <ActiveAccountIconImage fields={fields} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={"w-full flex flex-col items-start gap-[4px] px-[8px]"}>
                {accounts.map((account) => {
                  const isSelected = selectedAccount?.id === account.id;
                  return (
                    <Button
                      key={account.id}
                      variant="ghost"
                      className={cn(
                        "flex items-center w-full transition-colors duration-150 border-0 cursor-pointer px-[12px] py-[10px] rounded-[4px] gap-[12px] bg-white",
                        isSelected &&
                          "justify-between bg-[var(--color-bg-selected-tint)] hover:bg-[var(--color-bg-selected-tint)]"
                      )}
                      onPress={() => onAccountSelect(account)}
                      type="button"
                    >
                      {fields.CompanyIcon?.value?.src && (
                        <ContentSdkImage
                          field={fields.CompanyIcon}
                          className={"shrink-0 object-contain w-[16px] h-[16px]"}
                          width={Number(fields.CompanyIcon?.value?.width) || 16}
                          height={Number(fields.CompanyIcon?.value?.height) || 16}
                          alt=""
                          aria-hidden="true"
                        />
                      )}
                      <div className={"flex flex-col flex-1 min-w-0 gap-[2px] text-left"}>
                        <span
                          className={
                            "text-[12px] font-medium leading-[1.25] overflow-hidden break-words line-clamp-2 text-[var(--color-text-muted)] text-[var(--color-text-primary-dark)]"
                          }
                        >
                          {account.companyName}
                        </span>
                        <span
                          className={
                            "text-[10.5px] font-normal leading-[14px] overflow-hidden break-words line-clamp-2 text-[var(--color-text-secondary)]"
                          }
                        >
                          {account.address}
                        </span>
                      </div>
                      {isSelected && <ActiveAccountIconImage fields={fields} />}
                    </Button>
                  );
                })}
              </div>
            )
          ) : (
            <div
              className={
                "flex flex-col items-center justify-center w-full gap-[16px] pt-[12px] pb-[16px]"
              }
            >
              {fields.NoLocationIcon?.value?.src && (
                <ContentSdkImage
                  field={fields.NoLocationIcon}
                  className={"shrink-0 text-[22px] text-[var(--color-icon-muted)]"}
                  width={Number(fields.NoLocationIcon?.value?.width) || 22}
                  height={Number(fields.NoLocationIcon?.value?.height) || 22}
                  alt=""
                  aria-hidden
                />
              )}
              {fields.NoLocationTitle?.value && (
                <p
                  className={
                    "text-[14px] font-medium leading-[1.25] text-center text-[var(--color-text-heading-color)]"
                  }
                >
                  <ContentSdkText field={fields.NoLocationTitle} tag="span" />
                </p>
              )}
              {fields.NoLocationCTA?.value?.href && showEmptyStateCTA && (
                <LinkRender
                  field={fields.NoLocationCTA}
                  className={
                    "flex items-center justify-center rounded-full border border-solid px-[6px] py-[8px] text-[12px] font-normal leading-[1.25] bg-white no-underline transition-colors duration-150 text-[var(--color-action-primary)]"
                  }
                >
                  {fields.NoLocationCTA?.value?.text}
                </LinkRender>
              )}
            </div>
          )}
        </div>
      )}

      <div className={"w-full h-px bg-[var(--color-border-default)]"} />

      <div
        className={cn(
          "flex flex-col items-start w-full pt-[8px] gap-[4px] px-[4px]",
          "shrink-0",
          accounts.length === 0 && "px-[6px]"
        )}
      >
        {Array.isArray(fields.ProfileItems) &&
          fields.ProfileItems.map((item) => {
            const linkField = item.fields?.Link;
            const iconField = item.fields?.Icon;
            const href = linkField?.value?.href?.trim() ?? "";
            const title = String(item.fields?.Title?.value ?? linkField?.value?.text ?? "");
            const isLanguageItem = item.fields?.LanguagePopup?.value === true;
            const isContactItem = item.fields?.ContactPopup?.value === true;
            const normalizedHref = href.toLowerCase();
            const isProfileSettingsItem =
              title.toLowerCase().includes("profile settings") ||
              /\/profile-setting(?:\/|$)/.test(normalizedHref) ||
              /\/profile(?:\/|$)/.test(normalizedHref);

            if (isLanguageItem && isLanguageSwitcherDisabled) {
              return null;
            }

            if ((isLanguageItem || isContactItem) && !isMobile) {
              return null;
            }

            if (isContactItem && isMobile && !isNarrowContactViewport) {
              return null;
            }

            if (isLanguageItem || isContactItem) {
              return (
                <div key={item.id} className={"w-full"}>
                  <Button
                    variant="ghost"
                    className={
                      "flex items-center justify-start w-full transition-colors duration-150 border-0 cursor-pointer rounded-[4px] gap-[12px] p-[12px] bg-white"
                    }
                    onPress={() => {
                      onCloseMenu();
                      if (isContactItem) {
                        openMobileContactDrawer();
                      } else if (isLanguageItem) {
                        openMobileLanguageDrawer();
                      }
                    }}
                    type="button"
                  >
                    {iconField?.value?.src && (
                      <ContentSdkImage
                        field={iconField}
                        className={"shrink-0 object-contain w-[16px] h-[16px]"}
                        width={Number(iconField?.value?.width) || 16}
                        height={Number(iconField?.value?.height) || 16}
                        alt=""
                        aria-hidden="true"
                      />
                    )}
                    <ContentSdkText
                      field={{ value: item.fields?.Title?.value ?? "" }}
                      tag="span"
                      className={
                        "text-[12px] font-medium leading-[1.25] text-[var(--color-text-heading-color)]"
                      }
                    />
                  </Button>
                </div>
              );
            }

            if (!href || !linkField) return null;
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isProfileSettingsItem) {
                    onProfileItemActivate?.({ href, title });
                  }
                  onCloseMenu();
                }}
                className={"w-full"}
              >
                <LinkRender
                  field={linkField}
                  className={
                    "flex items-center justify-start w-full transition-colors duration-150 border-0 cursor-pointer rounded-[4px] gap-[12px] p-[12px] bg-white"
                  }
                >
                  {iconField?.value?.src && (
                    <ContentSdkImage
                      field={iconField}
                      className={"shrink-0 object-contain w-[16px] h-[16px]"}
                      width={Number(iconField?.value?.width) || 16}
                      height={Number(iconField?.value?.height) || 16}
                      alt=""
                      aria-hidden="true"
                    />
                  )}
                  <ContentSdkText
                    field={{ value: item.fields?.Title?.value ?? "" }}
                    tag="span"
                    className={
                      "text-[12px] font-medium leading-[1.25] text-[var(--color-text-heading-color)]"
                    }
                  />
                </LinkRender>
              </div>
            );
          })}

        <Button
          variant="ghost"
          className={
            "flex items-center justify-start w-full transition-colors duration-150 border-0 cursor-pointer rounded-[4px] gap-[12px] p-[12px] bg-white"
          }
          onPress={onSignOut}
          type="button"
          aria-label={
            fields.SignOutText?.value?.trim()
              ? undefined
              : String(fields.SignOutIcon?.value?.alt || "Sign out")
          }
        >
          {fields.SignOutIcon?.value?.src && (
            <ContentSdkImage
              field={fields.SignOutIcon}
              className={"shrink-0 object-contain w-[16px] h-[16px]"}
              width={Number(fields.SignOutIcon?.value?.width) || 16}
              height={Number(fields.SignOutIcon?.value?.height) || 16}
              alt=""
              aria-hidden="true"
            />
          )}
          {fields.SignOutText?.value && (
            <ContentSdkText
              field={fields.SignOutText}
              tag="span"
              className={
                "text-[12px] font-medium leading-[1.25] text-[var(--color-text-heading-color)]"
              }
            />
          )}
        </Button>
      </div>
    </>
  );
}
