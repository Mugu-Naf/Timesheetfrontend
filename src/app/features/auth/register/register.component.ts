import { Component, inject, signal, effect, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private authService  = inject(AuthService);
  private toastService = inject(ToastService);

  // Two-way model signals
  username   = model('');
  password   = model('');
  confirmPwd = model('');
  firstName  = model('');
  lastName   = model('');
  email      = model('');
  phone      = model('');
  department = model('');
  jobTitle   = model('');

  // UI state
  loading       = signal(false);
  showPassword  = signal(false);
  showConfirm   = signal(false);
  formError     = signal('');
  currentStep   = signal(1);

  departments = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'Design', 'Other'];

  // Auto-clear error on field change
  private clearEffect = effect(() => {
    this.username(); this.password(); this.confirmPwd();
    this.firstName(); this.lastName(); this.email();
    this.formError.set('');
  });

  nextStep() {
    if (this.currentStep() === 1) {
      if (!this.username().trim() || !this.password().trim() || !this.confirmPwd().trim()) {
        this.formError.set('Please fill all required fields.');
        this.toastService.warning('Please fill all required fields.');
        return;
      }
      if (this.password().length < 6) {
        this.formError.set('Password must be at least 6 characters.');
        this.toastService.warning('Password must be at least 6 characters.');
        return;
      }
      if (this.password() !== this.confirmPwd()) {
        this.formError.set('Passwords do not match.');
        this.toastService.error('Passwords do not match.');
        return;
      }
    }
    this.formError.set('');
    this.currentStep.update(s => s + 1);
  }

  prevStep() { this.currentStep.update(s => s - 1); }

  onSubmit() {
    if (!this.firstName().trim() || !this.lastName().trim() || !this.email().trim()) {
      this.formError.set('Please fill all required fields.');
      this.toastService.warning('Please fill all required fields.');
      return;
    }
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(this.email())) {
      this.formError.set('Please enter a valid email.');
      this.toastService.error('Please enter a valid email.');
      return;
    }

    this.loading.set(true);
    const payload: RegisterRequest = {
      username:   this.username().trim(),
      password:   this.password(),
      firstName:  this.firstName().trim(),
      lastName:   this.lastName().trim(),
      email:      this.email().trim(),
      phone:      this.phone().trim() || undefined,
      department: this.department() || undefined,
      jobTitle:   this.jobTitle().trim() || undefined
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('Account created! Please sign in.');
        setTimeout(() => window.location.href = '/login', 1200);
      },
      error: err => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Registration failed. Please try again.';
        this.formError.set(msg);
        this.toastService.error(msg);
      }
    });
  }
}
