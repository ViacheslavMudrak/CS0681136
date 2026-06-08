"use client";
import LinkView from "components/callToAction/partial/LinkVIew";
import { useRef, useState } from "react";
import Modal from "components/shared/Modal";
import ButtonView from "components/shared/ButtonView";
import { CheckCircle, Copy, Share2 } from '@laitram-l-l-c/intralox-icon-library';
import { CHROME_ICON_BASE } from 'lib/chrome-icons';
import { IQuickLinkItemFields } from "../Belt.type";
import { RichText } from "@sitecore-content-sdk/nextjs";
import { useTranslations } from "next-intl";
import { I18N } from "lib/dictionary-keys";

interface ISharedButtonProps {
  quickLinkItems?: IQuickLinkItemFields;
}

const SharedButton = ({ quickLinkItems }: ISharedButtonProps) => {
  const t = useTranslations();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const copyUrl = () => {
    navigator.clipboard.writeText(inputRef.current?.value || "");
    inputRef.current?.select();
    setIsCopied(true);
    setTimeout(() => {
      inputRef.current?.blur();
      setIsCopied(false);
    }, 2000);
  };

  return (
    <>
      <ButtonView
        buttonType="pill"
        buttonTheme="contrast"
        className="!border border-action gap-1"
        onClick={() => setIsShareModalOpen(true)}
      >
        <Share2 className={`${CHROME_ICON_BASE} h-4`} aria-hidden="true" />
        {quickLinkItems?.fields?.ShareLink?.value?.text}
      </ButtonView>
      {quickLinkItems?.fields?.RequestQuoteLink?.value?.href && (
        <LinkView
          className="whitespace-nowrap"
          link={quickLinkItems?.fields?.RequestQuoteLink}
          buttonType="pill"
        >
          {quickLinkItems?.fields?.RequestQuoteLink?.value?.text}
        </LinkView>
      )}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        modalSize="md"
      >
        <div className="p-4">
          {quickLinkItems?.fields?.ModalTitle?.value && (
            <RichText
              className="font-bold text-ink-primary text-3xl leading-tight mb-6 mt-4"
              field={quickLinkItems?.fields?.ModalTitle}
              tag="h2"
            />
          )}
          <input
            ref={inputRef}
            className="w-full px-3 py-2 border rounded-xs bg-surface placeholder:text-ink-secondary text-ink-primary text-base leading-tight focus:border-action-focus focus:outline-hidden focus-visible:ring disabled:bg-surface-muted disabled:text-ink-subtle invalid:border-info-error"
            type="text"
            readOnly
            value={typeof window !== "undefined" ? window.location.href : ""}
          />
          <div className="flex self-start justify-end gap-2 mt-6">
            {quickLinkItems?.fields?.CloseButtonText?.value && (
              <ButtonView
                buttonType="pill"
                buttonTheme="contrast"
                className="!border border-action"
                onClick={() => setIsShareModalOpen(false)}
              >
                {quickLinkItems?.fields?.CloseButtonText?.value}
              </ButtonView>
            )}
            {isCopied ? (
              <ButtonView
                buttonType="pill"
                buttonTheme="default"
                className="gap-1 !bg-neutral-200 !text-ink-primary hover:!bg-surface-active active:!bg-surface-active"
                onClick={() => setIsShareModalOpen(false)}
              >
                <CheckCircle className={`${CHROME_ICON_BASE} h-4`} aria-hidden="true" />
                {t(I18N.COPIED)}
              </ButtonView>
            ) : (
              quickLinkItems?.fields?.CopyButtonText?.value && (
                <ButtonView
                  buttonType="pill"
                  buttonTheme="default"
                  onClick={copyUrl}
                  className="gap-1"
                >
                  <Copy className={`${CHROME_ICON_BASE} h-4`} aria-hidden="true" />
                  {quickLinkItems?.fields?.CopyButtonText?.value}
                </ButtonView>
              )
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SharedButton;
