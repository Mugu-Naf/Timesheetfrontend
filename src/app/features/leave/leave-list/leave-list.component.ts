import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../core/services/leave.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { LeaveRequest } from '../../../core/models/leave.model';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatusBadgeComponent, LoaderComponent, DatePipe],
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.css']
})
export class LeaveListComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private toastService = inject(ToastService);

  loading      = signal(true);
  leaves       = signal<LeaveRequest[]>([]);
  filterStatus = signal('All');
  filterType   = signal('All');

  statuses  = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];
  types     = ['All', 'Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'Unpaid'];

  filtered = computed(() => {
    let list = this.leaves();
    if (this.filterStatus() !== 'All') list = list.filter(l => l.status === this.filterStatus());
    if (this.filterType() !== 'All')   list = list.filter(l => l.leaveType === this.filterType());
    return list;
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.leaveService.getMyLeaves().subscribe({
      next: lv => { this.leaves.set(lv); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastService.error('Failed to load leaves.'); }
    });
  }

  cancel(id: number) {
    if (!confirm('Cancel this leave request?')) return;
    this.leaveService.cancel(id).subscribe({
      next: updated => {
        this.leaves.update(list => list.map(l => l.leaveRequestId === id ? updated : l));
        this.toastService.success('Leave request cancelled.');
      },
      error: () => this.toastService.error('Failed to cancel leave.')
    });
  }

  getDays(start: string, end: string): number {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }
}
