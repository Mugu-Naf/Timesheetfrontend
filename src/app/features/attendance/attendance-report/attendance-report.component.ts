import { Component, inject, signal, computed, model, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../core/services/attendance.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Attendance, AttendanceReport } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, DatePipe, StatusBadgeComponent],
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.css']
})
export class AttendanceReportComponent implements OnInit {
  private attService   = inject(AttendanceService);
  private empService   = inject(EmployeeService);
  private toastService = inject(ToastService);

  employees      = signal<any[]>([]);
  report         = signal<AttendanceReport | null>(null);
  allAttendance  = signal<Attendance[]>([]);
  loading        = signal(false);
  loadingEmps    = signal(true);
  activeTab      = signal<'report' | 'all'>('all');

  employeeId = model<number | null>(null);
  fromDate   = model('');
  toDate     = model('');

  // Filter for all-attendance tab
  filterEmpId = model<number | null>(null);

  filteredAttendance = computed(() => {
    const id = this.filterEmpId();
    const all = this.allAttendance();
    return id ? all.filter(a => a.employeeId === id) : all;
  });

  ngOnInit() {
    const now = new Date();
    this.fromDate.set(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
    this.toDate.set(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);

    this.empService.getAll().subscribe({
      next: emps => { this.employees.set(emps); this.loadingEmps.set(false); },
      error: () => { this.loadingEmps.set(false); }
    });

    this.loadAllAttendance();
  }

  loadAllAttendance() {
    this.loading.set(true);
    this.attService.getAll().subscribe({
      next: att => {
        const sorted = [...att].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.allAttendance.set(sorted);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  generateReport() {
    if (!this.employeeId() || !this.fromDate() || !this.toDate()) {
      this.toastService.warning('Please select employee and date range.');
      return;
    }
    this.loading.set(true);
    this.attService.getReport(this.employeeId()!, this.fromDate(), this.toDate()).subscribe({
      next: r => {
        this.report.set(r);
        this.loading.set(false);
        this.activeTab.set('report');
        this.toastService.success('Report generated!');
      },
      error: err => {
        this.loading.set(false);
        this.toastService.error(err?.error?.message ?? 'Failed to generate report.');
      }
    });
  }

  getAttendancePercent(): number {
    const r = this.report();
    if (!r) return 0;
    const total = r.totalPresent + r.totalAbsent + r.totalHalfDay + r.totalLeave;
    if (total === 0) return 0;
    return Math.round(((r.totalPresent + r.totalHalfDay * 0.5) / total) * 100);
  }

  getDurationStr(inStr: string, outStr: string): string {
    const ms = new Date(outStr).getTime() - new Date(inStr).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  }
}
