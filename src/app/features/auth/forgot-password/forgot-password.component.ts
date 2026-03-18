import { Component, inject, signal, effect, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  private authService  = inject(AuthService);
  private toastService = inject(ToastService);

  username     = model('');
  newPassword  = model('');
  confirmPwd   = model('');
  showPassword = signal(false);
  loading      = signal(false);
  formError    = signal('');
  success      = signal(false);

  private clearEffect = effect(() => {
    this.username(); this.newPassword(); this.confirmPwd();
    this.formError.set('');
  });

  onSubmit() {
    if (!this.username().trim() || !this.newPassword().trim() || !this.confirmPwd().trim()) {
      this.formError.set('All fields are required.');
      this.toastService.warning('All fields are required.');
      return;
    }
    if (this.newPassword().length < 6) {
      this.formError.set('Password must be at least 6 characters.');
      this.toastService.warning('Password must be at least 6 characters.');
      return;
    }
    if (this.newPassword() !== this.confirmPwd()) {
      this.formError.set('Passwords do not match.');
      this.toastService.error('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.authService.forgotPassword({
      username: this.username().trim(),
      newPassword: this.newPassword()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.toastService.success('Password reset successful! Please sign in.');
      },
      error: err => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Reset failed. Please try again.';
        this.formError.set(msg);
        this.toastService.error(msg);
      }
    });
  }
}
