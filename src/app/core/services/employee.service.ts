import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Employee, EmployeeUpdateRequest } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/employees`;

  readonly employees = signal<Employee[]>([]);
  readonly profile   = signal<Employee | null>(null);
  readonly loading   = signal(false);
  readonly error     = signal<string | null>(null);

  getAll() {
    this.loading.set(true);
    return this.http.get<Employee[]>(this.api);
  }

  getMyProfile() {
    return this.http.get<Employee>(`${this.api}/me`);
  }

  getById(id: number) {
    return this.http.get<Employee>(`${this.api}/${id}`);
  }

  updateProfile(id: number, data: EmployeeUpdateRequest) {
    return this.http.put<Employee>(`${this.api}/${id}`, data);
  }

  updateMyProfile(data: EmployeeUpdateRequest) {
    return this.http.put<Employee>(`${this.api}/me`, data);
  }
}
