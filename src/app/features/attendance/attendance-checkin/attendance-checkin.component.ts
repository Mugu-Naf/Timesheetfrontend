import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AttendanceService } from '../../../core/services/attendance.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Attendance } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-attendance-checkin',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, LoaderComponent, DatePipe],
  templateUrl: './attendance-checkin.component.html',
  styleUrls: ['./attendance-checkin.component.css']
})
export class AttendanceCheckinComponent implements OnInit, OnDestroy {
  private attService   = inject(AttendanceService);
  private toastService = inject(ToastService);

  loading       = signal(true);
  actionLoading = signal(false);
  attendance    = signal<Attendance[]>([]);
  currentTime   = signal(new Date());

  todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Computed so it always reflects the current day (even past midnight)
  todayRecord = computed(() => {
    const todayStr = this.currentTime().toDateString();
    return this.attendance().find(a => new Date(a.date).toDateString() === todayStr) ?? null;
  });

  isCheckedIn  = computed(() => !!this.todayRecord()?.checkInTime);
  isCheckedOut = computed(() => !!this.todayRecord()?.checkOutTime);

  // Detect if there's a previous day record with check-in but no check-out
  forgotCheckout = computed(() => {
    const todayStr = this.currentTime().toDateString();
    return this.attendance().find(a => {
      return new Date(a.date).toDateString() !== todayStr && a.checkInTime && !a.checkOutTime;
    }) ?? null;
  });

  // Summary stats — based on actual check-in records
  totalPresent  = computed(() => this.attendance().filter(a => a.checkInTime && a.status === 'Present').length);
  totalHalfDay  = computed(() => this.attendance().filter(a => a.checkInTime && a.status === 'HalfDay').length);
  totalLeave    = computed(() => this.attendance().filter(a => a.status === 'Leave').length);
  totalAbsent   = computed(() => this.attendance().filter(a => a.status === 'Absent').length);

  private clockInterval?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.load();
    this.clockInterval = setInterval(() => this.currentTime.set(new Date()), 60000);
  }

  ngOnDestroy() { clearInterval(this.clockInterval); }

  load() {
    this.loading.set(true);
    this.attService.getMyAttendance().subscribe({
      next: att => {
        const sorted = [...att].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.attendance.set(sorted);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Failed to load attendance.');
      }
    });
  }

  checkIn() {
    this.actionLoading.set(true);
    this.attService.checkIn({ checkInTime: new Date().toISOString() }).subscribe({
      next: rec => {
        this.attendance.update(list => [rec, ...list.filter(a => a.attendanceId !== rec.attendanceId)]);
        this.actionLoading.set(false);
        this.toastService.success('Checked in successfully!');
      },
      error: err => {
        this.actionLoading.set(false);
        this.toastService.error(err?.error?.message ?? 'Check-in failed.');
      }
    });
  }

  checkOut() {
    this.actionLoading.set(true);
    this.attService.checkOut({ checkOutTime: new Date().toISOString() }).subscribe({
      next: rec => {
        this.attendance.update(list => list.map(a => a.attendanceId === rec.attendanceId ? rec : a));
        this.actionLoading.set(false);
        this.toastService.success('Checked out successfully!');
      },
      error: err => {
        this.actionLoading.set(false);
        this.toastService.error(err?.error?.message ?? 'Check-out failed.');
      }
    });
  }

  getDurationStr(inStr: string, outStr: string): string {
    const ms = new Date(outStr).getTime() - new Date(inStr).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  }

  getWorkDuration(): string {
    const rec = this.todayRecord();
    if (!rec?.checkInTime) return '—';
    const end = rec.checkOutTime ? new Date(rec.checkOutTime) : new Date();
    const ms = end.getTime() - new Date(rec.checkInTime).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  }

  // Format time string — backend stores IST directly, just extract HH:mm
  formatTime(timeStr: string | undefined | null): string {
    if (!timeStr) return '—';
    // If it's a full ISO string, extract time part directly (already IST from backend)
    const t = new Date(timeStr);
    const h = t.getHours().toString().padStart(2, '0');
    const m = t.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}
