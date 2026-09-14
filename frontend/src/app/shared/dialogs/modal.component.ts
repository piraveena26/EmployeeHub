import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ModalComponent renders an accessible dialog overlay with backdrop blur and animations.
 * Why: Keeps modal look & feel uniform, handles backdrop clicks and keyboard 'Escape' closing.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          (click)="onBackdropClick()"
        ></div>

        <!-- Modal Container -->
        <div
          [ngClass]="sizeClasses"
          class="relative w-full bg-white rounded-2xl shadow-2xl border border-slate-100 transform transition-all flex flex-col max-h-[90vh] overflow-hidden z-10"
        >
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div>
              <h2 class="text-base font-bold text-slate-900">{{ title }}</h2>
              @if (subtitle) {
                <p class="text-xs text-slate-500 mt-0.5">{{ subtitle }}</p>
              }
            </div>
            @if (showCloseButton) {
              <button
                type="button"
                (click)="close()"
                aria-label="Close modal"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-200/60 transition"
              >
                <span class="material-icons-outlined text-xl leading-none">close</span>
              </button>
            }
          </div>

          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto flex-1">
            <ng-content></ng-content>
          </div>

          <!-- Modal Footer (optional projection) -->
          <div class="px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'lg';
  @Input() closeOnBackdrop: boolean = true;
  @Input() showCloseButton: boolean = true;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
    this.onClose.emit();
  }

  get sizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case '2xl':
        return 'max-w-6xl';
      default:
        return 'max-w-2xl';
    }
  }
}
