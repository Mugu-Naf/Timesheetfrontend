import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LeaveRequest, LeaveCreateRequest } from '../models/leave.model';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/leaverequests`;

  readonly leaves  = signal<LeaveRequest[]>([]);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  getMyLeaves() {
    return this.http.get<LeaveRequest[]>(`${this.api}/my`);
  }

  getAll() {
    return this.http.get<LeaveRequest[]>(this.api);
  }

  create(data: LeaveCreateRequest) {
    return this.http.post<LeaveRequest>(this.api, data);
  }

  cancel(id: number) {
    return this.http.post<LeaveRequest>(`${this.api}/${id}/cancel`, {});
  }

  approve(id: number, comments?: string) {
    return this.http.post<LeaveRequest>(`${this.api}/${id}/approve`, { comments });
  }

  reject(id: number, comments?: string) {
    return this.http.post<LeaveRequest>(`${this.api}/${id}/reject`, { comments });
  }
}
