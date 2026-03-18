import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Project, ProjectCreateRequest, ProjectUpdateRequest } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/projects`;

  readonly projects = signal<Project[]>([]);
  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);

  getAll() {
    return this.http.get<Project[]>(this.api);
  }

  getById(id: number) {
    return this.http.get<Project>(`${this.api}/${id}`);
  }

  create(data: ProjectCreateRequest) {
    return this.http.post<Project>(this.api, data);
  }

  update(id: number, data: ProjectUpdateRequest) {
    return this.http.put<Project>(`${this.api}/${id}`, data);
  }

  deactivate(id: number) {
    return this.http.patch<Project>(`${this.api}/${id}/deactivate`, {});
  }
}
