import { Component, inject, signal, effect, model, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private authService  = inject(AuthService);
  private toastService = inject(ToastService);

  // Two-way model signals
  username     = model('');
  password     = model('');

  // UI state signals
  loading      = signal(false);
  showPassword = signal(false);
  rememberMe   = signal(false);
  formError    = signal('');

  // Clear error when user types
  private clearEffect = effect(() => {
    this.username(); this.password();
    this.formError.set('');
  });

  // Persist remember-me
  private rememberEffect = effect(() => {
    if (this.rememberMe()) localStorage.setItem('rememberedUser', this.username());
    else localStorage.removeItem('rememberedUser');
  });

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.authService.redirectByRole();
      return;
    }
    const saved = localStorage.getItem('rememberedUser');
    if (saved) { this.username.set(saved); this.rememberMe.set(true); }
  }

  togglePassword() { this.showPassword.update(v => !v); }

  onSubmit() {
    if (!this.username().trim() || !this.password().trim()) {
      this.formError.set('Please fill in all fields.');
      this.toastService.warning('Please fill in all fields.');
      return;
    }
    this.loading.set(true);
    const payload: LoginRequest = { username: this.username().trim(), password: this.password() };

    this.authService.login(payload).subscribe({
      next: res => {
        this.authService.setSession(res);
        this.toastService.success(`Welcome back, ${res.username}! 👋`);
        setTimeout(() => { this.loading.set(false); this.authService.redirectByRole(); }, 600);
      },
      error: err => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Invalid username or password.';
        this.formError.set(msg);
        this.toastService.error(msg);
      }
    });
  }
}
