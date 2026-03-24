import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuditLog, AuditLogFilter, AuditLogPagedResponse } from '../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/AuditLog`;

  getLogs(filter: AuditLogFilter) {
    let params = new HttpParams();
    if (filter.username)   params = params.set('username',   filter.username);
    if (filter.action)     params = params.set('action',     filter.action);
    if (filter.entityType) params = params.set('entityType', filter.entityType);
    if (filter.fromDate)   params = params.set('fromDate',   filter.fromDate);
    if (filter.toDate)     params = params.set('toDate',     filter.toDate);
    params = params.set('page',     String(filter.page     ?? 1));
    params = params.set('pageSize', String(filter.pageSize ?? 50));
    return this.http.get<AuditLogPagedResponse>(this.api, { params });
  }

  getRecent(count = 10) {
    return this.http.get<AuditLog[]>(`${this.api}/recent`, {
      params: new HttpParams().set('count', String(count))
    });
  }
}
