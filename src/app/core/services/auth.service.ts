import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  LoginRequest, LoginResponse,
  RegisterRequest, ForgotPasswordRequest
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private api    = environment.apiUrl;

  // ── Signals ────────────────────────────────────────────
  readonly token    = signal<string | null>(localStorage.getItem('token'));
  readonly username = signal<string | null>(localStorage.getItem('username'));
  readonly role     = signal<string | null>(localStorage.getItem('role'));

  readonly isLoggedIn = computed(() => !!this.token());
  readonly isAdmin    = computed(() => this.role() === 'Admin');
  readonly isHR       = computed(() => this.role() === 'HR');
  readonly isEmployee = computed(() => this.role() === 'Employee');
  readonly isAdminOrHR = computed(() => this.role() === 'Admin' || this.role() === 'HR');

  // Sync token to localStorage
  private syncEffect = effect(() => {
    const t = this.token();
    if (t) localStorage.setItem('token', t);
    else   localStorage.removeItem('token');
  });

  // ── HTTP Calls ─────────────────────────────────────────
  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.api}/auth/login`, payload);
  }

  register(payload: RegisterRequest) {
    return this.http.post<void>(`${this.api}/auth/register`, payload);
  }

  forgotPassword(payload: ForgotPasswordRequest) {
    return this.http.post<void>(`${this.api}/auth/forgot-password`, payload);
  }

  // ── Session ─────────────────────────────────────────────
  setSession(res: LoginResponse) {
    this.token.set(res.token);
    this.username.set(res.username);
    this.role.set(res.role);
    localStorage.setItem('username', res.username);
    localStorage.setItem('role', res.role);
  }

  logout() {
    this.token.set(null);
    this.username.set(null);
    this.role.set(null);
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  redirectByRole() {
    const r = this.role();
    if (r === 'Admin' || r === 'HR') {
      this.router.navigate(['/dashboard/admin']);
    } else {
      this.router.navigate(['/dashboard/employee']);
    }
  }
}
