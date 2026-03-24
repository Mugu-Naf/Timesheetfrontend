export interface AuditLog {
  auditLogId: number;
  username: string;
  action: string;
  entityType: string;
  entityId: number | null;
  description: string | null;
  ipAddress: string | null;
  timestamp: string;
  status: string;
}

export interface AuditLogFilter {
  username?: string;
  action?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogPagedResponse {
  items: AuditLog[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
