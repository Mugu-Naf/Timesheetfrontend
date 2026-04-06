import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="notfound">
      <div class="notfound__box">
        <div class="notfound__code">404</div>
        <h2 class="notfound__title">Page Not Found</h2>
        <p class="notfound__msg">The page you're looking for doesn't exist or was moved.</p>
        <a routerLink="/login" class="notfound__btn">← Back to Login</a>
      </div>
    </div>
  `,
  styles: [`
    .notfound {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg, #f0f2f5);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .notfound__box {
      text-align: center;
      padding: 3rem 2.5rem;
      background: #fff;
      border-radius: 20px;
      border: 1px solid rgba(0,0,0,0.08);
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      max-width: 420px;
      width: 100%;
    }
    .notfound__code {
      font-size: 7rem;
      font-weight: 800;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      letter-spacing: -0.04em;
    }
    .notfound__title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0.75rem 0 0.5rem;
      letter-spacing: -0.02em;
    }
    .notfound__msg {
      color: #64748b;
      font-size: 0.9375rem;
      margin: 0 0 2rem;
    }
    .notfound__btn {
      display: inline-block;
      padding: 0.75rem 1.75rem;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      color: #fff;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9375rem;
      transition: opacity 0.15s, transform 0.15s;
      box-shadow: 0 4px 14px rgba(37,99,235,0.35);
    }
    .notfound__btn:hover { opacity: 0.9; transform: translateY(-1px); }
  `]
})
export class NotFoundComponent {}
