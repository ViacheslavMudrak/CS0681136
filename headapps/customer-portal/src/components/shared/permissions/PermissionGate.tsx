"use client";

import type { PermissionMatchMode } from "@/lib/permissions";
import { usePermissionGuard } from "@/lib/permission-context";
import type { ReactNode } from "react";

interface PermissionGateProps {
  required: unknown;
  mode?: PermissionMatchMode;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export default function PermissionGate({
  required,
  mode = "any",
  children,
  fallback = null,
  loadingFallback = null,
}: PermissionGateProps) {
  const { isAllowed, isProtected, isLoading } = usePermissionGuard(required, mode);
  if (isProtected && isLoading) return <>{loadingFallback}</>;
  if (!isAllowed) return <>{fallback}</>;
  return <>{children}</>;
}
