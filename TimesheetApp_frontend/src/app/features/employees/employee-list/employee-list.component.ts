import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoaderComponent],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  private empService   = inject(EmployeeService);
  private toastService = inject(ToastService);

  loading     = signal(true);
  employees   = signal<Employee[]>([]);
  searchQuery = signal('');
  filterDept  = signal('All');

  departments = computed(() => {
    const depts = [...new Set(this.employees().map(e => e.department).filter(Boolean))] as string[];
    return ['All', ...depts.sort()];
  });

  filtered = computed(() => {
    let list = this.employees();
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.username.toLowerCase().includes(q)
    );
    if (this.filterDept() !== 'All') list = list.filter(e => e.department === this.filterDept());
    return list;
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.empService.getAll().subscribe({
      next: emps => { this.employees.set(emps); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastService.error('Failed to load employees.'); }
    });
  }

  getInitials(e: Employee): string {
    return `${e.firstName[0]}${e.lastName[0]}`.toUpperCase();
  }

  getAvatarColor(id: number): string {
    const colors = ['#3b82f6','#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#ef4444','#22c55e'];
    return colors[id % colors.length];
  }
}
