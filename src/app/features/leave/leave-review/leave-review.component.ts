import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../core/services/leave.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { LeaveRequest } from '../../../core/models/leave.model';

@Component({
  selector: 'app-leave-review',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, LoaderComponent, DatePipe],
  templateUrl: './leave-review.component.html',
  styleUrls: ['./leave-review.component.css']
})
export class LeaveReviewComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private toastService = inject(ToastService);

  loading       = signal(true);
  leaves        = signal<LeaveRequest[]>([]);
  filterStatus  = signal('Pending');
  searchQuery   = signal('');
  actionLoading = signal<number | null>(null);
  modalOpen     = signal(false);
  modalAction   = signal<'approve' | 'reject'>('approve');
  modalLeave    = signal<LeaveRequest | null>(null);
  modalComment  = signal('');

  statuses = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

  filtered = computed(() => {
    let list = this.leaves();
    if (this.filterStatus() !== 'All') list = list.filter(l => l.status === this.filterStatus());
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(l => l.employeeName.toLowerCase().includes(q) || l.leaveType.toLowerCase().includes(q));
    return list;
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.leaveService.getAll().subscribe({
      next: lv => { this.leaves.set(lv); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastService.error('Failed to load leave requests.'); }
    });
  }

  openModal(lv: LeaveRequest, action: 'approve' | 'reject') {
    this.modalLeave.set(lv);
    this.modalAction.set(action);
    this.modalComment.set('');
    this.modalOpen.set(true);
  }

  closeModal() { this.modalOpen.set(false); }

  confirmAction() {
    const lv = this.modalLeave();
    if (!lv) return;
    const id = lv.leaveRequestId;
    this.actionLoading.set(id);
    const comment = this.modalComment().trim() || undefined;
    const req = this.modalAction() === 'approve'
      ? this.leaveService.approve(id, comment)
      : this.leaveService.reject(id, comment);

    req.subscribe({
      next: updated => {
        this.leaves.update(list => list.map(l => l.leaveRequestId === id ? updated : l));
        this.actionLoading.set(null);
        this.modalOpen.set(false);
        this.toastService.success(`Leave ${this.modalAction()}d successfully.`);
      },
      error: err => {
        this.actionLoading.set(null);
        this.toastService.error(err?.error?.message ?? 'Action failed.');
      }
    });
  }

  getDays(start: string, end: string): number {
    return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000*60*60*24)) + 1;
  }
}
