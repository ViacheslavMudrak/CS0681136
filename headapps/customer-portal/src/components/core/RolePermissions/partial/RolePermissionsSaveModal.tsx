"use client";

import { Text } from "@sitecore-content-sdk/nextjs";
import type { Field, TextField } from "@sitecore-content-sdk/nextjs";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

import Modal from "@/components/shared/modal/Modal";
import Button from "@/components/ui/Button";
import { I18N } from "@/lib/dictionary-keys";

export interface RolePermissionsSaveModalProps {
  isOpen: boolean;
  saveTitle?: TextField;
  saveDescription?: Field<string>;
  onClose: () => void;
  onConfirm: () => void;
  isSaving?: boolean;
}

/**
 * Confirms saving permission matrix changes — Figma confirmation modal (body title + description + pill actions).
 */
export function RolePermissionsSaveModal({
  isOpen,
  saveTitle,
  saveDescription,
  onClose,
  onConfirm,
  isSaving = false,
}: RolePermissionsSaveModalProps): ReactElement {
  const t = useTranslations();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={undefined}
      size="md"
      className="h-auto max-h-[min(90vh,calc(100vh-2rem))] w-full max-w-[calc(100vw-2rem)] rounded-2xl bg-[var(--color-bg-basic-color)] outline-none sm:h-auto sm:min-h-0 sm:w-[480px] sm:max-w-[480px] max-[639px]:w-full max-[639px]:max-w-[calc(100vw-2rem)] max-[639px]:rounded-2xl shadow-[var(--color-role-permissions-modal-shadow)]"
      closeButtonClassName="size-6 shrink-0 rounded-xl bg-[var(--color-border-default)] p-0 text-[var(--color-text-placeholder)] transition-colors hover:bg-[var(--color-role-permissions-modal-close-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-gray)] focus:ring-offset-2 [&_span]:leading-none"
      bodyClassName="!flex !flex-col !px-5 !pb-5 !pt-14 max-[639px]:!px-5 max-[639px]:!pb-[21px] max-[639px]:!pt-[52px]"
    >
      <div className="flex w-full flex-col gap-11 max-[639px]:gap-6">
        <div className="flex w-full flex-col gap-4 leading-normal text-[var(--color-text-heading-color)]">
          {saveTitle ? (
            <Text
              field={saveTitle}
              tag="h2"
              className="m-0 min-h-9 p-0 text-[24px] font-[700] leading-[1.5]"
            />
          ) : null}
          {saveDescription ? (
            <Text
              field={saveDescription}
              tag="p"
              className="m-0 p-0 text-[16px] font-[400] leading-[1.5]"
            />
          ) : null}
        </div>
        <div className="flex w-full flex-row flex-wrap items-start justify-end gap-4 max-[639px]:w-full max-[639px]:flex-col-reverse max-[639px]:flex-nowrap max-[639px]:items-stretch max-[639px]:justify-end max-[639px]:gap-4">
          <Button
            type="button"
            variant="transparent"
            onClick={onClose}
            className="!min-w-[112px] !rounded-full !py-[12px] !text-14px] !text-14px] !font-[400] !leading-[1.25] !bg-[var(--color-border-default)] !text-[var(--color-text-heading-color)] hover:!bg-[var(--color-role-permissions-modal-close-hover)] max-[639px]:!w-full max-[639px]:!max-w-none max-[639px]:!min-w-0"
            isDisabled={isSaving}
          >
            {t(I18N.EditCancel)}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            className="!min-w-[112px] !rounded-full !px-[20px] !py-[12px] !text-14px] !font-[400] !leading-[1.25] !bg-[var(--color-action-primary)] !text-[var(--color-text-white)] hover:!opacity-95 max-[639px]:!w-full max-[639px]:!max-w-none max-[639px]:!min-w-0 max-[639px]:!px-3"
            isDisabled={isSaving}
          >
            {t(I18N.EditSave)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
