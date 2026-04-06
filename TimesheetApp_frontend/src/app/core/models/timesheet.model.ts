export type TimesheetStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Timesheet {
  timesheetId: number;
  employeeId: number;
  employeeName: string;
  date: string;
  hoursWorked: number;
  overtimeHours: number;
  projectId?: number;
  projectName?: string;
  status: TimesheetStatus;
  comments?: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  isWeekend?: boolean;
  overtimeMultiplier?: number;
}

export interface TimesheetCreateRequest {
  date: string;
  hoursWorked: number;
  projectId?: number;
  comments?: string;
}

export interface TimesheetUpdateRequest {
  hoursWorked: number;
  projectId?: number;
  comments?: string;
}

export interface TimesheetApprovalRequest {
  comments?: string;
}
