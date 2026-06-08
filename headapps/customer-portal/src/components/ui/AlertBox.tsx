"use client";

import { AlertBox as DXPAlertBox } from "@laitram-l-l-c/intralox-ui-components";
import React from "react";

interface AlertBoxProps {
  message: string | React.ReactNode;
  header?: string;
  variant?: "error" | "info" | "success" | "warning";
  icon?: React.ReactNode;
  className?: string;
}

export default function AlertBox({
  message,
  header,
  variant = "error",
  icon,
  className,
}: AlertBoxProps) {
  return (
    <DXPAlertBox variant={variant} heading={header} icon={icon} className={className}>
      {message}
    </DXPAlertBox>
  );
}