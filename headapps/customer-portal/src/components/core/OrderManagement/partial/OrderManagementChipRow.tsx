"use client";

import { useTranslations } from "next-intl";
import React from "react";
import Button from "@/components/ui/Button";
import type { OrderManagementShell } from "@/hooks/useOrderManagementShell";
import { I18N } from "@/lib/dictionary-keys";

import type { BeltSubgroupMetaRow } from "../OrderManagement.type";
import { RenderSelectedChip } from "./RenderSelectedChip";

export function OrderManagementChipRow({
  orderManagement,
}: {
  orderManagement: OrderManagementShell;
}): React.ReactElement | null {
  const t = useTranslations();
  const {
    tabFields,
    statusSelections,
    statusPhrase,
    removeStatusChip,
    beltSubgroupMeta,
    beltApplied,
    removeBeltChip,
    beltCount,
    clearAllChips,
  } = orderManagement;

  if (!tabFields) return null;

  if (statusSelections.size === 0 && beltCount === 0) return null;

  const statusFilterName = tabFields.FilterLabel?.value ?? "Order status";

  return (
    <div className="flex w-full min-w-0 shrink-0 grow-0 flex-row flex-wrap items-end gap-[8px] p-0">
      {[...statusSelections].map((key) => (
        <RenderSelectedChip
          key={key}
          label={statusPhrase(key)}
          statusFilterName={statusFilterName}
          handleRemoveClick={() => removeStatusChip(key)}
        />
      ))}
      {beltSubgroupMeta.flatMap((sub: BeltSubgroupMetaRow) =>
        [...beltApplied[sub.key]].map((val) => {
          const name = String(sub.label ?? "").trim() || "Belt filter";
          return (
            <RenderSelectedChip
              key={`${sub.key}-${val}`}
              label={val}
              statusFilterName={name}
              handleRemoveClick={() => removeBeltChip(sub.key, val)}
            />
          );
        })
      )}
      {statusSelections.size > 0 || beltCount > 0 ? (
        <Button
          type="button"
          variant="muted"
          className="self-end px-2! py-0! text-[12px]! rounded-[4px] font-medium! leading-[24px]! text-[#00287B]"
          onPress={() => clearAllChips()}
        >
          {t(I18N.FilterClear)}
        </Button>
      ) : null}
    </div>
  );
}
