import { Component, inject, signal, effect, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LeaveService } from '../../../core/services/leave.service';
import { ToastService } from '../../../core/services/toast.service';
import { LeaveType } from '../../../core/models/leave.model';

@Component({
  selector: 'app-leave-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './leave-form.component.html',
  styleUrls: ['./leave-form.component.css']
})
export class LeaveFormComponent {
  private leaveService = inject(LeaveService);
  private toastService = inject(ToastService);
  private router       = inject(Router);

  leaveType  = model<LeaveType>('Casual');
  startDate  = model('');
  endDate    = model('');
  reason     = model('');
  loading    = signal(false);
  formError  = signal('');

  leaveTypes: LeaveType[] = ['Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'Unpaid'];

  leaveTypeInfo: Record<string, string> = {
    Casual:    'For personal errands or short breaks.',
    Sick:      'For illness or medical appointments.',
    Earned:    'Annual leave earned over time.',
    Maternity: 'For new mothers — up to 26 weeks.',
    Paternity: 'For new fathers — up to 15 days.',
    Unpaid:    'Leave without pay when other leaves exhausted.'
  };

  private clearEffect = effect(() => {
    this.leaveType(); this.startDate(); this.endDate();
    this.formError.set('');
  });

  getDays(): number {
    if (!this.startDate() || !this.endDate()) return 0;
    const diff = new Date(this.endDate()).getTime() - new Date(this.startDate()).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }

  onSubmit() {
    if (!this.leaveType() || !this.startDate() || !this.endDate()) {
      this.formError.set('Please fill all required fields.');
      this.toastService.warning('Please fill all required fields.');
      return;
    }
    if (new Date(this.endDate()) < new Date(this.startDate())) {
      this.formError.set('End date must be after start date.');
      this.toastService.error('End date must be after start date.');
      return;
    }

    this.loading.set(true);
    this.leaveService.create({
      leaveType: this.leaveType(),
      startDate: this.startDate(),
      endDate: this.endDate(),
      reason: this.reason().trim() || undefined
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('Leave request submitted successfully!');
        this.router.navigate(['/leave']);
      },
      error: err => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'Failed to submit leave request.';
        this.formError.set(msg);
        this.toastService.error(msg);
      }
    });
  }
}
