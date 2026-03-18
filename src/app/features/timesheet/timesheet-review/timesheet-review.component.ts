import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Timesheet } from '../../../core/models/timesheet.model';

@Component({
  selector: 'app-timesheet-review',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, LoaderComponent, DatePipe],
  templateUrl: './timesheet-review.component.html',
  styleUrls: ['./timesheet-review.component.css']
})
export class TimesheetReviewComponent implements OnInit {
  private tsService    = inject(TimesheetService);
  private toastService = inject(ToastService);

  loading      = signal(true);
  timesheets   = signal<Timesheet[]>([]);
  filterStatus = signal('Pending');
  searchQuery  = signal('');
  actionLoading = signal<number | null>(null);

  // Modal state
  modalOpen    = signal(false);
  modalAction  = signal<'approve' | 'reject'>('approve');
  modalTs      = signal<Timesheet | null>(null);
  modalComment = signal('');

  statuses = ['All', 'Pending', 'Approved', 'Rejected'];

  filtered = computed(() => {
    let list = this.timesheets();
    if (this.filterStatus() !== 'All') list = list.filter(t => t.status === this.filterStatus());
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(t =>
      t.employeeName.toLowerCase().includes(q) ||
      (t.projectName ?? '').toLowerCase().includes(q)
    );
    return list;
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.tsService.getAll().subscribe({
      next: ts => { this.timesheets.set(ts); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastService.error('Failed to load timesheets.'); }
    });
  }

  openModal(ts: Timesheet, action: 'approve' | 'reject') {
    this.modalTs.set(ts);
    this.modalAction.set(action);
    this.modalComment.set('');
    this.modalOpen.set(true);
  }

  closeModal() { this.modalOpen.set(false); }

  confirmAction() {
    const ts = this.modalTs();
    if (!ts) return;
    const id = ts.timesheetId;
    this.actionLoading.set(id);
    const payload = { comments: this.modalComment().trim() || undefined };
    const req = this.modalAction() === 'approve'
      ? this.tsService.approve(id, payload)
      : this.tsService.reject(id, payload);

    req.subscribe({
      next: updated => {
        this.timesheets.update(list => list.map(t => t.timesheetId === id ? updated : t));
        this.actionLoading.set(null);
        this.modalOpen.set(false);
        this.toastService.success(`Timesheet ${this.modalAction()}d successfully.`);
      },
      error: err => {
        this.actionLoading.set(null);
        this.toastService.error(err?.error?.message ?? 'Action failed.');
      }
    });
  }
}
