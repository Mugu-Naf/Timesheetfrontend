import { Component, inject, signal, effect, model, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-timesheet-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoaderComponent],
  templateUrl: './timesheet-form.component.html',
  styleUrls: ['./timesheet-form.component.css']
})
export class TimesheetFormComponent implements OnInit {
  private tsService    = inject(TimesheetService);
  private projService  = inject(ProjectService);
  private toastService = inject(ToastService);
  private router       = inject(Router);
  private route        = inject(ActivatedRoute);

  // Form model signals (two-way)
  date         = model('');
  hoursWorked  = model<number | null>(null);
  projectId    = model<number | null>(null);
  comments     = model('');

  loading    = signal(false);
  loadingInit = signal(false);
  projects   = signal<any[]>([]);
  isEdit     = signal(false);
  editId     = signal<number | null>(null);
  formError  = signal('');

  // Auto-clear error
  private clearEffect = effect(() => {
    this.date(); this.hoursWorked(); this.projectId();
    this.formError.set('');
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) { this.isEdit.set(true); this.editId.set(+id); this.loadTimesheet(+id); }
    else {
      // Default to today, allow past dates but NOT future dates
      this.date.set(new Date().toISOString().split('T')[0]);
    }
    this.loadProjects();
  }

  loadProjects() {
    this.projService.getAll().subscribe({
      next: p => this.projects.set(p.filter((x: any) => x.isActive)),
      error: () => {}
    });
  }

  loadTimesheet(id: number) {
    this.loadingInit.set(true);
    this.tsService.getById(id).subscribe({
      next: ts => {
        this.date.set(ts.date?.split('T')[0] ?? '');
        this.hoursWorked.set(ts.hoursWorked);
        this.projectId.set(ts.projectId ?? null);
        this.comments.set(ts.comments ?? '');
        this.loadingInit.set(false);
      },
      error: () => { this.loadingInit.set(false); this.toastService.error('Failed to load timesheet.'); }
    });
  }

  // Today's date for max date constraint (no future timesheets)
  maxDate = new Date().toISOString().split('T')[0];

  isSelectedWeekend = () => {
    const d = new Date(this.date());
    return d.getDay() === 0 || d.getDay() === 6;
  };

  onSubmit() {
    if (!this.date() || !this.hoursWorked()) {
      this.formError.set('Date and hours are required.');
      this.toastService.warning('Date and hours are required.');
      return;
    }
    if (this.date() > this.maxDate) {
      this.formError.set('Cannot submit timesheet for a future date.');
      this.toastService.warning('Cannot submit timesheet for a future date.');
      return;
    }
    if ((this.hoursWorked() ?? 0) < 0.25 || (this.hoursWorked() ?? 0) > 24) {
      this.formError.set('Hours must be between 0.25 and 24.');
      this.toastService.warning('Hours must be between 0.25 and 24.');
      return;
    }

    this.loading.set(true);
    const payload = {
      date: this.date(),
      hoursWorked: this.hoursWorked()!,
      projectId: this.projectId() ?? undefined,
      comments: this.comments().trim() || undefined
    };

    const req = this.isEdit()
      ? this.tsService.update(this.editId()!, { hoursWorked: payload.hoursWorked, projectId: payload.projectId, comments: payload.comments })
      : this.tsService.create(payload);

    req.subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success(this.isEdit() ? 'Timesheet updated!' : 'Timesheet submitted!');
        this.router.navigate(['/timesheet']);
      },
      error: err => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Failed to save timesheet.';
        this.formError.set(msg);
        this.toastService.error(msg);
      }
    });
  }
}
