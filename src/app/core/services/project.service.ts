import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Project, ProjectCreateRequest, ProjectUpdateRequest } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);

  // âœ… FIXED â€” backend uses /Project (singular, capital P)
  // âœ… environment already contains /api
  private api  = `${environment.apiUrl}/Project`;

  readonly projects = signal<Project[]>([]);
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);

  // âœ… GET /api/Project
  getAll() {
    return this.http.get<Project[]>(this.api);
  }

  // âœ… GET /api/Project/{id}
  getById(id: number) {
    return this.http.get<Project>(`${this.api}/${id}`);
  }

  // âœ… POST /api/Project
  create(data: ProjectCreateRequest) {
    return this.http.post<Project>(this.api, data);
  }

  // âœ… PUT /api/Project/{id}
  update(id: number, data: ProjectUpdateRequest) {
    return this.http.put<Project>(`${this.api}/${id}`, data);
  }

  // âœ… GET /api/Project/active
  getActive() {
    return this.http.get<Project[]>(`${this.api}/active`);
  }

  getMembers(projectId: number) {
    return this.http.get<any[]>(`${this.api}/${projectId}/members`);
  }

  addMember(projectId: number, employeeId: number) {
    return this.http.post(`${this.api}/${projectId}/members`, { employeeId });
  }

  removeMember(projectId: number, employeeId: number) {
    return this.http.delete(`${this.api}/${projectId}/members/${employeeId}`);
  }
}
