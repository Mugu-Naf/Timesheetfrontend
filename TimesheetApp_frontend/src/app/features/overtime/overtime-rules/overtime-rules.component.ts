import { Component, inject, signal, effect, model, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OvertimeService } from '../../../core/services/overtime.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { OvertimeRule } from '../../../core/models/overtime.model';

@Component({
  selector: 'app-overtime-rules',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, DatePipe],
  templateUrl: './overtime-rules.component.html',
  styleUrls: ['./overtime-rules.component.css']
})
export class OvertimeRulesComponent implements OnInit {
  private overtimeService = inject(OvertimeService);
  private toastService    = inject(ToastService);

  loading    = signal(true);
  saving     = signal(false);
  rules      = signal<OvertimeRule[]>([]);
  showForm   = signal(false);
  editingId  = signal<number | null>(null);
  formError  = signal('');

  // Form model signals
  ruleName          = model('');
  maxRegularHours   = model<number>(8);
  overtimeMultiplier = model<number>(1.5);
  effectiveFrom     = model('');
  effectiveTo       = model('');
  isActive          = model(true);

  private clearEffect = effect(() => {
    this.ruleName(); this.maxRegularHours(); this.overtimeMultiplier();
    this.formError.set('');
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.overtimeService.getAll().subscribe({
      next: r => { this.rules.set(r); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastService.error('Failed to load overtime rules.'); }
    });
  }

  openNewForm() {
    this.editingId.set(null);
    this.ruleName.set('');
    this.maxRegularHours.set(8);
    this.overtimeMultiplier.set(1.5);
    this.effectiveFrom.set(new Date().toISOString().split('T')[0]);
    this.effectiveTo.set('');
    this.isActive.set(true);
    this.formError.set('');
    this.showForm.set(true);
  }

  editRule(rule: OvertimeRule) {
    this.editingId.set(rule.overtimeRuleId);
    this.ruleName.set(rule.ruleName);
    this.maxRegularHours.set(rule.maxRegularHours);
    this.overtimeMultiplier.set(rule.overtimeMultiplier);
    this.effectiveFrom.set(rule.effectiveFrom?.split('T')[0] ?? '');
    this.effectiveTo.set(rule.effectiveTo?.split('T')[0] ?? '');
    this.isActive.set(rule.isActive);
    this.formError.set('');
    this.showForm.set(true);
  }

  cancelForm() { this.showForm.set(false); this.editingId.set(null); }

  onSubmit() {
    if (!this.ruleName().trim() || !this.effectiveFrom()) {
      this.formError.set('Rule name and effective-from date are required.');
      this.toastService.warning('Please fill required fields.');
      return;
    }
    if (this.maxRegularHours() < 0.5 || this.maxRegularHours() > 24) {
      this.formError.set('Max regular hours must be between 0.5 and 24.');
      return;
    }
    if (this.overtimeMultiplier() < 1.0 || this.overtimeMultiplier() > 5.0) {
      this.formError.set('Overtime multiplier must be between 1.0 and 5.0.');
      return;
    }

    this.saving.set(true);
    const payload = {
      ruleName:           this.ruleName().trim(),
      maxRegularHours:    this.maxRegularHours(),
      overtimeMultiplier: this.overtimeMultiplier(),
      effectiveFrom:      this.effectiveFrom(),
      effectiveTo:        this.effectiveTo() || undefined,
      isActive:           this.isActive()
    };

    const id = this.editingId();
    const req = id
      ? this.overtimeService.update(id, payload)
      : this.overtimeService.create(payload);

    req.subscribe({
      next: result => {
        if (id) {
          this.rules.update(list => list.map(r => r.overtimeRuleId === id ? result : r));
        } else {
          this.rules.update(list => [...list, result]);
        }
        this.saving.set(false);
        this.showForm.set(false);
        this.toastService.success(id ? 'Rule updated!' : 'Rule created!');
      },
      error: err => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Failed to save rule.';
        this.formError.set(msg);
        this.toastService.error(msg);
      }
    });
  }
}
