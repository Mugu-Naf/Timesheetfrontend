export type AttendanceStatus = 'Present' | 'Absent' | 'HalfDay' | 'Leave';

export interface Attendance {
  attendanceId: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
}

export interface AttendanceCheckInRequest {
  checkInTime?: string;
}

export interface AttendanceCheckOutRequest {
  checkOutTime?: string;
}

export interface AttendanceReport {
  employeeId: number;
  employeeName: string;
  totalPresent: number;
  totalAbsent: number;
  totalHalfDay: number;
  totalLeave: number;
  fromDate: string;
  toDate: string;
}
