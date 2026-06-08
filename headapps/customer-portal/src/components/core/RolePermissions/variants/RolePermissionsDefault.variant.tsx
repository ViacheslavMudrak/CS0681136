"use client";

import {
  getAllPermissions,
  getPermissionAuditLogs,
  getProfilePermissions,
  type PermissionAuditLogItem,
  updateProfilePermissions,
} from "@/lib/apis/permissions-api";
import type { AuditLogEntry } from "../partial/auditLogTypes";
import type { ComponentParams, Page } from "@sitecore-content-sdk/nextjs";
import { NextImage as ContentSdkImage, Text as ContentSdkText } from "@sitecore-content-sdk/nextjs";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";

import ChevronRightIcon from "@/components/shared/icons/ChevronRightIcon";
import Button from "@/components/ui/Button";
import { I18N } from "@/lib/dictionary-keys";
import { usePermissionContext } from "@/lib/permission-context";

import type { IRolePermissionsFields, RolePermissionsMatrix } from "../RolePermissions.type";
import {
  buildRolePermissionsMatrix,
  buildUpdatePayloadFromMatrix,
  cloneRolePermissionsMatrix,
} from "@/lib/role-permissions-matrix";
import { RolePermissionsAuditLog } from "../partial/RolePermissionsAuditLog";
import { RolePermissionsSaveModal } from "../partial/RolePermissionsSaveModal";
import { RolePermissionsTable } from "../partial/PermissionsTable";
import { cn } from "@/lib/utils";
import LoadingSkeleton from "@/components/shared/loading-skeleton/LoadingSkeleton";

const AUDIT_LOG_PAGE_SIZE = 10;

function mapPermissionAuditLogsToEntries(logs: PermissionAuditLogItem[]): AuditLogEntry[] {
  return logs.map((log) => ({
    id: log.auditLogId,
    timestamp: new Date(log.updatedAt),
    user: log.updatedByUserName || log.updatedByUserId || "System",
    permission: log.permissionName,
    oldValue: log.oldValue,
    newValue: log.newValue,
    roleCategory: log.profileName,
  }));
}

interface RolePermissionsDefaultVariantProps {
  testId: string;
  fields: IRolePermissionsFields | null;
  params: ComponentParams & { styles?: string; RenderingIdentifier?: string };
  page?: Page;
}

const RolePermissionsDefaultVariantBase = ({
  testId,
  fields,
  params,
  page,
}: RolePermissionsDefaultVariantProps): ReactElement => {
  const t = useTranslations();
  const { refresh: refreshUserPermissions } = usePermissionContext();
  const isPageEditing = page?.mode?.isEditing || page?.mode?.isPreview || false;
  const { styles: paramStyles, RenderingIdentifier: renderingId } = params;
  const safeFields = fields ?? ({} as IRolePermissionsFields);

  const {
    Title,
    AuditLogLabel,
    EditLinkLabel,
    PermissionIcon,
    PermissionEditIcon,
    EditIconChecked,
    EditIconUnchecked,
    SaveTitle,
    SaveDescription,
  } = safeFields;

  const [baseData, setBaseData] = useState<RolePermissionsMatrix | null>(null);
  const [matrixState, setMatrixState] = useState<Record<string, Record<string, boolean>>>({});
  const [committedMatrix, setCommittedMatrix] = useState<Record<string, Record<string, boolean>>>(
    {}
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [auditTotalRecords, setAuditTotalRecords] = useState<number | null>(null);
  const [isAuditLogLoading, setIsAuditLogLoading] = useState(false);
  const [isAuditLogLoadingMore, setIsAuditLogLoadingMore] = useState(false);
  const auditNextPageRef = useRef(1);
  const auditLoadMoreInFlightRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [catalogRes, profilesRes] = await Promise.all([
        getAllPermissions(),
        getProfilePermissions(),
      ]);
      const catalog = catalogRes?.data ?? [];
      const profiles = profilesRes?.data?.profiles ?? [];
      if (!catalog.length) {
        setBaseData({
          roles: [],
          permissions: [],
          matrix: {},
        });
        setMatrixState({});
        setCommittedMatrix({});
        setIsLoading(false);
        return;
      }
      const built = buildRolePermissionsMatrix(catalog, profiles);
      setBaseData(built);
      const m = cloneRolePermissionsMatrix(built.matrix);
      setMatrixState(m);
      setCommittedMatrix(m);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load permissions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleToggle = useCallback((permissionId: string, roleId: string, enabled: boolean) => {
    setMatrixState((prev) => {
      const next = cloneRolePermissionsMatrix(prev);
      if (!next[permissionId]) next[permissionId] = {};
      next[permissionId][roleId] = enabled;
      return next;
    });
  }, []);

  const loadInitialAuditLogs = useCallback(async () => {
    setIsAuditLogLoading(true);
    setAuditEntries([]);
    setAuditTotalRecords(null);
    auditNextPageRef.current = 1;
    try {
      const res = await getPermissionAuditLogs({
        page: 1,
        pageSize: AUDIT_LOG_PAGE_SIZE,
        sortBy: "updatedAt",
        sortDirection: "desc",
      });
      const logs = res?.data?.logs ?? [];
      const total = res?.data?.totalRecords ?? 0;
      setAuditEntries(mapPermissionAuditLogsToEntries(logs));
      setAuditTotalRecords(total);
      auditNextPageRef.current = 2;
    } catch {
      setAuditEntries([]);
      setAuditTotalRecords(null);
    } finally {
      setIsAuditLogLoading(false);
    }
  }, []);

  const loadMoreAuditLogs = useCallback(async () => {
    if (auditLoadMoreInFlightRef.current) return;
    if (auditTotalRecords !== null && auditEntries.length >= auditTotalRecords) return;
    if (isAuditLogLoading || isAuditLogLoadingMore) return;

    auditLoadMoreInFlightRef.current = true;
    setIsAuditLogLoadingMore(true);
    const page = auditNextPageRef.current;
    try {
      const res = await getPermissionAuditLogs({
        page,
        pageSize: AUDIT_LOG_PAGE_SIZE,
        sortBy: "updatedAt",
        sortDirection: "desc",
      });
      const logs = res?.data?.logs ?? [];
      const mapped = mapPermissionAuditLogsToEntries(logs);
      if (mapped.length > 0) {
        setAuditEntries((prev) => [...prev, ...mapped]);
        if (res?.data?.totalRecords != null) {
          setAuditTotalRecords(res.data.totalRecords);
        }
      } else {
        setAuditTotalRecords(auditEntries.length);
      }
      auditNextPageRef.current = page + 1;
    } finally {
      setIsAuditLogLoadingMore(false);
      auditLoadMoreInFlightRef.current = false;
    }
  }, [auditEntries.length, auditTotalRecords, isAuditLogLoading, isAuditLogLoadingMore]);

  const hasMoreAuditLogs = auditTotalRecords !== null && auditEntries.length < auditTotalRecords;

  const handleEditClick = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleAuditLogOpen = useCallback(async () => {
    setIsAuditLogOpen(true);
    await loadInitialAuditLogs();
  }, [loadInitialAuditLogs]);

  const handleEditCancel = useCallback(() => {
    setMatrixState(cloneRolePermissionsMatrix(committedMatrix));
    setIsEditMode(false);
  }, [committedMatrix]);

  const handleSaveClick = useCallback(() => {
    setSaveError(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    if (isSaving) return;
    setIsModalOpen(false);
  }, [isSaving]);

  const handleModalConfirm = useCallback(async () => {
    if (!baseData) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const snapshot: RolePermissionsMatrix = {
        ...baseData,
        matrix: matrixState,
      };
      const payload = buildUpdatePayloadFromMatrix(snapshot);
      const res = await updateProfilePermissions(payload);
      if (res?.success) {
        setCommittedMatrix(cloneRolePermissionsMatrix(matrixState));
        setIsModalOpen(false);
        setIsEditMode(false);
        await loadData();
        await refreshUserPermissions();
      } else {
        setSaveError(res?.message ?? "Save failed");
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }, [baseData, matrixState, loadData, refreshUserPermissions]);

  const permissionColumnLabel = t(I18N.PermissionNameColumn);

  return (
    <section
      className={cn(
        "relative inline-flex w-full flex-col items-start justify-start overflow-hidden",
        paramStyles
      )}
      id={renderingId}
      data-testid={testId}
    >
      <div className="w-full self-stretch">
        <div className="flex flex-col items-start justify-start gap-[21px] self-stretch max-[639px]:gap-4">
          <div className="flex w-full flex-col items-start justify-start gap-[21px] max-[639px]:gap-5">
            <div
              className={cn(
                "flex min-h-[42px] w-full flex-row flex-wrap items-center justify-between gap-3 max-[639px]:min-h-0 max-[639px]:flex-col max-[639px]:items-start max-[639px]:justify-start max-[639px]:gap-5",
                !isEditMode &&
                  "gap-6 max-[639px]:flex-row max-[639px]:flex-nowrap max-[639px]:items-center max-[639px]:justify-between max-[639px]:gap-3"
              )}
            >
              <div
                className={cn(
                  "flex min-w-0 flex-1 items-center justify-start",
                  !isEditMode && "max-[639px]:min-w-0 max-[639px]:flex-1 max-[639px]:pe-1"
                )}
              >
                {(Title?.value || isPageEditing) && (
                  <ContentSdkText
                    field={Title}
                    tag="h2"
                    className={cn(
                      "m-0 text-[var(--color-text-black)]",
                      isEditMode
                        ? "text-[32px] font-bold leading-[38px] max-[639px]:text-2xl max-[639px]:leading-[1.25]"
                        : "lg:text-[30px] font-[700] leading-[1.25] text-[24px]"
                    )}
                  />
                )}
              </div>

              <div
                className={cn(
                  "flex shrink-0 flex-row flex-wrap items-center gap-3 max-[639px]:w-full max-[639px]:flex-row max-[639px]:flex-wrap max-[639px]:items-center max-[639px]:justify-between max-[639px]:gap-2",
                  !isEditMode &&
                    "max-[639px]:w-auto max-[639px]:max-w-none max-[639px]:shrink-0 max-[639px]:flex-nowrap max-[639px]:justify-end max-[639px]:gap-2"
                )}
              >
                {!isEditMode &&
                  (AuditLogLabel?.value || isPageEditing) &&
                  !fields?.HideAuditLog?.value && (
                    <Button onClick={() => void handleAuditLogOpen()} variant="inverse">
                      <span className="inline-flex items-center gap-1">
                        <ContentSdkText field={AuditLogLabel} tag="span" />
                        <ChevronRightIcon width={10} height={10} />
                      </span>
                    </Button>
                  )}

                {isEditMode ? (
                  <>
                    <Button
                      variant="inverse"
                      onClick={handleEditCancel}
                      className="min-h-[42px] min-w-[28px] max-[639px]:min-h-[42px] max-[639px]:min-w-[112px] max-[639px]:flex-1 [&:not(.edit-view-btn)]:max-[639px]:flex-1"
                    >
                      {t(I18N.PermissionCancel)}
                    </Button>
                    <Button
                      onClick={handleSaveClick}
                      variant="primary"
                      className="min-h-[42px] min-w-[28px] max-[639px]:min-h-[42px] max-[639px]:min-w-[112px] max-[639px]:flex-1 [&:not(.edit-view-btn)]:max-[639px]:flex-1"
                    >
                      {t(I18N.PermissionSave)}
                    </Button>
                  </>
                ) : (
                  (EditLinkLabel?.value || isPageEditing) && (
                    <Button
                      onClick={handleEditClick}
                      variant="primary"
                      className="edit-view-btn min-h-[42px] min-w-[112px] max-[639px]:h-[42px] max-[639px]:min-h-[42px] max-[639px]:w-[42px] max-[639px]:min-w-[42px] max-[639px]:max-w-[42px] max-[639px]:shrink-0 max-[639px]:flex-initial max-[639px]:rounded-full max-[639px]:px-3 max-[639px]:py-3"
                      aria-label={
                        typeof EditLinkLabel?.value === "string" ? EditLinkLabel.value : "Edit"
                      }
                    >
                      {PermissionEditIcon?.value?.src ? (
                        <>
                          <ContentSdkImage
                            field={PermissionEditIcon}
                            width={16}
                            height={16}
                            alt=""
                            className="inline-flex h-4 w-4 shrink-0 object-contain"
                            loading="lazy"
                            aria-hidden
                          />
                          <span className="hidden sm:inline">
                            <ContentSdkText field={EditLinkLabel} tag="span" />
                          </span>
                        </>
                      ) : (
                        <ContentSdkText field={EditLinkLabel} tag="span" />
                      )}
                    </Button>
                  )
                )}
              </div>
            </div>

            {isLoading && (
              <div className="w-full py-10 text-center text-[var(--color-text-basic)]">
                <LoadingSkeleton variant="skeleton" />
              </div>
            )}
            {loadError && (
              <div className="w-full py-10 text-center text-[var(--color-text-red)]" role="alert">
                {loadError}
              </div>
            )}
            {saveError && (
              <div className="w-full py-10 text-center text-[var(--color-text-red)]" role="alert">
                {saveError}
              </div>
            )}

            {!isLoading && !loadError && baseData && baseData.permissions.length > 0 && (
              <>
                <div className="flex w-full flex-col items-center justify-start gap-3 max-[639px]:w-full">
                  <RolePermissionsTable
                    data={baseData}
                    matrix={matrixState}
                    isEditMode={isEditMode}
                    permissionColumnLabel={permissionColumnLabel}
                    permissionIcon={PermissionIcon}
                    editIconChecked={EditIconChecked}
                    editIconUnchecked={EditIconUnchecked}
                    onToggle={handleToggle}
                  />
                </div>

                {isEditMode && (
                  <div className="flex w-full flex-1 flex-wrap items-end justify-end gap-3 max-[639px]:w-full max-[639px]:gap-2">
                    <Button
                      variant="inverse"
                      onClick={handleEditCancel}
                      className="min-h-[42px] min-w-[28px] max-[639px]:min-h-[42px] max-[639px]:min-w-[112px] max-[639px]:flex-1 [&:not(.edit-view-btn)]:max-[639px]:flex-1"
                    >
                      {t(I18N.PermissionCancel)}
                    </Button>
                    <Button
                      onClick={handleSaveClick}
                      variant="primary"
                      className="min-h-[42px] min-w-[28px] max-[639px]:min-h-[42px] max-[639px]:min-w-[112px] max-[639px]:flex-1 [&:not(.edit-view-btn)]:max-[639px]:flex-1"
                    >
                      {t(I18N.PermissionSave)}
                    </Button>
                  </div>
                )}
              </>
            )}

            {!isLoading && !loadError && baseData && baseData.permissions.length === 0 && (
              <div className="w-full py-10 text-center text-[var(--color-text-basic)]">
                No permissions available.
              </div>
            )}
          </div>
        </div>

        <RolePermissionsSaveModal
          isOpen={isModalOpen}
          saveTitle={SaveTitle}
          saveDescription={SaveDescription}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
          isSaving={isSaving}
        />

        <RolePermissionsAuditLog
          isOpen={isAuditLogOpen}
          isLoading={isAuditLogLoading}
          isLoadingMore={isAuditLogLoadingMore}
          hasMore={hasMoreAuditLogs}
          entries={auditEntries}
          title={typeof AuditLogLabel?.value === "string" ? AuditLogLabel.value : ""}
          onClose={() => setIsAuditLogOpen(false)}
          onLoadMore={loadMoreAuditLogs}
        />
      </div>
    </section>
  );
};

export const RolePermissionsDefaultVariant = React.memo(RolePermissionsDefaultVariantBase);
