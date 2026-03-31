import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AttendanceService } from '../../../core/services/attendance.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
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
  protected auth       = inject(AuthService);

  loading       = signal(true);
  actionLoading = signal(false);
  attendance    = signal<Attendance[]>([]);
  currentTime   = signal(new Date());

  todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // All sessions for today
  todaySessions = computed(() => {
    const todayStr = this.currentTime().toDateString();
    return this.attendance().filter(a => new Date(a.date).toDateString() === todayStr);
  });

  // The currently open session (checked in, not yet checked out)
  openSession = computed(() =>
    this.todaySessions().find(a => a.checkInTime && !a.checkOutTime) ?? null
  );

  // True if there's an active open session right now
  isCheckedIn = computed(() => !!this.openSession());

  // Total hours across all completed sessions today
  totalHoursToday = computed(() => {
    return this.todaySessions()
      .filter(a => a.checkInTime && a.checkOutTime)
      .reduce((sum, a) => {
        const ms = new Date(a.checkOutTime!).getTime() - new Date(a.checkInTime!).getTime();
        return sum + ms / 3600000;
      }, 0);
  });

  // Today's status from the latest session
  todayStatus = computed(() => {
    const sessions = this.todaySessions();
    if (sessions.length === 0) return null;
    return sessions[sessions.length - 1].status;
  });

  // Detect forgot checkout from a previous day
  forgotCheckout = computed(() => {
    const todayStr = this.currentTime().toDateString();
    return this.attendance().find(a =>
      new Date(a.date).toDateString() !== todayStr && a.checkInTime && !a.checkOutTime
    ) ?? null;
  });

  // Summary stats — count unique days
  totalPresent = computed(() => {
    const days = new Set(this.attendance().filter(a => a.status === 'Present').map(a => a.date.split('T')[0]));
    return days.size;
  });
  totalHalfDay = computed(() => {
    const days = new Set(this.attendance().filter(a => a.status === 'HalfDay').map(a => a.date.split('T')[0]));
    return days.size;
  });
  totalLeave  = computed(() => this.attendance().filter(a => a.status === 'Leave').length);
  totalAbsent = computed(() => this.attendance().filter(a => a.status === 'Absent').length);

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
    const rec = this.openSession();
    if (!rec?.checkInTime) return '—';
    const end = new Date();
    const ms = end.getTime() - new Date(rec.checkInTime).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  }

  getTotalHoursStr(): string {
    const total = this.totalHoursToday();
    if (total === 0) return '—';
    const h = Math.floor(total);
    const m = Math.round((total - h) * 60);
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

  // HR: fix a forgotten checkout on any attendance record
  fixCheckout(attendanceId: number) {
    this.attService.fixCheckout(attendanceId).subscribe({
      next: updated => {
        this.attendance.update(list => list.map(a => a.attendanceId === attendanceId ? updated : a));
        this.toastService.success('Checkout fixed successfully.');
      },
      error: err => this.toastService.error(err?.error?.message ?? 'Failed to fix checkout.')
    });
  }
