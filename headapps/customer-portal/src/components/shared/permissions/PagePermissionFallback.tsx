"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { buildLocalizedPathname, getLocaleFromPathname } from "@/lib/locale-path";
import { getPathWithoutLocale } from "@/lib/locale-cookie";

import AccessDenied from "./AccessDenied";

interface PagePermissionFallbackProps {
  isPermissionPage?: boolean;
}

const ROLES_PERMISSIONS_PATH = "/admin/roles-permissions";

export default function PagePermissionFallback({
  isPermissionPage = false,
}: PagePermissionFallbackProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isRolesPermissionsPath = getPathWithoutLocale(pathname) === ROLES_PERMISSIONS_PATH;
  const shouldRedirectToDashboard = isPermissionPage || isRolesPermissionsPath;

  useEffect(() => {
    if (!shouldRedirectToDashboard) return;
    const locale = getLocaleFromPathname(pathname);
    router.replace(buildLocalizedPathname("/", locale));
  }, [pathname, router, shouldRedirectToDashboard]);

  if (shouldRedirectToDashboard) return null;

  return <AccessDenied />;
}
