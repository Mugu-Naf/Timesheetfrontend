import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Timesheet, TimesheetCreateRequest,
  TimesheetUpdateRequest, TimesheetApprovalRequest
} from '../models/timesheet.model';

@Injectable({ providedIn: 'root' })
export class TimesheetService {
  private http = inject(HttpClient);

  // ✅ FIXED: backend uses /Timesheet (singular, capitalized)
  // ✅ environment already contains /api
  private api  = `${environment.apiUrl}/Timesheet`;

  readonly timesheets   = signal<Timesheet[]>([]);
  readonly loading      = signal(false);
  readonly error        = signal<string | null>(null);

  // ✅ GET /api/Timesheet/my
  getMyTimesheets() {
    return this.http.get<Timesheet[]>(`${this.api}/my`);
  }

  // ✅ GET /api/Timesheet
  getAll() {
    return this.http.get<Timesheet[]>(this.api);
  }

  // ✅ GET /api/Timesheet/{id}
  getById(id: number) {
    return this.http.get<Timesheet>(`${this.api}/${id}`);
  }

  // ✅ POST /api/Timesheet
  create(data: TimesheetCreateRequest) {
    return this.http.post<Timesheet>(this.api, data);
  }

  // ✅ PUT /api/Timesheet/{id}
  update(id: number, data: TimesheetUpdateRequest) {
    return this.http.put<Timesheet>(`${this.api}/${id}`, data);
  }

  // ✅ DELETE /api/Timesheet/{id}
  delete(id: number) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  // ✅ PUT (NOT POST) → /api/Timesheet/{id}/approve
  approve(id: number, data: TimesheetApprovalRequest) {
    return this.http.put<Timesheet>(`${this.api}/${id}/approve`, data);
  }

  // ✅ PUT (NOT POST) → /api/Timesheet/{id}/reject
  reject(id: number, data: TimesheetApprovalRequest) {
    return this.http.put<Timesheet>(`${this.api}/${id}/reject`, data);
  }
}