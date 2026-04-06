import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Employee, EmployeeUpdateRequest } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);

  // ✅ FIXED: removed duplicate /api
  private api  = `${environment.apiUrl}/Employee`;

  readonly employees = signal<Employee[]>([]);
  readonly profile   = signal<Employee | null>(null);
  readonly loading   = signal(false);
  readonly error     = signal<string | null>(null);

  // GET /api/Employee — get all employees
  getAll() {
    this.loading.set(true);
    return this.http.get<Employee[]>(this.api);
  }

  // GET /api/Employee/profile — get logged-in employee's profile
  getMyProfile() {
    return this.http.get<Employee>(`${this.api}/profile`);
  }

  // GET /api/Employee/{id} — get employee by ID
  getById(id: number) {
    return this.http.get<Employee>(`${this.api}/${id}`);
  }

  // PUT /api/Employee/{id} — update employee by ID
  updateById(id: number, data: EmployeeUpdateRequest) {
    return this.http.put<Employee>(`${this.api}/${id}`, data);
  }

  // PUT /api/Employee/profile — update logged-in employee's profile
  updateMyProfile(data: EmployeeUpdateRequest) {
    return this.http.put<Employee>(`${this.api}/profile`, data);
  }

  // DELETE /api/Employee/{id} — delete employee by ID
  deleteById(id: number) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
