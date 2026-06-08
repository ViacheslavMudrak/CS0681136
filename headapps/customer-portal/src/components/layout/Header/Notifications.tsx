"use client";
import { Text, NextImage as ContentSdkImage } from "@sitecore-content-sdk/nextjs";
import NextLink from "next/link";

import { CloseIcon } from "@/components/shared/icons";
import Button from "@/components/ui/Button";
import useClickOutside from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";
import { ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useOktaAuth } from "@okta/okta-react";
import { IParams } from "@/helpers/interface";
import { useLanguageSwitcherHandlers } from "@/hooks/use-language-switcher-handlers";
import { useProfileContext } from "@/lib/profile-context";
import type { ProfileAccount } from "@/lib/types/user-profile";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/user-profile-context";
import { fireAccountSwitchEvents } from "@/lib/account-switch-events";
import { saveUserPreferences } from "@/lib/apis/user-preference-api";

const notificationLinkClass =
  "m-0 cursor-pointer border-none bg-none p-0 text-[var(--color-link-text)] no-underline transition-all duration-150 hover:text-[var(--color-link-text)] hover:underline";

export type NotificationType = "all" | "orders" | "shipments" | "support";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string | ReactNode;
  description: string;
  timestamp: string;
  isUnread: boolean;
  itemId?: string;
  detailLink?: string;
  linkableText?: string;
  accountId?: string;
  accountName?: string;
  icon: any;
  iconBgColor: string;
}

interface ConfirmationMessage {
  accountName: string;
  notificationId: string;
}

export const WORKFLOW_TYPE = {
  ORDER_CANCELLED: "order-cancelled",
  ORDER_PLACED: "order-placed",
  ORDER_SHIPPED: "order-shipped",
  SHIPMENT_WITH_CARRIER: "shipment-with-carrier",
  SHIPMENT_WITHOUT_CARRIER: "shipment-without-carrier",
  SUPPORT: "support",
} as const;

const LINKABLE_WORKFLOWS: ReadonlySet<string> = new Set<string>([
  WORKFLOW_TYPE.ORDER_PLACED,
  WORKFLOW_TYPE.ORDER_CANCELLED,
  WORKFLOW_TYPE.ORDER_SHIPPED,
  WORKFLOW_TYPE.SHIPMENT_WITH_CARRIER,
  WORKFLOW_TYPE.SHIPMENT_WITHOUT_CARRIER,
]);

const getDetailPageLink = (workflow: string, itemId: string, locale: string): string => {
  switch (workflow) {
    case WORKFLOW_TYPE.ORDER_PLACED:
    case WORKFLOW_TYPE.ORDER_CANCELLED:
    case WORKFLOW_TYPE.ORDER_SHIPPED:
      return `/${locale}/Orders-Management/Orders/${itemId}`;
    case WORKFLOW_TYPE.SHIPMENT_WITH_CARRIER:
    case WORKFLOW_TYPE.SHIPMENT_WITHOUT_CARRIER:
      return `/${locale}/Orders-Management/Shipments/${itemId}`;
    case WORKFLOW_TYPE.SUPPORT:
      return `/${locale}/Support/${itemId}`;
    default:
      return "";
  }
};

const workflowSlugFromConfigName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, "-");

const findNotificationConfig = (workflow: string | undefined, selection: any[]) => {
  const key = workflow?.toLowerCase() ?? "";
  if (!key || !selection?.length) {
    return undefined;
  }
  return selection.find((config) => workflowSlugFromConfigName(config.name ?? "") === key);
};

const getItemIdForWorkflow = (workflow: string, dataMap: Record<string, string>): string => {
  switch (workflow) {
    case WORKFLOW_TYPE.ORDER_PLACED:
    case WORKFLOW_TYPE.ORDER_CANCELLED:
    case WORKFLOW_TYPE.ORDER_SHIPPED:
      return dataMap.OrderNumber;
    case WORKFLOW_TYPE.SHIPMENT_WITH_CARRIER:
    case WORKFLOW_TYPE.SHIPMENT_WITHOUT_CARRIER:
      return dataMap.TrackingNumber || dataMap.OrderNumber;
    default:
      return "";
  }
};

const buildTitleWithLink = (
  titleText: string,
  itemId: string,
  detailLink: string,
  onTitleLinkClick: () => void
): string | ReactNode => {
  if (!itemId || !detailLink || !titleText.includes(itemId)) {
    return titleText;
  }
  const [before, after] = titleText.split(itemId);
  return (
    <>
      {before}
      <NextLink
        href={detailLink}
        className={notificationLinkClass}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onTitleLinkClick();
        }}
      >
        {itemId}
      </NextLink>
      {after}
    </>
  );
};

const getMessagePreview = (
  message: any,
  notificationTypeSelection: any[],
  locale: string,
  onTitleLinkClick?: () => void
) => {
  const notificationConfig = findNotificationConfig(message.workflow, notificationTypeSelection);

  if (!notificationConfig) {
    return {
      title: "New notification" as const,
      description: "New notification" as const,
    };
  }

  const dataMap: Record<string, string> = {
    OrderNumber: message?.data?.orderNumber ?? message?.data?.order_number ?? "",
    TrackingNumber: message?.data?.trackingNumber ?? message?.data?.tracking_number ?? "",
    CarrierName: message?.data?.carrier ?? message?.data?.carrierName ?? "",
  };

  const replacePlaceholders = (template: string) =>
    template.replace(/\{([^}]+)\}/g, (_, key: string) => dataMap[key] || "");

  const titleText = replacePlaceholders(notificationConfig?.fields?.ItemTitle?.value || "");
  const descriptionText = replacePlaceholders(notificationConfig?.fields?.ItemMessage?.value || "");

  const workflow = message.workflow as string | undefined;
  const accountId = message?.data?.accountId;
  const accountName = message?.data?.accountName;

  if (!workflow || !LINKABLE_WORKFLOWS.has(workflow)) {
    return {
      title: titleText,
      description: descriptionText,
      accountId,
      accountName,
    };
  }

  const itemId = getItemIdForWorkflow(workflow, dataMap);
  const detailLink = itemId ? getDetailPageLink(workflow, itemId, locale) : "";

  if (!itemId || !detailLink) {
    return {
      title: titleText,
      description: descriptionText,
      accountId,
      accountName,
    };
  }

  const title =
    onTitleLinkClick != null
      ? buildTitleWithLink(titleText, itemId, detailLink, onTitleLinkClick)
      : titleText;

  return {
    title,
    description: descriptionText,
    itemId,
    detailLink,
    linkableText: itemId,
    accountId,
    accountName,
  };
};

interface INotificationProps extends IParams {
  fields: any;
  params: IParams;
}

const MOBILE_SHEET_MEDIA = "(max-width: 767px)";

const renderNotificationText = (
  text: string,
  linkableText: string | undefined,
  onClick?: () => void
): ReactNode => {
  if (!linkableText || !text.includes(linkableText)) {
    return text;
  }

  const [before, after] = text.split(linkableText);

  return (
    <>
      {before}
      <button
        onClick={onClick}
        className={notificationLinkClass}
        style={{ all: "unset", cursor: "pointer", color: "inherit" }}
      >
        {linkableText}
      </button>
      {after}
    </>
  );
};

export default function Notifications({ fields, params }: INotificationProps) {
  const panelTitleId = useId();
  const {
    Title,
    MarkAllLabel,
    EmptyStateTitle,
    EmptyStateIcon,
    Icon,
    NotificationTypeSelection,
    ConfirmationMessage,
    ConfirmationButtonText,
  } = fields;

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [confirmationMessage, setConfirmationMessage] = useState<ConfirmationMessage | null>(null);
  const [isMobileSheet, setIsMobileSheet] = useState(false);
  const [portalMounted, setPortalMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { authState } = useOktaAuth();

  const { currentLanguage } = useLanguageSwitcherHandlers(null);
  const locale = currentLanguage?.fields?.LanguageSource?.fields?.Iso?.value || "en";
  const { selectedAccount, setSelectedAccount } = useProfileContext();
  const router = useRouter();

  const oktaEmail = authState?.idToken?.claims?.email as string | undefined;

  const { accounts } = useUserProfile();

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen && !isMobileSheet);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_SHEET_MEDIA);
    const sync = () => setIsMobileSheet(mq.matches);
    sync();
    setPortalMounted(true);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isOpen || !isMobileSheet) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, isMobileSheet]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (confirmationMessage) {
      const timer = setTimeout(() => {
        setConfirmationMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [confirmationMessage]);

  const readAllMessages = async () => {
    const messageResponse = await fetch(`/api/notifications`, {
      headers: {
        Authorization: `Bearer ${authState?.accessToken?.accessToken}`,
      },
    });

    if (messageResponse.ok) {
      const data: Array<NotificationItem> = await messageResponse.json();

      const mapped = data.map((n) => {
        const item = {
          ...n,
          timestamp: formatTimestamp(n.timestamp),
        } as NotificationItem;
        const preview = getMessagePreview(n, NotificationTypeSelection, locale, () =>
          handleNotificationClick(item)
        );
        Object.assign(item, preview);
        return item;
      });
      setNotifications(mapped);
    } else {
      setNotifications([]);
    }
  };

  // useEffect(() => {
  //   if (authState?.isAuthenticated && authState.accessToken) {
  //     readAllMessages();
  //   }
  // }, [authState?.isAuthenticated]);

  const markMessageAsRead = async (messageId: string, markAllAsRead: boolean) => {
    const res = await fetch(`/api/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authState?.accessToken?.accessToken}`,
      },
      body: JSON.stringify({
        messageId,
        markAllAsRead,
      }),
    });

    if (res.ok) {
      return true;
    }

    return false;
  };

  const handleMarkAllAsRead = async () => {
    const isSuccessful = await markMessageAsRead("", true);
    if (isSuccessful) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    }
  };

  const handleSelectAccount = useCallback(
    async (accountId: string) => {
      const account = accounts.find((a) => a.id === accountId);
      if (account) {
        setSelectedAccount(account);
        fireAccountSwitchEvents(account, locale || "");
        const result = await saveUserPreferences({
          userEmail: oktaEmail ?? "",
          defaultLanguage: locale || "",
          defaultAccount: account.id,
          userPreference: 0,
        });
        if (result !== null) {
          window.location.reload();
        }
      }

      if (!account) {
        router.refresh();
      }
    },
    [accounts, setSelectedAccount, locale, router, oktaEmail]
  );

  const handleNotificationClick = async (notification: NotificationItem) => {
    const { id, accountId, accountName, detailLink } = notification;

    const isSuccessful = await markMessageAsRead(id, false);
    if (isSuccessful) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n)));
    }

    if (accountId && selectedAccount?.id !== accountId) {
      setConfirmationMessage({
        accountName: accountName || "Unknown Account",
        notificationId: id,
      });

      handleSelectAccount(accountId);

      setTimeout(() => {
        if (detailLink) {
          router.push(detailLink);
        }
      }, 500);
    } else if (detailLink) {
      router.push(detailLink);
    }
  };

  const handleDismissConfirmation = () => {
    setConfirmationMessage(null);
  };

  const hasUnread = notifications.some((n) => n.isUnread);

  const closePanel = useCallback(() => setIsOpen(false), []);

  const renderNotificationRows = () =>
    notifications.length === 0 ? (
      <div className="flex flex-col items-center justify-center px-[16px] py-[10px]">
        <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#f8fafd]">
          <ContentSdkImage
            field={EmptyStateIcon}
            width={16}
            height={16}
            alt={(EmptyStateIcon.value.alt ?? "No Notification icon") as string}
            loading="lazy"
          />
        </div>

        <p className="text-[12px] font-normal text-[var(--color-gray-700)]">
          <Text field={EmptyStateTitle} tag="span" />
        </p>
      </div>
    ) : (
      notifications.map((notification) => {
        const notificationElement = (
          <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
            <div className="flex min-h-[18px] items-start justify-between gap-[8px]">
              <h5 className="m-0 flex-1 text-[12px] font-medium leading-[1.25] text-[var(--color-text-black)]">
                {typeof notification.title === "string"
                  ? renderNotificationText(notification.title, notification.linkableText, () =>
                      handleNotificationClick(notification)
                    )
                  : notification.title}
              </h5>
              {notification.isUnread && (
                <div
                  className="mt-[4px] h-[8px] w-[8px] shrink-0 rounded-full bg-[#0084BB]"
                  aria-hidden="true"
                />
              )}
            </div>
            <p className="m-0 text-[12px] font-normal leading-[1.25] text-[var(--color-text-heading-color)]">
              {renderNotificationText(notification.description, notification.linkableText, () =>
                handleNotificationClick(notification)
              )}
            </p>
            <p className="m-0 text-[10.5px] font-normal leading-[14px] text-[var(--color-gray-700)]">
              {notification.timestamp}
            </p>
          </div>
        );

        return (
          <button
            key={notification.id}
            type="button"
            className="flex w-full border-b border-solid border-[var(--color-border-default)] bg-[var(--color-bg-basic-color)] p-[16px] text-start transition-colors duration-150 hover:bg-[#f8fafd]"
            onClick={() => handleNotificationClick(notification)}
          >
            {notificationElement}
          </button>
        );
      })
    );

  const markAllFooter =
    hasUnread && notifications.length > 0 ? (
      <div className="shrink-0 border-t border-solid border-[var(--color-border-default)] bg-[var(--color-bg-basic-color)] px-4 py-3">
        <Button
          variant="muted"
          onPress={handleMarkAllAsRead}
          className={cn(
            "cursor-pointer justify-end border-0 bg-transparent p-0 text-[12px] font-medium leading-[1.25] text-[var(--color-link-text)] no-underline transition-colors duration-150 hover:underline",
            "flex min-h-[44px] w-full items-center justify-center"
          )}
        >
          <Text field={MarkAllLabel} tag="span" />
        </Button>
      </div>
    ) : null;

  const mobileSheet =
    isOpen && isMobileSheet && portalMounted && typeof document !== "undefined"
      ? createPortal(
          <>
            <Button
              type="button"
              variant="transparent"
              onPress={closePanel}
              className="fixed inset-0 z-50 rounded-none bg-black/50"
              aria-label="Close notifications"
            >
              <span aria-hidden="true" />
            </Button>
            <div
              className="fixed bottom-0 left-1/2 z-50 flex max-h-[85vh] w-full max-w-[min(100vw,343px)] -translate-x-1/2 flex-col overflow-hidden rounded-t-[12px] border border-b-0 border-solid border-[var(--color-border-default)] bg-[var(--color-bg-basic-color)] shadow-[var(--color-shadow-dropdown)]"
              role="dialog"
              aria-modal="true"
              aria-labelledby={panelTitleId}
            >
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-solid border-[var(--color-border-default)] p-4">
                <Text
                  tag="h4"
                  field={Title}
                  className="m-0 min-w-0 flex-1 text-[14px] font-medium leading-[1.25] text-[var(--color-text-black)]"
                  id={panelTitleId}
                />
                <Button
                  type="button"
                  variant="transparent"
                  onPress={closePanel}
                  className="flex h-8 shrink-0 cursor-pointer items-center justify-end rounded-full border-0 bg-transparent transition-colors duration-150 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <CloseIcon width={20} height={20} decorative />
                </Button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{renderNotificationRows()}</div>
                {markAllFooter}
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <div className="relative md:mr-[15px]" ref={dropdownRef}>
      <Button
        variant="transparent"
        onPress={() => setIsOpen(!isOpen)}
        className={cn(
          "min-w-0 h-9 px-2.5 rounded-sm",
          "flex justify-center items-center gap-1",
          "transition-colors duration-150",
          "hover:bg-gray-50 text-[12px]",
          "!px-[10px] !py-[9px]"
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Notifications"
      >
        <div className="relative flex justify-center items-center">
          <ContentSdkImage
            field={Icon}
            width={16}
            height={16}
            alt={(Icon.value.alt ?? "Notification icon") as string}
            loading="lazy"
          />

          {hasUnread && (
            <div
              className="absolute top-[-5px] start-[5px] min-w-[14px] h-[14px] px-[4px] rounded-full bg-[var(--color-brand-red)] inline-flex justify-center items-center"
              aria-hidden="true"
            >
              <span className="text-[var(--color-text-white)] text-[12px] font-normal leading-3">
                {notifications.filter((n) => n.isUnread).length}
              </span>
            </div>
          )}
        </div>
      </Button>

      {isOpen && !isMobileSheet && (
        <div className="absolute top-full z-50 mt-2 flex w-[336px] max-h-[min(85vh,560px)] flex-col overflow-hidden rounded-[6px] border border-solid border-[var(--color-border-default)] bg-[var(--color-bg-basic-color)] shadow-[var(--color-shadow-dropdown)] end-0">
          <div className="flex justify-between h-[56px] shrink-0 items-center border-b border-solid border-[var(--color-border-default)] bg-[var(--color-bg-basic-color)] px-[16px]">
            <Text
              field={Title}
              tag="h4"
              className="m-0 text-[14px] font-medium leading-[1.25] text-[var(--color-text-black)]"
            />

            <Button
              variant="muted"
              onPress={handleMarkAllAsRead}
              className={cn(
                "cursor-pointer justify-end border-0 bg-transparent p-0 text-[12px] font-medium leading-[1.25] text-[var(--color-link-text)] no-underline transition-colors duration-150 hover:underline"
              )}
            >
              <Text field={MarkAllLabel} tag="span" />
            </Button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{renderNotificationRows()}</div>
          </div>
        </div>
      )}

      {mobileSheet}

      {confirmationMessage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 animate-[fadeIn_0.3s_ease-in-out]"
          role="alert"
        >
          <div className="flex w-[90%] max-w-[400px] flex-col items-start gap-4 rounded-lg bg-white p-6 shadow-lg animate-[slideUp_0.3s_ease-out]">
            <Text
              tag="p"
              field={{
                value: ConfirmationMessage.value.replace(
                  "{AccountName}",
                  confirmationMessage.accountName
                ),
              }}
            />

            <Button
              variant="primary"
              onPress={handleDismissConfirmation}
              className="mt-2"
            >
              <Text tag="span" field={ConfirmationButtonText} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) {
    if (diffMinutes < 1) return "Just now";
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}
