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
  private api  = `${environment.apiUrl}/attendance`;

  readonly myAttendance = signal<Attendance[]>([]);
  readonly allAttendance = signal<Attendance[]>([]);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  checkIn(data: AttendanceCheckInRequest) {
    return this.http.post<Attendance>(`${this.api}/checkin`, data);
  }

  checkOut(data: AttendanceCheckOutRequest) {
    return this.http.post<Attendance>(`${this.api}/checkout`, data);
  }

  getMyAttendance() {
    return this.http.get<Attendance[]>(`${this.api}/my`);
  }

  getAll() {
    return this.http.get<Attendance[]>(this.api);
  }

  getReport(employeeId: number, fromDate: string, toDate: string) {
    return this.http.get<AttendanceReport>(
      `${this.api}/report/${employeeId}?fromDate=${fromDate}&toDate=${toDate}`
    );
  }
}
