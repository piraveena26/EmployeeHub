import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * StatusBadgeComponent renders a standardized badge with semantic Tailwind colors.
 * Why: Centralizing status color logic ensures brand consistency across tables,
 * cards, and detail views, preventing arbitrary hex/class definitions in feature templates.
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [ngClass]="badgeClasses"
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border transition-colors"
    >
      @if (showDot) {
        <span [ngClass]="dotClasses" class="w-1.5 h-1.5 rounded-full"></span>
      }
      {{ displayLabel }}
    </span>
  `
})
export class StatusBadgeComponent {
  /** Raw status string e.g. 'ACTIVE', 'PENDING', 'APPROVED' */
  @Input() status: string = '';
  /** Optional custom text label override */
  @Input() label?: string;
  /** Whether to show a decorative indicator dot */
  @Input() showDot: boolean = true;
  /** Optional size variant: 'sm' | 'md' */
  @Input() size: 'sm' | 'md' = 'sm';

  get displayLabel(): string {
    if (this.label) return this.label;
    if (!this.status) return 'Unknown';
    // Format enum like 'ON_LEAVE' to 'On Leave'
    return this.status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  get badgeClasses(): string {
    const key = (this.status || '').toUpperCase();

    // Emerald / Green group (Success, active, present, approved, paid)
    if (['ACTIVE', 'PRESENT', 'APPROVED', 'PAID', 'SUCCESS', 'HIGH_PERFORMER', 'COMPLETED'].includes(key)) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    }

    // Amber / Yellow group (Pending, warning, on leave, late)
    if (['ON_LEAVE', 'PENDING', 'LATE', 'HALF_DAY', 'WARNING', 'UNDER_REVIEW', 'NEEDS_IMPROVEMENT'].includes(key)) {
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    }

    // Rose / Red group (Inactive, rejected, absent, terminated, unpaid)
    if (['INACTIVE', 'ABSENT', 'REJECTED', 'TERMINATED', 'FAILED', 'OVERDUE', 'DANGER'].includes(key)) {
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    }

    // Indigo / Blue group (Roles, full time, informational)
    if (['SUPER_ADMIN', 'HR_MANAGER', 'MANAGER', 'FULL_TIME', 'IN_PROGRESS', 'SUBMITTED', 'INFO'].includes(key)) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    }

    // Default Slate / Neutral group
    return 'bg-slate-100 text-slate-700 border-slate-200/80';
  }

  get dotClasses(): string {
    const key = (this.status || '').toUpperCase();

    if (['ACTIVE', 'PRESENT', 'APPROVED', 'PAID', 'SUCCESS', 'HIGH_PERFORMER', 'COMPLETED'].includes(key)) {
      return 'bg-emerald-500';
    }
    if (['ON_LEAVE', 'PENDING', 'LATE', 'HALF_DAY', 'WARNING', 'UNDER_REVIEW', 'NEEDS_IMPROVEMENT'].includes(key)) {
      return 'bg-amber-500';
    }
    if (['INACTIVE', 'ABSENT', 'REJECTED', 'TERMINATED', 'FAILED', 'OVERDUE', 'DANGER'].includes(key)) {
      return 'bg-rose-500';
    }
    if (['SUPER_ADMIN', 'HR_MANAGER', 'MANAGER', 'FULL_TIME', 'IN_PROGRESS', 'SUBMITTED', 'INFO'].includes(key)) {
      return 'bg-indigo-500';
    }
    return 'bg-slate-400';
  }
}
