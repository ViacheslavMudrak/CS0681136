"use client";

import Image from "next/image";
import React from "react";
import {
  NextImage as ContentSdkImage,
  SitecoreProviderReactContext,
  Text as ContentSdkText,
} from "@sitecore-content-sdk/nextjs";
import { CloseIcon } from "@/components/shared/icons";
import { LinkRender } from "@/components/shared/link-render/LinkRender";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { AccountContactDisplay } from "@/lib/contact-support-utils";
import type { IContactSupportFields } from "../ContactSupport.type";


export interface ContactSupportPanelContentProps {
  isMobile: boolean;
  isTablet: boolean;
  fields: IContactSupportFields;
  accountContacts: AccountContactDisplay[];
  supportLinkHref: string;
  supportLinkText: string;
  copiedPhone: string | null;
  onClose: () => void;
  onEmailClick: (email: string) => void;
  onPhoneClick: (phone: string) => void;
}

export function ContactSupportPanelContent({
  isMobile,
  isTablet,
  fields,
  accountContacts,
  supportLinkHref,
  supportLinkText,
  copiedPhone,
  onClose,
  onEmailClick,
  onPhoneClick,
}: ContactSupportPanelContentProps): React.ReactElement {
  const hasAccountContacts = accountContacts.length > 0;
  const insideSitecorePage = Boolean(React.useContext(SitecoreProviderReactContext)?.page);

  return (
    <>
      {isMobile ? (
        <div className={"flex flex-row items-center justify-between gap-[16px] p-[16px] border-b border-solid border-b-[var(--color-contact-panel-border)]"}>
          {fields.PopupTitle &&
            (insideSitecorePage ? (
              <ContentSdkText
                field={hasAccountContacts ? fields.PopupTitle : fields.NoContactPanelTitle}
                tag="h4"
                className={"flex-1 min-w-0 text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[var(--color-text-black)]"}
              />
            ) : (
              <h4 className={"flex-1 min-w-0 text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[var(--color-text-black)]"}>
                {(hasAccountContacts ? fields.PopupTitle : fields.NoContactPanelTitle)?.value ?? ""}
              </h4>
            ))}
          <Button
            type="button"
            variant="transparent"
            onPress={onClose}
            className={"flex items-center justify-end w-[32px] h-[32px] rounded-full shrink-0 px-0 py-0 border-0 cursor-pointer transition-colors duration-150 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"}
            aria-label="Close"
          >
            <CloseIcon width={20} height={20} decorative />
          </Button>
        </div>
      ) : (
        <div className={"flex flex-col gap-[4px] p-[16px] border-b border-solid border-b-[var(--color-contact-panel-border)]"}>
          {fields.PopupTitle &&
            (insideSitecorePage ? (
              <ContentSdkText
                field={hasAccountContacts ? fields.PopupTitle : fields.NoContactPanelTitle}
                tag="h4"
                className={"flex-1 min-w-0 text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[var(--color-text-black)]"}
              />
            ) : (
              <h4 className={"flex-1 min-w-0 text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[var(--color-text-black)]"}>
                {(hasAccountContacts ? fields.PopupTitle : fields.NoContactPanelTitle)?.value ?? ""}
              </h4>
            ))}
        </div>
      )}

      {hasAccountContacts && (
        <>
          <div className={"flex flex-col overflow-y-auto max-h-[40vh]"}>
            {accountContacts.map((contact) => (
              <div key={contact.id} className={"flex gap-[12px] p-[16px] cursor-default border-b border-solid border-b-[var(--color-contact-panel-border)] transition-colors duration-150"}>
                <div className={"w-[40px] h-[40px] rounded-full shrink-0 flex items-center justify-center bg-[var(--color-contact-avatar-bg)]"}>
                  <span className={"text-[12px] font-medium leading-[100%] text-[var(--color-contact-avatar-text)]"}>{contact.initials}</span>
                </div>
                <div className={"flex flex-col gap-[6px] flex-1 min-w-0"}>
                  <span className={"text-[12px] font-medium leading-[20px] tracking-[-0.1504px] text-[var(--color-text-heading-color)]"}>{contact.fullName}</span>
                  <span className={"text-[12px] font-normal leading-[16px] text-[var(--color-text-muted)]"}>{contact.jobTitle}</span>
                  <div className={"flex flex-col gap-[6px]"}>
                    {contact.email && (
                      <Button
                        variant="transparent"
                        onPress={() => onEmailClick(contact.email!)}
                        className={"inline-flex items-start justify-start gap-[8px] text-left px-0 py-0 w-fit text-[12px] font-medium leading-[16px] text-[var(--color-link-text)] transition-colors duration-150"}
                        aria-label={`Email ${contact.fullName}`}
                        type="button"
                      >
                        <span>{contact.email}</span>
                      </Button>
                    )}
                    {contact.phone && (
                      <Button
                        variant="transparent"
                        onPress={() => onPhoneClick(contact.phone!)}
                        className={"inline-flex items-start justify-start gap-[8px] text-left px-0 py-0 w-fit text-[12px] font-medium leading-[16px] text-[var(--color-link-text)] transition-colors duration-150"}
                        aria-label={`Call ${contact.fullName}`}
                        type="button"
                      >
                        <span>{contact.phone}</span>
                        {!isMobile && copiedPhone === contact.phone && (
                          <span className={"text-[12px] font-medium text-green-600 ml-[4px] ml-0 mr-[4px]"}>Copied!</span>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={"h-[1px] bg-[var(--color-contact-panel-border)]"} />
        </>
      )}

      <div className={"flex flex-col p-[16px] bg-[var(--color-contact-panel-header-bg)] border-t border-solid border-t-[var(--color-contact-panel-border)]"}>
        <div className={"flex items-center gap-[12px]"}>
          {fields.SupportIcon?.value?.src &&
            (insideSitecorePage ? (
              <ContentSdkImage
                field={fields.SupportIcon}
                width={40}
                height={40}
                alt={(fields.SupportIcon.value.alt as string) ?? "Phone"}
                className={"w-[40px] h-[40px] shrink-0 object-contain"}
              />
            ) : (
              <Image
                src={fields.SupportIcon.value.src}
                width={40}
                height={40}
                alt={(fields.SupportIcon.value.alt as string) ?? "Phone"}
                className={"w-[40px] h-[40px] shrink-0 object-contain"}
              />
            ))}
          <div className={"flex flex-col gap-[6px] min-w-0 flex-1"}>
            {fields.SupportTitle &&
              (insideSitecorePage ? (
                <ContentSdkText
                  field={fields.SupportTitle}
                  tag="span"
                  className={"text-[12px] font-medium leading-[1.25] text-[var(--color-text-heading-color)]"}
                />
              ) : (
                <span className={"text-[12px] font-medium leading-[1.25] text-[var(--color-text-heading-color)]"}>{fields.SupportTitle.value ?? ""}</span>
              ))}
            {supportLinkText ? (
              isMobile || isTablet ? (
                <a
                  href={
                    typeof supportLinkHref === "string" && supportLinkHref.startsWith("tel:")
                      ? supportLinkHref
                      : `tel:${supportLinkText.replace(/\s/g, "")}`
                  }
                  className={"text-[14px] font-medium leading-[1.25] justify-start px-0 py-0 w-fit text-[var(--color-action-primary)] transition-colors duration-150 text-right"}
                >
                  {supportLinkText}
                </a>
              ) : (
                <Button
                  variant="transparent"
                  onPress={() => onPhoneClick(supportLinkText)}
                  className={cn("text-[14px] font-medium leading-[1.25] justify-start px-0 py-0 w-fit text-[var(--color-action-primary)] transition-colors duration-150 text-right", "inline-flex")}
                  type="button"
                >
                  {supportLinkText}
                  {copiedPhone === supportLinkText && (
                    <span className={"text-[12px] font-medium text-green-600 ml-[4px] ml-0 mr-[4px]"}>Copied!</span>
                  )}
                </Button>
              )
            ) : (
              fields.SupportLink && (
                <LinkRender field={fields.SupportLink} className={"text-[14px] font-medium leading-[1.25] justify-start px-0 py-0 w-fit text-[var(--color-action-primary)] transition-colors duration-150 text-right"} />
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
