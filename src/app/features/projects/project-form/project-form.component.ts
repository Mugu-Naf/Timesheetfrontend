import { Component, inject, signal, effect, model, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoaderComponent],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css']
})
export class ProjectFormComponent implements OnInit {
  private projService  = inject(ProjectService);
  private toastService = inject(ToastService);
  private router       = inject(Router);
  private route        = inject(ActivatedRoute);

  // Two-way model signals
  projectName = model('');
  clientName  = model('');
  description = model('');
  startDate   = model('');
  endDate     = model('');
  isActive    = model(true);

  loading     = signal(false);
  loadingInit = signal(false);
  isEdit      = signal(false);
  editId      = signal<number | null>(null);
  formError   = signal('');

  private clearEffect = effect(() => {
    this.projectName(); this.startDate();
    this.formError.set('');
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.editId.set(+id);
      this.loadProject(+id);
    } else {
      this.startDate.set(new Date().toISOString().split('T')[0]);
    }
  }

  loadProject(id: number) {
    this.loadingInit.set(true);
    this.projService.getById(id).subscribe({
      next: p => {
        this.projectName.set(p.projectName);
        this.clientName.set(p.clientName ?? '');
        this.description.set(p.description ?? '');
        this.startDate.set(p.startDate?.split('T')[0] ?? '');
        this.endDate.set(p.endDate?.split('T')[0] ?? '');
        this.isActive.set(p.isActive);
        this.loadingInit.set(false);
      },
      error: () => { this.loadingInit.set(false); this.toastService.error('Failed to load project.'); }
    });
  }

  onSubmit() {
    if (!this.projectName().trim() || !this.startDate()) {
      this.formError.set('Project name and start date are required.');
      this.toastService.warning('Project name and start date are required.');
      return;
    }
    if (this.endDate() && new Date(this.endDate()) < new Date(this.startDate())) {
      this.formError.set('End date must be after start date.');
      this.toastService.error('End date must be after start date.');
      return;
    }

    this.loading.set(true);
    const base = {
      projectName: this.projectName().trim(),
      clientName:  this.clientName().trim() || undefined,
      description: this.description().trim() || undefined,
      startDate:   this.startDate(),
      endDate:     this.endDate() || undefined,
    };

    const req = this.isEdit()
      ? this.projService.update(this.editId()!, { ...base, isActive: this.isActive() })
      : this.projService.create(base);

    req.subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success(this.isEdit() ? 'Project updated!' : 'Project created!');
        this.router.navigate(['/projects']);
      },
      error: err => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Failed to save project.';
        this.formError.set(msg);
        this.toastService.error(msg);
      }
    });
  }
}
