import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoaderComponent, DatePipe],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
  private projService  = inject(ProjectService);
  private toastService = inject(ToastService);
  protected auth       = inject(AuthService);

  loading      = signal(true);
  projects     = signal<Project[]>([]);
  filterActive = signal<string>('All');
  searchQuery  = signal('');

  filtered = computed(() => {
    let list = this.projects();

    if (this.filterActive() === 'Active')
      list = list.filter(p => p.isActive);

    if (this.filterActive() === 'Inactive')
      list = list.filter(p => !p.isActive);

    const q = this.searchQuery().toLowerCase();
    if (q)
      list = list.filter(p =>
        p.projectName.toLowerCase().includes(q) ||
        (p.clientName ?? '').toLowerCase().includes(q)
      );

    return list;
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.projService.getAll().subscribe({
      next: p => { this.projects.set(p); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastService.error('Failed to load projects.'); }
    });
  }
}
``