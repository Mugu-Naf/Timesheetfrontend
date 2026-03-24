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
        <p class="notfound__msg">The page you are looking for does not exist.</p>
        <a routerLink="/login" class="notfound__btn">Go to Login</a>
      </div>
    </div>
  `,
  styles: [`
    .notfound {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
    }
    .notfound__box {
      text-align: center;
      padding: 3rem 2rem;
      background: #fff;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }
    .notfound__code {
      font-size: 6rem;
      font-weight: 800;
      color: #3b82f6;
      line-height: 1;
    }
    .notfound__title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0.5rem 0;
    }
    .notfound__msg {
      color: #64748b;
      margin-bottom: 1.5rem;
    }
    .notfound__btn {
      display: inline-block;
      padding: 0.625rem 1.5rem;
      background: #3b82f6;
      color: #fff;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      transition: background 0.15s;
    }
    .notfound__btn:hover { background: #2563eb; }
  `]
})
export class NotFoundComponent {}
