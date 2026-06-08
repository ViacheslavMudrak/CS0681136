"use client";

import ContextualPanel from "@/components/shared/contextual-panel/ContextualPanel";
import { cn } from "@/lib/utils";

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: "created" | "updated" | "deleted";
  entity: string;
  details?: string;
}

interface AuditLogProps {
  isOpen: boolean;
  onClose: () => void;
  entries?: AuditLogEntry[];
}

export default function AuditLog({
  isOpen,
  onClose,
  entries = [],
}: AuditLogProps) {
  const mockEntries: AuditLogEntry[] =
    entries.length > 0
      ? entries
      : [
          {
            id: "1",
            timestamp: new Date("2024-01-15T10:30:00"),
            user: "John Doe",
            action: "created",
            entity: "Role: ENGINEERING",
            details: "Created new role with permissions"
          },
          {
            id: "2",
            timestamp: new Date("2024-01-15T09:15:00"),
            user: "Jane Smith",
            action: "updated",
            entity: "Permission: View Order History",
            details: "Updated permission for CORPORATE role"
          },
          {
            id: "3",
            timestamp: new Date("2024-01-14T16:45:00"),
            user: "Bob Johnson",
            action: "deleted",
            entity: "Role: TEMP_ROLE",
            details: "Removed temporary role"
          },
          {
            id: "4",
            timestamp: new Date("2024-01-14T14:20:00"),
            user: "Alice Williams",
            action: "updated",
            entity: "Permission Matrix",
            details: "Updated permissions for MAINTENANCE role"
          },
          {
            id: "5",
            timestamp: new Date("2024-01-13T11:00:00"),
            user: "Charlie Brown",
            action: "created",
            entity: "Role: PURCHASE",
            details: "Created new role with initial permissions"
          }
        ];

  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  const getActionColor = (action: AuditLogEntry["action"]): string => {
    switch (action) {
      case "created":
        return "text-green-600 bg-green-50";
      case "updated":
        return "text-blue-600 bg-blue-50";
      case "deleted":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getActionLabel = (action: AuditLogEntry["action"]): string => {
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  return (
    <ContextualPanel
      isOpen={isOpen}
      onClose={onClose}
      title='Audit Log'
      width='w-full sm:w-[480px]'
    >
      <div className='flex flex-col gap-4'>
        {mockEntries.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            No audit log entries found
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {mockEntries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "flex flex-col gap-2",
                  "p-4 rounded-lg",
                  "border border-gray-200",
                  "hover:bg-gray-50 transition-colors"
                )}
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          getActionColor(entry.action)
                        )}
                      >
                        {getActionLabel(entry.action)}
                      </span>
                      <span className='text-sm font-medium text-gray-900 truncate'>
                        {entry.entity}
                      </span>
                    </div>
                    {entry.details && (
                      <p className='text-sm text-gray-600 mb-2'>
                        {entry.details}
                      </p>
                    )}
                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                      <span>{entry.user}</span>
                      <span>•</span>
                      <span>{formatTimestamp(entry.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ContextualPanel>
  );
}
