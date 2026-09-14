import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * EmptyStateComponent provides contextual guidance when zero records are present.
 * Why: Keeps UX intuitive and avoids confusing blank containers.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-12 text-center rounded-2xl bg-white border border-slate-200/80 my-4 flex flex-col items-center justify-center">
      <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        <span class="material-icons-outlined text-3xl">{{ icon }}</span>
      </div>
      <h3 class="text-sm font-bold text-slate-800">{{ title }}</h3>
      <p class="text-xs text-slate-500 mt-1 max-w-sm">{{ description }}</p>

      @if (actionLabel) {
        <button
          type="button"
          (click)="onAction.emit()"
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
        >
          @if (actionIcon) {
            <span class="material-icons-outlined text-sm">{{ actionIcon }}</span>
          }
          {{ actionLabel }}
        </button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon: string = 'inbox';
  @Input() title: string = 'No records found';
  @Input() description: string = 'There is currently no data matching your criteria.';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;

  @Output() onAction = new EventEmitter<void>();
}
