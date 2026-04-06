import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge badge--{{ status().toLowerCase() }}">
      {{ status() }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    .badge--pending   { background: #fef9c3; color: #a16207; border: 1px solid #fde047; }
    .badge--approved  { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .badge--rejected  { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .badge--cancelled { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .badge--present   { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .badge--absent    { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .badge--halfday   { background: #fef9c3; color: #a16207; border: 1px solid #fde047; }
    .badge--leave     { background: #ede9fe; color: #5b21b6; border: 1px solid #c4b5fd; }
  `]
})
export class StatusBadgeComponent {
  status = input.required<string>();
}
