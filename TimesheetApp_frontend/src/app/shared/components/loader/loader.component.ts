import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (show()) {
      <div class="loader-overlay" [class.loader-overlay--inline]="inline()">
        <div class="loader-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring spinner-ring--2"></div>
        </div>
        @if (message()) {
          <p class="loader-message">{{ message() }}</p>
        }
      </div>
    }
  `,
  styles: [`
    .loader-overlay {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(3px);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 9000;
    }
    .loader-overlay--inline {
      position: relative; inset: auto;
      background: transparent; backdrop-filter: none;
      padding: 2rem; z-index: auto;
    }
    .loader-spinner { position: relative; width: 48px; height: 48px; }
    .spinner-ring {
      position: absolute; inset: 0;
      border: 3px solid transparent;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner-ring--2 {
      inset: 6px;
      border-top-color: #93c5fd;
      animation-duration: 0.6s;
      animation-direction: reverse;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loader-message {
      margin-top: 1rem; color: #e2e8f0; font-size: 0.875rem; font-weight: 500;
    }
  `]
})
export class LoaderComponent {
  show    = input<boolean>(false);
  inline  = input<boolean>(false);
  message = input<string>('');
}
