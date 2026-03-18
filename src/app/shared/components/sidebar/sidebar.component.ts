import { Component, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
  children?: { label: string; route: string; roles: string[] }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  protected auth = inject(AuthService);

  collapsed = input<boolean>(false);
  closeSidebar = output<void>();

  expandedItem = signal<string | null>(null);

  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard', icon: '🏠',
      route: '/dashboard/employee',
      roles: ['Employee', 'HR', 'Admin']
    },
    {
      label: 'Dashboard', icon: '📊',
      route: '/dashboard/admin',
      roles: ['HR', 'Admin']
    },
    {
      label: 'Timesheets', icon: '⏱️',
      route: '/timesheet',
      roles: ['Employee', 'HR', 'Admin'],
      children: [
        { label: 'My Timesheets', route: '/timesheet', roles: ['Employee', 'HR', 'Admin'] },
        { label: 'Submit New', route: '/timesheet/new', roles: ['Employee', 'HR', 'Admin'] },
        { label: 'Review All', route: '/timesheet/review', roles: ['HR', 'Admin'] }
      ]
    },
    {
      label: 'Leave', icon: '🏖️',
      route: '/leave',
      roles: ['Employee', 'HR', 'Admin'],
      children: [
        { label: 'My Leaves', route: '/leave', roles: ['Employee', 'HR', 'Admin'] },
        { label: 'Apply Leave', route: '/leave/new', roles: ['Employee', 'HR', 'Admin'] },
        { label: 'Review All', route: '/leave/review', roles: ['HR', 'Admin'] }
      ]
    },
    {
      label: 'Attendance', icon: '📅',
      route: '/attendance',
      roles: ['Employee', 'HR', 'Admin'],
      children: [
        { label: 'Check In/Out', route: '/attendance', roles: ['Employee', 'HR', 'Admin'] },
        { label: 'Reports', route: '/attendance/report', roles: ['HR', 'Admin'] }
      ]
    },
    {
      label: 'Projects', icon: '📁',
      route: '/projects',
      roles: ['Employee', 'HR', 'Admin']
    },
    {
      label: 'Employees', icon: '👥',
      route: '/employees',
      roles: ['HR', 'Admin'],
      children: [
        { label: 'All Employees', route: '/employees', roles: ['HR', 'Admin'] },
        { label: 'My Profile', route: '/employees/profile', roles: ['HR', 'Admin'] }
      ]
    },
    {
      label: 'My Profile', icon: '👤',
      route: '/employees/profile',
      roles: ['Employee']
    },
    {
      label: 'Overtime Rules', icon: '⚙️',
      route: '/overtime',
      roles: ['Admin']
    }
  ];

  visibleItems = computed(() => {
    const role = this.auth.role() ?? '';
    return this.navItems.filter(item => item.roles.includes(role));
  });

  toggleItem(label: string) {
    this.expandedItem.update(curr => curr === label ? null : label);
  }

  onNavClick() {
    this.closeSidebar.emit();
  }

  logout() {
    this.auth.logout();
  }
}
