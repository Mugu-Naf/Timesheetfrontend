import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ProjectService } from '../../../core/services/project.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Project } from '../../../core/models/project.model';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoaderComponent, DatePipe],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit, OnDestroy {
  private projService  = inject(ProjectService);
  private empService   = inject(EmployeeService);
  private toastService = inject(ToastService);
  protected auth       = inject(AuthService);

  loading      = signal(true);
  projects     = signal<Project[]>([]);
  filterActive = signal<string>('All');
  searchQuery  = signal('');

  // Change 4 — filter options defined in TS, not inline in HTML
  filterOptions = ['All', 'Active', 'Inactive'];

  // Change 3 — debounce subject for search input
  private searchInput$ = new Subject<string>();

  // Member management
  memberModalProject = signal<Project | null>(null);
  members            = signal<any[]>([]);
  allEmployees       = signal<Employee[]>([]);
  selectedEmpId      = signal<number | null>(null);
  memberLoading      = signal(false);

  filtered = computed(() => {
    let list = this.projects();
    if (this.filterActive() === 'Active')   list = list.filter(p => p.isActive);
    if (this.filterActive() === 'Inactive') list = list.filter(p => !p.isActive);
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(p =>
      p.projectName.toLowerCase().includes(q) ||
      (p.clientName ?? '').toLowerCase().includes(q)
    );
    return list;
  });

  ngOnInit() {
    this.load();
    // Change 3 — debounce: wait 300ms after user stops typing
    this.searchInput$
      .pipe(debounceTime(300))
      .subscribe(value => this.searchQuery.set(value));
  }

  ngOnDestroy() {
    this.searchInput$.complete();
  }

  load() {
    this.loading.set(true);
    this.projService.getAll().subscribe({
      next: p => { this.projects.set(p); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastService.error('Failed to load projects.'); }
    });
  }

  openMemberModal(project: Project) {
    this.memberModalProject.set(project);
    this.selectedEmpId.set(null);
    this.memberLoading.set(true);
    this.projService.getMembers(project.projectId).subscribe({
      next: m => { this.members.set(m); this.memberLoading.set(false); },
      error: () => this.memberLoading.set(false)
    });
    this.empService.getAll().subscribe({
      next: e => this.allEmployees.set(e),
      error: () => {}
    });
  }

  closeMemberModal() { this.memberModalProject.set(null); }

  addMember() {
    const empId = this.selectedEmpId();
    const proj  = this.memberModalProject();
    if (!empId || !proj) return;
    this.projService.addMember(proj.projectId, empId).subscribe({
      next: () => {
        this.toastService.success('Employee added to project.');
        this.openMemberModal(proj);
        this.selectedEmpId.set(null);
      },
      error: err => this.toastService.error(err?.error?.message ?? 'Failed to add member.')
    });
  }

  removeMember(employeeId: number) {
    const proj = this.memberModalProject();
    if (!proj) return;
    this.projService.removeMember(proj.projectId, employeeId).subscribe({
      next: () => {
        this.toastService.success('Employee removed.');
        this.members.update(list => list.filter(m => m.employeeId !== employeeId));
      },
      error: () => this.toastService.error('Failed to remove member.')
    });
  }

  // Employees not yet in the project
  availableEmployees = computed(() => {
    const memberIds = new Set(this.members().map(m => m.employeeId));
    return this.allEmployees().filter(e => !memberIds.has(e.employeeId));
  });

  isClosed(project: Project): boolean {
    if (!project.endDate) return false;
    return new Date(project.endDate) < new Date();
  }

  // Change 1 — type-safe search handler (removes $any())
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput$.next(value);
  }

  // Change 2 — type-safe employee select handler (removes $any())
  onEmployeeSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedEmpId.set(+value || null);
  }
}
