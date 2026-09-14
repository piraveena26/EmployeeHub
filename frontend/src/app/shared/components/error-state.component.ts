import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ErrorStateComponent displays a failure message with an actionable retry button.
 * Why: Mandated by project resilience standards (Rule 5) to ensure no blank screens
 * or silent failures occur when API requests or operations fail.
 */
@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 my-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
      <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <span class="material-icons-outlined text-2xl">error_outline</span>
      </div>
      <h3 class="text-base font-bold text-slate-900">{{ title }}</h3>
      <p class="text-xs text-slate-600 mt-1 max-w-sm">{{ message }}</p>

      @if (showRetry) {
        <button
          type="button"
          (click)="onRetry.emit()"
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <span class="material-icons-outlined text-sm">refresh</span>
          {{ retryLabel }}
        </button>
      }
    </div>
  `
})
export class ErrorStateComponent {
  @Input() title: string = 'Unable to load content';
  @Input() message: string = 'An unexpected error occurred while communicating with the server. Please try again.';
  @Input() showRetry: boolean = true;
  @Input() retryLabel: string = 'Try Again';

  @Output() onRetry = new EventEmitter<void>();
}
