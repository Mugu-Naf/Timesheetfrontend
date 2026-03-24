import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { LeaveService } from '../../../core/services/leave.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent, StatusBadgeComponent, DatePipe],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  protected auth       = inject(AuthService);
  private tsService    = inject(TimesheetService);
  private leaveService = inject(LeaveService);
  private attService   = inject(AttendanceService);

  loading            = signal(true);
  pendingTimesheets  = signal(0);
  approvedTimesheets = signal(0);
  pendingLeaves      = signal(0);
  todayAttendance    = signal('Not Checked In');
  recentTimesheets   = signal<any[]>([]);
  recentLeaves       = signal<any[]>([]);
  todayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  ngOnInit() { this.loadDashboard(); }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  }

  loadDashboard() {
    this.loading.set(true);
    let done = 0;
    const check = () => { if (++done === 3) this.loading.set(false); };

    this.tsService.getMyTimesheets().subscribe({
      next: ts => {
        this.pendingTimesheets.set(ts.filter((t: any) => t.status === 'Pending').length);
        this.approvedTimesheets.set(ts.filter((t: any) => t.status === 'Approved').length);
        this.recentTimesheets.set([...ts].reverse().slice(0, 5));
        check();
      },
      error: () => check()
    });

    this.leaveService.getMyLeaves().subscribe({
      next: lv => {
        this.pendingLeaves.set(lv.filter((l: any) => l.status === 'Pending').length);
        this.recentLeaves.set([...lv].reverse().slice(0, 5));
        check();
      },
      error: () => check()
    });

    this.attService.getMyAttendance().subscribe({
      next: att => {
        const today = new Date().toDateString();
        const rec = att.find((a: any) => new Date(a.date).toDateString() === today);
        if (rec) {
          if (rec.checkInTime && rec.checkOutTime) this.todayAttendance.set('Checked Out');
          else if (rec.checkInTime) this.todayAttendance.set('Checked In');
          else this.todayAttendance.set(rec.status);
        }
        check();
      },
      error: () => check()
    });
  }
}
