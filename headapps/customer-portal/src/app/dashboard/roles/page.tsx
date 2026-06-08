"use client";

import AuditLog from "@/components/roles-permissions/AuditLog";
import ChevronRightIcon from "@/components/shared/icons/ChevronRightIcon";
import Modal from "@/components/shared/modal/Modal";
import DashboardLayout from "components/layout/DashboardLayout";
import PermissionsTable from "@/components/roles-permissions/PermissionsTableComponent";
import type { Permission, PermissionMatrix, Role } from "components/roles-permissions/types";
import Button from "components/ui/Button";
import Heading from "components/ui/Heading";
import { useState } from "react";

const mockRoles: Role[] = [
  { id: "corporate", name: "CORPORATE" },
  { id: "engineering", name: "ENGINEERING" },
  { id: "purchase", name: "PURCHASE" },
  { id: "maintenance", name: "MAINTENANCE" },
  { id: "internal", name: "INTERNAL" },
];

const mockPermissions: Permission[] = [
  { id: "view-order-history", name: "View Order History" },
  { id: "view-invoices", name: "View Invoices" },
  { id: "initiate-rfq", name: "Initiate RFQ" },
  {
    id: "view-technical-documents",
    name: "View Technical Documents",
  },
  { id: "request-documentation", name: "Request Documentation" },
  { id: "access-tools", name: "Access Tools" },
];

const mockMatrix: Record<string, Record<string, boolean>> = {
  "view-order-history": {
    corporate: true,
    engineering: true,
    purchase: true,
    maintenance: true,
    internal: true,
  },
  "view-invoices": {
    corporate: true,
    internal: true,
  },
  "initiate-rfq": {
    corporate: true,
    engineering: true,
    internal: true,
  },
  "view-technical-documents": {
    engineering: true,
    maintenance: true,
    internal: true,
  },
  "request-documentation": {
    engineering: true,
  },
  "access-tools": {
    engineering: true,
    maintenance: true,
    internal: true,
  },
};

const mockData: PermissionMatrix = {
  roles: mockRoles,
  permissions: mockPermissions,
  matrix: mockMatrix,
};

/**
 * Roles and Permissions page
 * Displays a table showing which roles have which permissions
 */
export default function RolesPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditMode((prev: boolean) => !prev);
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
  };

  const handleSave = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
  };

  const handleAuditLogOpen = () => {
    setIsAuditLogOpen(true);
  };

  const handleAuditLogClose = () => {
    setIsAuditLogOpen(false);
  };
  return (
    <DashboardLayout>
      <div className="relative inline-flex flex-col justify-start items-start overflow-hidden w-full">
        <div className="self-stretch px-5 pt-5 flex flex-col justify-start items-start gap-5">
          <div className="self-stretch flex flex-col justify-start items-start gap-5">
            <div className="self-stretch inline-flex justify-start items-center">
              <div className="flex-1 flex justify-start items-start">
                <Heading level={1} className="flex-1 justify-start text-3xl font-bold leading-9">
                  Manage Roles &amp; Permissions
                </Heading>
              </div>

              {!isEditMode && (
                <Button onClick={handleAuditLogOpen} btnVariant="link" className="mr-6 text-[12px]">
                  <div className="inline-flex justify-start items-center">
                    Audit Log
                    <ChevronRightIcon width={12} height={12} />
                  </div>
                </Button>
              )}

              {isEditMode ? (
                <>
                  <Button
                    variant="inverse"
                    onClick={handleEditCancel}
                    className="mr-2 min-w-[112px]"
                  >
                    Cancel
                  </Button>

                  <Button onClick={handleSave} variant="primary" className="min-w-[112px]">
                    Save
                  </Button>
                </>
              ) : (
                <Button onClick={handleEditClick} variant="primary" className="min-w-[112px]">
                  Edit
                </Button>
              )}
            </div>
            <div className="bg-Color-White-Default w-full rounded-md flex flex-col justify-start items-center gap-3">
              <PermissionsTable data={mockData} isEditMode={isEditMode} />
            </div>

            {isEditMode && (
              <div className="flex-1 flex justify-end items-end w-full">
                <Button variant="inverse" onClick={handleEditCancel} className="mr-2 min-w-[112px]">
                  Cancel
                </Button>

                <Button onClick={handleSave} variant="primary" className="min-w-[112px]">
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleModalClose} title="Save Changes" size="md">
        <div className="flex flex-col gap-4 sm:gap-4">
          <p className="text-gray-700">
            Are you sure you want to save the changes to roles and permissions?
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <Button variant="inverse" onClick={handleModalClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleModalClose} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      <AuditLog isOpen={isAuditLogOpen} onClose={handleAuditLogClose} />
    </DashboardLayout>
  );
}
