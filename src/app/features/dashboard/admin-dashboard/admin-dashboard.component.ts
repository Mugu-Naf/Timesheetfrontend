import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { LeaveService } from '../../../core/services/leave.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ProjectService } from '../../../core/services/project.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent, StatusBadgeComponent, DatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  protected auth        = inject(AuthService);
  private tsService     = inject(TimesheetService);
  private leaveService  = inject(LeaveService);
  private empService    = inject(EmployeeService);
  private projService   = inject(ProjectService);

  loading             = signal(true);
  totalEmployees      = signal(0);
  pendingTimesheets   = signal(0);
  pendingLeaves       = signal(0);
  activeProjects      = signal(0);
  recentTimesheets    = signal<any[]>([]);
  recentLeaves        = signal<any[]>([]);

  ngOnInit() { this.loadDashboard(); }

  loadDashboard() {
    this.loading.set(true);
    let done = 0;
    const check = () => { if (++done === 4) this.loading.set(false); };

    this.tsService.getAll().subscribe({
      next: ts => {
        this.pendingTimesheets.set(ts.filter((t: any) => t.status === 'Pending').length);
        this.recentTimesheets.set([...ts].reverse().slice(0, 6));
        check();
      },
      error: () => check()
    });

    this.leaveService.getAll().subscribe({
      next: lv => {
        this.pendingLeaves.set(lv.filter((l: any) => l.status === 'Pending').length);
        this.recentLeaves.set([...lv].reverse().slice(0, 6));
        check();
      },
      error: () => check()
    });

    this.empService.getAll().subscribe({
      next: emps => { this.totalEmployees.set(emps.length); check(); },
      error: () => check()
    });

    this.projService.getAll().subscribe({
      next: projs => { this.activeProjects.set(projs.filter((p: any) => p.isActive).length); check(); },
      error: () => check()
    });
  }
}
