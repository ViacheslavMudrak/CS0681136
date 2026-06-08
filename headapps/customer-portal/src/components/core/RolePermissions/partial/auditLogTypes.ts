export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  permission: string;
  oldValue: string;
  newValue: string;
  roleCategory: string;
}
