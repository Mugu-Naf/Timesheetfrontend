export type LeaveType = 'Casual' | 'Sick' | 'Earned' | 'Maternity' | 'Paternity' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
  leaveRequestId: number;
  employeeId: number;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface LeaveCreateRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface LeaveBalance {
  year: number;
  casualTotal: number;
  casualUsed: number;
  casualRemaining: number;
  sickTotal: number;
  sickUsed: number;
  sickRemaining: number;
  earnedTotal: number;
  earnedUsed: number;
  earnedRemaining: number;
  maternityTotal: number;
  maternityUsed: number;
  maternityRemaining: number;
  paternityTotal: number;
  paternityUsed: number;
  paternityRemaining: number;
}
