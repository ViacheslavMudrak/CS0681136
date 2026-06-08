"use client";

import Button from "@/components/ui/Button";
import { NextImage as ContentSdkImage } from "@sitecore-content-sdk/nextjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React from "react";
import { I18N } from "src/lib/dictionary-keys";
import type { ImageField } from "@sitecore-content-sdk/nextjs";
import { cn } from "@/lib/utils";
import type { ICompanyAccount } from "../../ViewMyProfile.type";

interface AccountCardProps {
  account: ICompanyAccount;
  locationIconActive?: ImageField;
  locationIconInactive?: ImageField;
  onSwitchLocation?: (accountId: string) => void;
}

export function AccountCard({
  account,
  locationIconActive,
  locationIconInactive,
  onSwitchLocation,
}: AccountCardProps): React.ReactElement {
  const t = useTranslations();
  const router = useRouter();
  const { companyName, address, accountNumber, isActive, id } = account;
  const locationIcon = isActive ? locationIconActive : locationIconInactive;

  const handleCardClick = () => {
    if (onSwitchLocation) {
      onSwitchLocation(id);
    } else {
      router.refresh();
    }
  };

  return (
    <article
      className={cn(
        "group flex flex-col rounded px-3 py-4 shadow-[var(--color-shadow-account-card)] transition-colors duration-150",
        isActive
          ? "border border-[var(--color-border-active-card)] bg-[var(--color-bg-selected-tint)] hover:border-[#d7d9da] hover:bg-white"
          : "cursor-pointer border border-[var(--color-border-gray-300)] bg-[var(--color-bg-basic-color)] hover:border-[var(--color-action-primary)] hover:[&_.switch-btn]:border hover:[&_.switch-btn]:border-[#00287B] hover:[&_.switch-btn]:bg-[#00287B] hover:[&_.switch-btn]:text-white"
      )}
      data-testid="view-my-profile-account-card"
      data-active={isActive}
      onClick={!isActive ? handleCardClick : undefined}
    >
      <div className="flex w-full items-start gap-[7px]">
        <div className="flex shrink-0 items-start pt-0.5">
          {locationIcon?.value?.src ? (
            <ContentSdkImage
              field={locationIcon}
              width={16}
              height={16}
              alt={(locationIcon.value.alt ?? "Location") as string}
              loading="lazy"
              className="h-4 w-4 object-contain"
            />
          ) : (
            <span className="block size-4 rounded bg-[var(--color-border-gray-300)]" aria-hidden />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <span className="min-w-0 flex-1 lg:text-[16px] text-[14px] font-[500] leading-[1.38] text-[var(--color-text-heading-color)]  ">
              {companyName}
            </span>
            {isActive ? (
              <span className="badgeCurrent flex shrink-0 items-center gap-[5px] rounded-full bg-[var(--color-bg-badge-current)] px-2.5 py-1.5 text-[12px] font-[500] leading-none text-[var(--color-text-primary-dark)] group-hover:bg-[#00287b] group-hover:text-[#fefefe]">
                <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
                {t(I18N.CurrentLocation)}
              </span>
            ) : (
              <Button
                type="button"
                variant="inverse"
                className="switch-btn shrink-0 rounded-full border border-[var(--color-action-primary)] bg-[var(--color-bg-basic-color)] px-[11px] py-[7px] text-xs font-normal leading-[1.375] text-[var(--color-action-primary)] focus:outline-none focus:ring-2 focus-visible:ring-[var(--color-action-primary)] hover:bg-[var(--color-action-primary-hover)]"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation();
                  handleCardClick();
                }}
              >
                {t(I18N.SwitchLocation)}
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-end md:justify-end md:gap-4">
            <p className="min-w-0 flex-1 whitespace-pre-wrap text-[14px] font-[400] leading-[1.38] text-[var(--color-text-heading-color)]">
              {address}
            </p>
            <span className="shrink-0 self-end text-[12px] font-[500] leading-[1.38] text-[var(--color-text-black)] md:self-auto">
              {t(I18N.AccountIdLabel)}
              {accountNumber}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
