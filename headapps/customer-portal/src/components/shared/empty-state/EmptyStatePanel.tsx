"use client";

import type { ReactElement, ReactNode } from "react";
import Button from "@/components/ui/Button";

type RetryButtonProps = {
  label?: string;
  onRetry: () => void;
};

export function RetryButton({
  label = "Retry",
  onRetry,
}: RetryButtonProps): ReactElement {
  return (
    <Button type="button" variant="primary" onPress={() => void onRetry()}>
      {label}
    </Button>
  );
}

type EmptyStatePanelProps = {
  image?: ReactNode;
  heading?: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  testId?: string;
};

export default function EmptyStatePanel({
  image,
  heading,
  body,
  action,
  testId,
}: EmptyStatePanelProps): ReactElement {
  return (
    <div
      className="flex flex-col items-center justify-center text-center gap-[16px] py-[48px] px-[24px] w-full"
      role="alert"
      data-testid={testId}
    >
      {image}
      {heading}
      {body}
      {action ? <div className="flex justify-center w-full pt-[8px]">{action}</div> : null}
    </div>
  );
}
