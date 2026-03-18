import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'employee',
        canActivate: [roleGuard],
        data: { roles: ['Employee', 'HR', 'Admin'] },
        loadComponent: () =>
          import('./features/dashboard/employee-dashboard/employee-dashboard.component')
            .then(m => m.EmployeeDashboardComponent)
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['HR', 'Admin'] },
        loadComponent: () =>
          import('./features/dashboard/admin-dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent)
      },
      { path: '', redirectTo: 'employee', pathMatch: 'full' }
    ]
  },

  {
    path: 'timesheet',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/timesheet/timesheet-list/timesheet-list.component')
            .then(m => m.TimesheetListComponent)
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/timesheet/timesheet-form/timesheet-form.component')
            .then(m => m.TimesheetFormComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('./features/timesheet/timesheet-form/timesheet-form.component')
            .then(m => m.TimesheetFormComponent)
      },
      {
        path: 'review',
        canActivate: [roleGuard],
        data: { roles: ['HR', 'Admin'] },
        loadComponent: () =>
          import('./features/timesheet/timesheet-review/timesheet-review.component')
            .then(m => m.TimesheetReviewComponent)
      }
    ]
  },

  {
    path: 'leave',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/leave/leave-list/leave-list.component')
            .then(m => m.LeaveListComponent)
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./features/leave/leave-form/leave-form.component')
            .then(m => m.LeaveFormComponent)
      },
      {
        path: 'review',
        canActivate: [roleGuard],
        data: { roles: ['HR', 'Admin'] },
        loadComponent: () =>
          import('./features/leave/leave-review/leave-review.component')
            .then(m => m.LeaveReviewComponent)
      }
    ]
  },

  {
    path: 'attendance',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/attendance/attendance-checkin/attendance-checkin.component')
            .then(m => m.AttendanceCheckinComponent)
      },
      {
        path: 'report',
        canActivate: [roleGuard],
        data: { roles: ['HR', 'Admin'] },
        loadComponent: () =>
          import('./features/attendance/attendance-report/attendance-report.component')
            .then(m => m.AttendanceReportComponent)
      }
    ]
  },

  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/projects/project-list/project-list.component')
            .then(m => m.ProjectListComponent)
      },
      {
        path: 'new',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/projects/project-form/project-form.component')
            .then(m => m.ProjectFormComponent)
      },
      {
        path: 'edit/:id',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/projects/project-form/project-form.component')
            .then(m => m.ProjectFormComponent)
      }
    ]
  },

  {
    path: 'employees',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        canActivate: [roleGuard],
        data: { roles: ['HR', 'Admin'] },
        loadComponent: () =>
          import('./features/employees/employee-list/employee-list.component')
            .then(m => m.EmployeeListComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/employees/employee-profile/employee-profile.component')
            .then(m => m.EmployeeProfileComponent)
      },
      {
        path: 'profile/:id',
        canActivate: [roleGuard],
        data: { roles: ['HR', 'Admin'] },
        loadComponent: () =>
          import('./features/employees/employee-profile/employee-profile.component')
            .then(m => m.EmployeeProfileComponent)
      }
    ]
  },

  {
    path: 'overtime',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/overtime/overtime-rules/overtime-rules.component')
            .then(m => m.OvertimeRulesComponent)
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
