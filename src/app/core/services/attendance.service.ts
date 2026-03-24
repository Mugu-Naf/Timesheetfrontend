import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Attendance, AttendanceCheckInRequest,
  AttendanceCheckOutRequest, AttendanceReport
} from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);

  // ✅ FIXED: backend uses /Attendance (capital A)
  // ✅ FIXED: environment already has /api
  private api = `${environment.apiUrl}/Attendance`;

  readonly myAttendance = signal<Attendance[]>([]);
  readonly allAttendance = signal<Attendance[]>([]);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  // ✅ POST → /api/Attendance/check-in
  checkIn(data: AttendanceCheckInRequest) {
    return this.http.post<Attendance>(`${this.api}/check-in`, data);
  }

  // ✅ PUT (NOT POST)
  // ✅ /check-out (NOT /checkout)
  checkOut(data: AttendanceCheckOutRequest) {
    return this.http.put<Attendance>(`${this.api}/check-out`, data);
  }

  // ✅ GET /api/Attendance/my
  getMyAttendance() {
    return this.http.get<Attendance[]>(`${this.api}/my`);
  }

  // ✅ GET /api/Attendance
  getAll() {
    return this.http.get<Attendance[]>(this.api);
  }

  // ✅ GET /api/Attendance/report/{employeeId}?fromDate&toDate
  getReport(employeeId: number, fromDate: string, toDate: string) {
    return this.http.get<AttendanceReport>(
      `${this.api}/report/${employeeId}?fromDate=${fromDate}&toDate=${toDate}`
    );
  }
}
``