import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TimesheetService } from '../../../core/services/timesheet.service';
import { LeaveService } from '../../../core/services/leave.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AuditLog } from '../../../core/models/audit-log.model';

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
  private auditService  = inject(AuditLogService);

  loading             = signal(true);
  totalEmployees      = signal(0);
  pendingTimesheets   = signal(0);
  pendingLeaves       = signal(0);
  activeProjects      = signal(0);
  recentTimesheets    = signal<any[]>([]);
  recentLeaves        = signal<any[]>([]);
  recentAuditLogs     = signal<AuditLog[]>([]);

  ngOnInit() { this.loadDashboard(); }

  loadDashboard() {
    this.loading.set(true);
    let done = 0;
    const check = () => { if (++done === 5) this.loading.set(false); };

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

    this.auditService.getRecent(8).subscribe({
      next: logs => { this.recentAuditLogs.set(logs); check(); },
      error: () => check()
    });
  }

  getActionClass(action: string): string {
    const map: Record<string, string> = {
      'CREATE': 'audit-badge--green', 'UPDATE': 'audit-badge--blue',
      'DELETE': 'audit-badge--red',   'APPROVE': 'audit-badge--green',
      'REJECT': 'audit-badge--red',   'CANCEL': 'audit-badge--amber',
      'LOGIN':  'audit-badge--purple','REGISTER': 'audit-badge--purple',
      'CHECK-IN': 'audit-badge--teal','CHECK-OUT': 'audit-badge--teal',
    };
    return map[action] ?? 'audit-badge--gray';
  }
}
