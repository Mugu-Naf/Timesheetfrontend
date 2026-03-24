import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// Direct imports (NO lazy loading)
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';

import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

import { EmployeeDashboardComponent } from './features/dashboard/employee-dashboard/employee-dashboard.component';
import { AdminDashboardComponent } from './features/dashboard/admin-dashboard/admin-dashboard.component';

import { TimesheetListComponent } from './features/timesheet/timesheet-list/timesheet-list.component';
import { TimesheetFormComponent } from './features/timesheet/timesheet-form/timesheet-form.component';
import { TimesheetReviewComponent } from './features/timesheet/timesheet-review/timesheet-review.component';

import { LeaveListComponent } from './features/leave/leave-list/leave-list.component';
import { LeaveFormComponent } from './features/leave/leave-form/leave-form.component';
import { LeaveReviewComponent } from './features/leave/leave-review/leave-review.component';

import { AttendanceCheckinComponent } from './features/attendance/attendance-checkin/attendance-checkin.component';
import { AttendanceReportComponent } from './features/attendance/attendance-report/attendance-report.component';

import { ProjectListComponent } from './features/projects/project-list/project-list.component';
import { ProjectFormComponent } from './features/projects/project-form/project-form.component';

import { EmployeeListComponent } from './features/employees/employee-list/employee-list.component';
import { EmployeeProfileComponent } from './features/employees/employee-profile/employee-profile.component';

import { OvertimeRulesComponent } from './features/overtime/overtime-rules/overtime-rules.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { AuditLogsComponent } from './features/audit-logs/audit-logs.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ✅ AUTH
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // ✅ DASHBOARD (Layout + children)
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'employee',
        component: EmployeeDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['Employee', 'HR', 'Admin'] }
      },
      {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['HR', 'Admin'] }
      },
      { path: '', redirectTo: 'employee', pathMatch: 'full' }
    ]
  },

  // ✅ TIMESHEET
  {
    path: 'timesheet',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: TimesheetListComponent },
      { path: 'new', component: TimesheetFormComponent },
      { path: 'edit/:id', component: TimesheetFormComponent },
      {
        path: 'review',
        component: TimesheetReviewComponent,
        canActivate: [roleGuard],
        data: { roles: ['HR', 'Admin'] }
      }
    ]
  },

  // ✅ LEAVE
  {
    path: 'leave',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: LeaveListComponent },
      { path: 'new', component: LeaveFormComponent },
      {
        path: 'review',
        component: LeaveReviewComponent,
        canActivate: [roleGuard],
        data: { roles: ['HR', 'Admin'] }
      }
    ]
  },

  // ✅ ATTENDANCE
  {
    path: 'attendance',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: AttendanceCheckinComponent },
      {
        path: 'report',
        component: AttendanceReportComponent,
        canActivate: [roleGuard],
        data: { roles: ['HR', 'Admin'] }
      }
    ]
  },

  // ✅ PROJECTS
  {
    path: 'projects',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: ProjectListComponent },
      {
        path: 'new',
        component: ProjectFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'edit/:id',
        component: ProjectFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['Admin'] }
      }
    ]
  },

  // ✅ EMPLOYEES
  {
    path: 'employees',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: EmployeeListComponent,
        canActivate: [roleGuard],
        data: { roles: ['HR', 'Admin'] }
      },
      { path: 'profile', component: EmployeeProfileComponent },
      {
        path: 'profile/:id',
        component: EmployeeProfileComponent,
        canActivate: [roleGuard],
        data: { roles: ['HR', 'Admin'] }
      }
    ]
  },

  // ✅ OVERTIME
  {
    path: 'overtime',
    component: MainLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    children: [
      { path: '', component: OvertimeRulesComponent }
    ]
  },

  // ✅ AUDIT LOGS
  {
    path: 'audit-logs',
    component: MainLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    children: [
      { path: '', component: AuditLogsComponent }
    ]
  },

  { path: '**', component: NotFoundComponent }
];
``