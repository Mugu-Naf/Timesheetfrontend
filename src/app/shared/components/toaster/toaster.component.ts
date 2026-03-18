import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}">
          <span class="toast__icon">{{ iconMap[toast.type] }}</span>
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" (click)="toastService.dismiss(toast.id)">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      max-width: 22rem;
      width: calc(100vw - 2.5rem);
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.875rem 1rem;
      border-radius: 0.75rem;
      color: #fff;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      animation: slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes slideIn {
      from { transform: translateX(110%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
    .toast--success { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .toast--error   { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .toast--warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .toast--info    { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .toast__icon    { font-size: 1.1rem; flex-shrink: 0; }
    .toast__message { flex: 1; line-height: 1.4; }
    .toast__close {
      background: none; border: none; color: rgba(255,255,255,0.8);
      cursor: pointer; font-size: 0.875rem; padding: 0; line-height: 1; flex-shrink: 0;
    }
    .toast__close:hover { color: #fff; }
  `]
})
export class ToasterComponent {
  protected toastService = inject(ToastService);
  readonly iconMap: Record<string, string> = {
    success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️'
  };
}
