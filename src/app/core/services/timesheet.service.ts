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
  private api  = `${environment.apiUrl}/timesheets`;

  readonly timesheets   = signal<Timesheet[]>([]);
  readonly loading      = signal(false);
  readonly error        = signal<string | null>(null);

  getMyTimesheets() {
    return this.http.get<Timesheet[]>(`${this.api}/my`);
  }

  getAll() {
    return this.http.get<Timesheet[]>(this.api);
  }

  getById(id: number) {
    return this.http.get<Timesheet>(`${this.api}/${id}`);
  }

  create(data: TimesheetCreateRequest) {
    return this.http.post<Timesheet>(this.api, data);
  }

  update(id: number, data: TimesheetUpdateRequest) {
    return this.http.put<Timesheet>(`${this.api}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  approve(id: number, data: TimesheetApprovalRequest) {
    return this.http.post<Timesheet>(`${this.api}/${id}/approve`, data);
  }

  reject(id: number, data: TimesheetApprovalRequest) {
    return this.http.post<Timesheet>(`${this.api}/${id}/reject`, data);
  }
}
