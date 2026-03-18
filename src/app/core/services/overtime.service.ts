import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OvertimeRule, OvertimeRuleCreateRequest, OvertimeRuleUpdateRequest } from '../models/overtime.model';

@Injectable({ providedIn: 'root' })
export class OvertimeService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/overtimerules`;

  readonly rules   = signal<OvertimeRule[]>([]);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  getAll() {
    return this.http.get<OvertimeRule[]>(this.api);
  }

  getById(id: number) {
    return this.http.get<OvertimeRule>(`${this.api}/${id}`);
  }

  create(data: OvertimeRuleCreateRequest) {
    return this.http.post<OvertimeRule>(this.api, data);
  }

  update(id: number, data: OvertimeRuleUpdateRequest) {
    return this.http.put<OvertimeRule>(`${this.api}/${id}`, data);
  }
}
