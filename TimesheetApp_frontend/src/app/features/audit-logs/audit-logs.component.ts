import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService } from '../../core/services/audit-log.service';
import { ToastService } from '../../core/services/toast.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { AuditLog, AuditLogFilter } from '../../core/models/audit-log.model';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, DatePipe],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.css']
})
export class AuditLogsComponent implements OnInit {
  private auditService = inject(AuditLogService);
  private toast        = inject(ToastService);

  loading    = signal(true);
  logs       = signal<AuditLog[]>([]);
  totalCount = signal(0);
  totalPages = signal(0);
  page       = signal(1);
  pageSize   = signal(10);

  readonly pageSizeOptions = [10, 25, 50, 100];

  // Filter state
  filterUsername   = signal('');
  filterAction     = signal('');
  filterEntityType = signal('');
  filterFromDate   = signal('');
  filterToDate     = signal('');

  readonly actions     = ['', 'LOGIN', 'REGISTER', 'PASSWORD_RESET', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'CANCEL', 'CHECK-IN', 'CHECK-OUT'];
  readonly entityTypes = ['', 'User', 'Timesheet', 'LeaveRequest', 'Project', 'Employee', 'Attendance', 'OvertimeRule'];

  ngOnInit() {
    // Default: today
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    this.filterFromDate.set(monthAgo);
    this.filterToDate.set(today);
    this.load();
  }

  load() {
    this.loading.set(true);
    const filter: AuditLogFilter = {
      username:   this.filterUsername()   || undefined,
      action:     this.filterAction()     || undefined,
      entityType: this.filterEntityType() || undefined,
      fromDate:   this.filterFromDate()   || undefined,
      toDate:     this.filterToDate()     || undefined,
      page:       this.page(),
      pageSize:   this.pageSize()
    };

    this.auditService.getLogs(filter).subscribe({
      next: res => {
        this.logs.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load audit logs.');
      }
    });
  }

  applyFilters() {
    this.page.set(1);
    this.load();
  }

  changePageSize(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
    this.load();
  }

  clearFilters() {
    this.filterUsername.set('');
    this.filterAction.set('');
    this.filterEntityType.set('');
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    this.filterFromDate.set(monthAgo);
    this.filterToDate.set(today);
    this.page.set(1);
    this.load();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  getActionClass(action: string): string {
    const map: Record<string, string> = {
      'CREATE':         'badge--green',
      'UPDATE':         'badge--blue',
      'DELETE':         'badge--red',
      'APPROVE':        'badge--green',
      'REJECT':         'badge--red',
      'CANCEL':         'badge--amber',
      'LOGIN':          'badge--purple',
      'REGISTER':       'badge--purple',
      'CHECK-IN':       'badge--teal',
      'CHECK-OUT':      'badge--teal',
      'PASSWORD_RESET': 'badge--amber',
    };
    return map[action] ?? 'badge--gray';
  }

  getStatusClass(status: string): string {
    return status === 'Success' ? 'badge--green' : 'badge--red';
  }

  get pages(): number[] {
    const total = this.totalPages();
    const cur   = this.page();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const range = new Set<number>();
    range.add(1);
    range.add(total);
    for (let i = Math.max(2, cur - 2); i <= Math.min(total - 1, cur + 2); i++) {
      range.add(i);
    }
    return Array.from(range).sort((a, b) => a - b);
  }

  isEllipsis(pages: number[], idx: number): boolean {
    return idx > 0 && pages[idx] - pages[idx - 1] > 1;
  }
}
