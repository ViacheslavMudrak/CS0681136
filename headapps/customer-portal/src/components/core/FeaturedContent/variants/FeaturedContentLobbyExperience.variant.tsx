"use client";

import { useOktaAuth } from "@okta/okta-react";
import {
  RichText as ContentSdkRichText,
  Text as ContentSdkText,
  LayoutServicePageState,
  SitecoreProviderReactContext,
} from "@sitecore-content-sdk/nextjs";

import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { FEATURED_CONTENT_VARIANTS } from "src/helpers/enums";
import { IParams } from "src/helpers/interface";
import { fetchUserProfile } from "@/lib/apis/user-profile-api";
import { getPreferredLocalePath } from "@/lib/locale-cookie";
import { storeUserProfile } from "@/lib/user-profile-session-storage";
import { sendIdentityEvent } from "@/lib/CDPEvents";
import { IFeaturedContentLobbyExperienceFields } from "../FeaturedContent.type";
import FeaturedContentCard from "./components/FeaturedContentCard";
import { AuthFooterInfo } from "../../Auth/components/AuthFooter/AuthFooter";
import { useUserProfile } from "@/lib/user-profile-context";

interface IFeaturedContentVariantProps {
  testId: string;
  fields: IFeaturedContentLobbyExperienceFields;
  params: IParams;
}

const FeaturedContentLobbyExperienceVariantBase = ({
  testId,
  fields,
}: IFeaturedContentVariantProps) => {
  const { page } = React.useContext(SitecoreProviderReactContext);
  const { setProfileData } = useUserProfile();
  const router = useRouter();
  const oktaAuth = useOktaAuth();
  const userEmail = useMemo(() => {
    const raw = oktaAuth?.authState?.idToken?.claims?.email;
    return typeof raw === "string" && raw.trim() !== "" ? raw.trim() : undefined;
  }, [oktaAuth?.authState?.idToken?.claims?.email]);

  const { pageState } = page.layout.sitecore.context;

  useEffect(() => {
    if (!fields || pageState === LayoutServicePageState.Edit || !userEmail) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const profile = await fetchUserProfile({ email: userEmail });
        if (cancelled) return;
        storeUserProfile(profile, userEmail);
        setProfileData({ profile: profile, loading: false, error: null });
        const contact = profile?.parentContact?.[0];
        const lead = profile?.leads?.[0];
        const identityEmail = userEmail || lead?.email;
        if (identityEmail) {
          sendIdentityEvent({
            firstName: contact?.firstName || lead?.firstName,
            lastName: contact?.lastName || lead?.lastName,
            email: identityEmail,
          });
        }

        if (!profile?.parentContact?.length) {
          return;
        }

        const defaultLanguage = profile.userPreference?.defaultLanguage?.trim();
        const target =
          defaultLanguage != null && defaultLanguage !== ""
            ? (getPreferredLocalePath("/", defaultLanguage) ?? "/")
            : "/";
        router.replace(target);
      } catch {
        // Unauthenticated or profile API unavailable — stay on lobby
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  if (!fields) {
    return (
      <div
        data-testid={testId}
        className="z-[9] flex h-full w-full flex-col items-center justify-center gap-[30px] bg-[var(--color-portal-bg)] px-4"
      />
    );
  }

  const contentCards = fields.ContentCards || [];
  return (
    <section
      data-testid={testId}
      className="z-[9] flex h-full w-full flex-col items-center justify-center gap-[30px] bg-[var(--color-portal-bg)] px-4"
      aria-label="Featured content lobby experience"
    >
      <div
        className="mb-4 mt-8 flex w-full max-w-[467px] flex-none flex-col gap-[30px] rounded-[10px] bg-white p-10 shadow-[0px_10px_30px_rgba(0,0,0,0.1)] lg:mb-4 lg:mt-0"
        role="region"
        aria-label="Content cards"
      >
        <div className="flex w-full flex-none flex-col items-start gap-[30px] rounded-none self-stretch">
          <div className="flex w-full flex-none flex-col items-start gap-[30px] self-stretch grow-0">
            <div className="flex w-full flex-none flex-col items-start gap-3 self-stretch grow-0">
              <ContentSdkText
                field={fields.PrimaryTitle}
                tag="h2"
                className="m-0 min-h-[34px] w-full flex-none self-stretch grow-0 text-center text-[28px] font-normal leading-[33px] tracking-[-0.5px] text-[#222222]"
              />
              <ContentSdkRichText
                field={fields.Description}
                className="w-full min-h-[20px] flex-none self-stretch grow-0 text-center font-normal leading-[125%] tracking-[-0.01em] text-[#4d4d4f]"
              />
            </div>

            <div
              className="flex w-full flex-none grow-0 flex-col items-start gap-[26px] rounded-none"
              role="list"
              aria-label="Featured content cards"
            >
              {contentCards.map((card) => {
                const iconField = card.fields.Icon;
                const iconValue = iconField?.value;

                return (
                  <FeaturedContentCard
                    key={card.id}
                    icon={iconField}
                    iconAlt={String(iconValue?.alt ?? "")}
                    title={<ContentSdkText field={card.fields.Title} tag="p" />}
                    description={<ContentSdkRichText field={card.fields.Description} />}
                    variant={FEATURED_CONTENT_VARIANTS.LOBBY_EXPERIENCE}
                    link={card.fields.Link}
                    isSitecoreEditMode={pageState === LayoutServicePageState.Edit}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <AuthFooterInfo WebsiteURL={fields.WebsiteURL} CopyRightText={fields.CopyRightText} />
    </section>
  );
};

export const FeaturedContentLobbyExperienceVariant = React.memo(
  FeaturedContentLobbyExperienceVariantBase
);
