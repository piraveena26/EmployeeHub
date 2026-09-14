import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * LoadingSpinnerComponent provides a clean visual indicator for async data fetching.
 * Why: Standardizing loading indicators prevents abrupt layout shifts and gives users clear feedback.
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="containerClasses" class="flex flex-col items-center justify-center p-8 text-center">
      <div
        [ngClass]="spinnerSizeClasses"
        class="border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"
      ></div>
      @if (message) {
        <p class="mt-3 text-xs font-medium text-slate-500">{{ message }}</p>
      }
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() message: string = 'Loading data...';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() minHeight: string = 'min-h-[200px]';

  get containerClasses(): string {
    return this.minHeight;
  }

  get spinnerSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'w-5 h-5 border-2';
      case 'lg':
        return 'w-12 h-12 border-4';
      case 'md':
      default:
        return 'w-8 h-8 border-3';
    }
  }
}
