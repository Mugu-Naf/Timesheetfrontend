import { Component, inject, signal, effect, model, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoaderComponent, DatePipe],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css']
})
export class EmployeeProfileComponent implements OnInit {
  private empService   = inject(EmployeeService);
  private toastService = inject(ToastService);
  private route        = inject(ActivatedRoute);
  protected auth       = inject(AuthService);

  loading      = signal(true);
  saving       = signal(false);
  editing      = signal(false);
  profile      = signal<Employee | null>(null);
  isOwnProfile = signal(true);
  formError    = signal('');

  // Editable model signals
  firstName  = model('');
  lastName   = model('');
  email      = model('');
  phone      = model('');
  department = model('');
  jobTitle   = model('');

  departments = ['Engineering','HR','Finance','Marketing','Operations','Sales','Design','Other'];

  private clearEffect = effect(() => {
    this.firstName(); this.lastName(); this.email();
    this.formError.set('');
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isOwnProfile.set(false);
      this.loadById(+id);
    } else {
      this.isOwnProfile.set(true);
      this.loadMyProfile();
    }
  }

  loadMyProfile() {
    this.loading.set(true);
    this.empService.getMyProfile().subscribe({
      next: (emp: Employee) => { this.setProfile(emp); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastService.error('Failed to load profile.'); }
    });
  }

  loadById(id: number) {
    this.loading.set(true);
    this.empService.getById(id).subscribe({
      next: (emp: Employee) => { this.setProfile(emp); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastService.error('Failed to load employee.'); }
    });
  }

  setProfile(emp: Employee) {
    this.profile.set(emp);
    this.firstName.set(emp.firstName);
    this.lastName.set(emp.lastName);
    this.email.set(emp.email);
    this.phone.set(emp.phone ?? '');
    this.department.set(emp.department ?? '');
    this.jobTitle.set(emp.jobTitle ?? '');
  }

  startEdit() { this.editing.set(true); }

  cancelEdit() {
    const emp = this.profile();
    if (emp) this.setProfile(emp);
    this.editing.set(false);
    this.formError.set('');
  }

  saveProfile() {
    if (!this.firstName().trim() || !this.lastName().trim() || !this.email().trim()) {
      this.formError.set('First name, last name and email are required.');
      this.toastService.warning('Please fill required fields.');
      return;
    }
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(this.email())) {
      this.formError.set('Please enter a valid email.');
      this.toastService.error('Please enter a valid email.');
      return;
    }

    this.saving.set(true);
    const payload = {
      firstName:  this.firstName().trim(),
      lastName:   this.lastName().trim(),
      email:      this.email().trim(),
      phone:      this.phone().trim() || undefined,
      department: this.department() || undefined,
      jobTitle:   this.jobTitle().trim() || undefined
    };

    const req = this.isOwnProfile()
      ? this.empService.updateMyProfile(payload)
      : this.empService.updateById(this.profile()!.employeeId, payload);

    req.subscribe({
      next: (updated: Employee) => {
        this.setProfile(updated);
        this.saving.set(false);
        this.editing.set(false);
        this.toastService.success('Profile updated successfully!');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Failed to update profile.';
        this.formError.set(msg);
        this.toastService.error(msg);
      }
    });
  }

  getInitials(): string {
    const p = this.profile();
    if (!p) return 'U';
    return `${p.firstName[0]}${p.lastName[0]}`.toUpperCase();
  }
}