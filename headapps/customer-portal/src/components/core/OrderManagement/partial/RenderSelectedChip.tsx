"use client";

import Button from "@/components/ui/Button";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@laitram-l-l-c/intralox-ui-components";

interface IRenderSelectedChipProps {
  key: string;
  label: string;
  statusFilterName: string;
  handleRemoveClick: () => void;
}
export const RenderSelectedChip = (props: IRenderSelectedChipProps) => {
  const { key, label, statusFilterName, handleRemoveClick } = props;
  return (
    <div
      key={key}
      className="inline-flex h-[24px] max-w-full shrink-0 grow-0 flex-row items-stretch overflow-hidden rounded-[4px] border border-border-gray p-0"
    >
      <span className="flex max-w-[min(160px,40vw)] shrink-0 items-center truncate bg-bg-selected-tint px-[6px] text-[12px] font-semibold">
        {statusFilterName}
      </span>
      <span className="flex min-h-0 min-w-0 flex-1 items-center truncate bg-bg-basic px-[6px] text-[12px] font-medium text-text-heading">
        {label}
      </span>
      <Button
        type="button"
        variant="ghost"
        className="box-border h-[24px]! min-h-[24px]! w-[24px]! ml-[5px] mr-[5px] p-0! min-w-[24px]! shrink-0 rounded-none border-0 bg-bg-basic text-[8px] hover:bg-transparent focus:bg-transparent focus:ring-0 active:bg-transparent [&_svg]:!h-[12px] [&_svg]:!w-[12px]"
        aria-label={`Remove ${statusFilterName}: ${label}`}
        onClick={handleRemoveClick}
      >
        <Icon icon={faXmark} width={12} height={12} aria-hidden />
      </Button>
    </div>
  );
};
