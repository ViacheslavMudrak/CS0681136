"use client";

import { Text as ContentSdkText } from "@sitecore-content-sdk/nextjs";
import { useOktaAuth } from "@okta/okta-react";
import React, { useCallback, useMemo } from "react";
import { completeAccountSwitchAfterPreferenceSave } from "@/lib/account-switch-navigation";
import { useProfileContext } from "@/lib/profile-context";
import { saveUserPreferences } from "@/lib/apis/user-preference-api";
import { sortCompanyAccountsByActiveThenName } from "@/lib/utils";
import { resolveViewMyProfilePersonalInfo } from "@/lib/userInfoUtils";
import { useUserProfile } from "@/lib/user-profile-context";
import type { IViewMyProfileFields } from "../ViewMyProfile.type";
import { AccountCard } from "./components/AccountCard";
import { NoAccountCard } from "./components/NoAccountCard";
import { PersonalInfoCard } from "./components/PersonalInfoCard";
import { SupportBanner } from "./components/SupportBanner";
import { ComponentProps } from "@/lib/component-props";

interface IViewMyProfileVariantProps {
  testId: string;
  fields: IViewMyProfileFields | null;
  params: ComponentProps["params"];
  page: ComponentProps["page"];
}

const ViewMyProfileDefaultVariantBase = ({
  testId,
  fields,
  params,
  page,
}: IViewMyProfileVariantProps): React.ReactElement => {
  const safeFields = fields ?? ({} as IViewMyProfileFields);
  const isEditing = page.mode.isEditing;
  const { HideCTA } = params;
  const showEmptyStateCTA = isEditing || !Boolean(Number(HideCTA));
  const { accounts, userDisplay, loading: profileLoading, profile } = useUserProfile();
  const { currentLanguage } = useProfileContext();
  const oktaAuth = useOktaAuth();
  const claims = oktaAuth?.authState?.idToken?.claims as Record<string, unknown> | undefined;

  const { fullName, email } = useMemo(
    () => resolveViewMyProfilePersonalInfo({ profile, oktaClaims: claims }),
    [profile, claims]
  );

  const handleSwitchLocation = useCallback(
    async (accountId: string) => {
      const account = accounts.find((a) => a.id === accountId);
      if (!account) return;

      const result = await saveUserPreferences({
        userEmail: email,
        defaultLanguage: currentLanguage || "",
        defaultAccount: account.id,
        userPreference: 0,
      });
      if (result !== null) {
        completeAccountSwitchAfterPreferenceSave({
          account,
          currentLanguage: currentLanguage || "",
        });
      }
    },
    [accounts, currentLanguage, email]
  );

  const companyAccounts = useMemo(
    () => sortCompanyAccountsByActiveThenName([...accounts]),
    [accounts]
  );
  const accountRepEmail = useMemo(
    () => accounts.find((a) => a.isActive)?.accountRepEmail,
    [accounts]
  );
  const hasAccounts = companyAccounts.length > 0;

  const isVerified = userDisplay?.isVerified ?? true;
  const profileTitle = String(safeFields.ProfileTitle?.value ?? "");
  const profileTitleIndex = profileTitle.toLowerCase().indexOf("profile");

  if (!fields) {
    return <div data-testid={testId} className="flex w-full flex-col gap-6" />;
  }

  return (
    <section
      data-testid={testId}
      className="flex w-full flex-col gap-6"
      aria-labelledby="view-my-profile-title"
    >
      <div className="flex flex-col gap-4 md:h-auto md:flex-row md:items-center md:justify-between">
        <div className="order-1">
          {profileTitle && (
            <h1
              id="view-my-profile-title"
              className="m-0 shrink-0 text-xl font-bold leading-normal text-[var(--color-text-black)] md:text-2xl lg:text-[30px]"
            >
              {profileTitleIndex >= 0 ? (
                <>
                  {profileTitle.slice(0, profileTitleIndex)}
                  <span className="bg-[#FFE81A] p-[5px]">
                    {profileTitle.slice(profileTitleIndex, profileTitleIndex + "profile".length)}
                  </span>
                  {profileTitle.slice(profileTitleIndex + "profile".length)}
                </>
              ) : (
                profileTitle
              )}
            </h1>
          )}
        </div>
        <div className="order-2 w-full md:w-auto">
          <SupportBanner
            icon={safeFields.Icon}
            bannerText={safeFields.BannerText}
            bannerLink={safeFields.BannerLink}
            csrEmail={accountRepEmail}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-6">
        <PersonalInfoCard
          profileSectionTitle={safeFields.ProfileSectionTitle}
          fullName={fullName}
          email={email}
          isVerified={isVerified}
        />

        {!profileLoading && (
          <div className="box-border flex w-full shrink-0 flex-col items-start gap-[21px] border border-[#D7D9DA] bg-white p-[22px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] md:min-w-0 md:flex-1">
            {safeFields.CompanySectionTitle && (
              <>
                <ContentSdkText
                  field={safeFields.CompanySectionTitle}
                  tag="h2"
                  className="m-0 hidden text-[16px] font-[500] leading-[1.25] text-[var(--color-text-black)] md:block lg:text-[18px] lg:text-lg"
                />
                <h2 className="m-0 text-[16px] font-[500] leading-[1.25] text-[var(--color-text-black)] md:hidden">
                  Company Locations
                </h2>
              </>
            )}

            {hasAccounts ? (
              <div className="flex w-full flex-col gap-[21px] md:gap-4 lg:gap-[21px]">
                {companyAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    locationIconActive={safeFields.ActiveLocationIcon}
                    locationIconInactive={safeFields.InactiveLocationIcon}
                    onSwitchLocation={handleSwitchLocation}
                  />
                ))}
              </div>
            ) : (
              <NoAccountCard
                noAccountIcon={safeFields.NoAccountIcon}
                noAccountText={safeFields.NoAccountText}
                noAccountCTA={safeFields.NoAccountCTA}
                hideCTA={!showEmptyStateCTA}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export const ViewMyProfileDefaultVariant = React.memo(ViewMyProfileDefaultVariantBase);
