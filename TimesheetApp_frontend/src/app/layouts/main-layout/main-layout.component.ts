import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard/employee': 'My Dashboard',
  '/dashboard/admin':    'Admin Dashboard',
  '/timesheet':          'My Timesheets',
  '/timesheet/new':      'Submit Timesheet',
  '/timesheet/review':   'Review Timesheets',
  '/leave':              'My Leaves',
  '/leave/new':          'Apply for Leave',
  '/leave/review':       'Review Leaves',
  '/attendance':         'Attendance',
  '/attendance/report':  'Attendance Report',
  '/projects':           'Projects',
  '/projects/new':       'New Project',
  '/employees/profile':  'My Profile',
  '/overtime':           'Overtime Rules',
  '/audit-logs':         'Audit Logs'
};

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);
  private auth   = inject(AuthService);
  private empSvc = inject(EmployeeService);

  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);
  pageTitle = signal('Dashboard');

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const title = PAGE_TITLES[e.urlAfterRedirects] ?? 'TimeSheet Pro';
      this.pageTitle.set(title);
    });
    const current = PAGE_TITLES[this.router.url] ?? 'TimeSheet Pro';
    this.pageTitle.set(current);
  }

  ngOnInit() {
    // Load real name on every app load so displayName is always up to date
    if (this.auth.isLoggedIn() && !this.auth.firstName()) {
      this.empSvc.getMyProfile().subscribe({
        next: emp => this.auth.updateDisplayName(emp.firstName, emp.lastName),
        error: () => {}
      });
    }
  }

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.mobileSidebarOpen.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }

  closeMobileSidebar() {
    this.mobileSidebarOpen.set(false);
  }
}
