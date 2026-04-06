import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Timesheet } from '../../../core/models/timesheet.model';

@Component({
  selector: 'app-timesheet-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatusBadgeComponent, LoaderComponent, DatePipe],
  templateUrl: './timesheet-list.component.html',
  styleUrls: ['./timesheet-list.component.css']
})
export class TimesheetListComponent implements OnInit {
  private tsService    = inject(TimesheetService);
  private toastService = inject(ToastService);
  protected auth       = inject(AuthService);

  loading    = signal(true);
  timesheets = signal<Timesheet[]>([]);
  filterStatus = signal<string>('All');
  searchQuery  = signal<string>('');

  filtered = computed(() => {
    let list = this.timesheets();
    if (this.filterStatus() !== 'All') list = list.filter(t => t.status === this.filterStatus());
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(t => t.employeeName.toLowerCase().includes(q) || t.projectName?.toLowerCase().includes(q));
    return list;
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.tsService.getMyTimesheets().subscribe({
      next: ts => { this.timesheets.set(ts); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastService.error('Failed to load timesheets.'); }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this timesheet?')) return;
    this.tsService.delete(id).subscribe({
      next: () => {
        this.timesheets.update(list => list.filter(t => t.timesheetId !== id));
        this.toastService.success('Timesheet deleted.');
      },
      error: () => this.toastService.error('Failed to delete.')
    });
  }

  statuses = ['All', 'Pending', 'Approved', 'Rejected'];
}
