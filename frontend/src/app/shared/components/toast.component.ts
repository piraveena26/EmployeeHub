import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../core/services/toast.service';

/**
 * ToastComponent renders floating notification pills in the bottom-right or top-right.
 * Why: Non-intrusive feedback container that automatically consumes ToastService signals.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [ngClass]="getToastClasses(toast.type)"
          class="pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transform transition-all duration-300 animate-slide-in"
          role="alert"
        >
          <!-- Icon -->
          <span [ngClass]="getIconClasses(toast.type)" class="material-icons-outlined text-xl shrink-0 mt-0.5">
            {{ getIcon(toast.type) }}
          </span>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            @if (toast.title) {
              <h4 class="text-xs font-bold text-slate-900 leading-tight">{{ toast.title }}</h4>
            }
            <p class="text-xs text-slate-600 mt-0.5 leading-normal">{{ toast.message }}</p>
          </div>

          <!-- Close button -->
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition shrink-0"
            aria-label="Dismiss"
          >
            <span class="material-icons-outlined text-base">close</span>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  getToastClasses(type: ToastMessage['type']): string {
    switch (type) {
      case 'success':
        return 'bg-white border-emerald-200 shadow-emerald-500/10';
      case 'error':
        return 'bg-white border-rose-200 shadow-rose-500/10';
      case 'warning':
        return 'bg-white border-amber-200 shadow-amber-500/10';
      case 'info':
      default:
        return 'bg-white border-indigo-200 shadow-indigo-500/10';
    }
  }

  getIcon(type: ToastMessage['type']): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }

  getIconClasses(type: ToastMessage['type']): string {
    switch (type) {
      case 'success':
        return 'text-emerald-500';
      case 'error':
        return 'text-rose-500';
      case 'warning':
        return 'text-amber-500';
      case 'info':
      default:
        return 'text-indigo-500';
    }
  }
}
