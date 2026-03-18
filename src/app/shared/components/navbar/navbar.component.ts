import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  protected auth = inject(AuthService);
  pageTitle = input<string>('Dashboard');
  toggleSidebar = output<void>();

  onToggle() { this.toggleSidebar.emit(); }
}
