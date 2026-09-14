import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';

/**
 * ConfirmDialogComponent renders an explicit prompt before executing critical or destructive actions.
 * Why: Safeguards data integrity and prevents accidental deletions, rejections, or status changes.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      (isOpenChange)="isOpenChange.emit($event)"
      [title]="title"
      size="sm"
      [closeOnBackdrop]="!isLoading"
      [showCloseButton]="!isLoading"
      (onClose)="cancel()"
    >
      <div class="flex items-start gap-4">
        <div [ngClass]="iconBgClasses" class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">
          <span [ngClass]="iconTextClasses" class="material-icons-outlined text-2xl">{{ icon }}</span>
        </div>
        <div>
          <p class="text-xs text-slate-600 leading-relaxed">{{ message }}</p>
          @if (consequenceText) {
            <p class="text-[11px] text-slate-400 mt-2 italic">{{ consequenceText }}</p>
          }
        </div>
      </div>

      <div modal-footer class="flex items-center gap-2">
        <button
          type="button"
          (click)="cancel()"
          [disabled]="isLoading"
          class="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition"
        >
          {{ cancelLabel }}
        </button>

        <button
          type="button"
          (click)="confirm()"
          [disabled]="isLoading"
          [ngClass]="confirmButtonClasses"
          class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm disabled:opacity-50 transition active:scale-95"
        >
          @if (isLoading) {
            <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          }
          {{ confirmLabel }}
        </button>
      </div>
    </app-modal>
  `
})
export class ConfirmDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() consequenceText?: string;
  @Input() confirmLabel: string = 'Confirm';
  @Input() cancelLabel: string = 'Cancel';
  @Input() variant: 'danger' | 'warning' | 'primary' = 'danger';
  @Input() isLoading: boolean = false;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  get icon(): string {
    switch (this.variant) {
      case 'danger':
        return 'warning';
      case 'warning':
        return 'help_outline';
      case 'primary':
      default:
        return 'info';
    }
  }

  get iconBgClasses(): string {
    switch (this.variant) {
      case 'danger':
        return 'bg-rose-100 text-rose-600';
      case 'warning':
        return 'bg-amber-100 text-amber-600';
      case 'primary':
      default:
        return 'bg-indigo-100 text-indigo-600';
    }
  }

  get iconTextClasses(): string {
    switch (this.variant) {
      case 'danger':
        return 'text-rose-600';
      case 'warning':
        return 'text-amber-600';
      case 'primary':
      default:
        return 'text-indigo-600';
    }
  }

  get confirmButtonClasses(): string {
    switch (this.variant) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700';
      case 'primary':
      default:
        return 'bg-indigo-600 hover:bg-indigo-700';
    }
  }

  confirm(): void {
    this.onConfirm.emit();
  }

  cancel(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.onCancel.emit();
  }
}
