import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * PaginationComponent renders accessible page navigation and page-size selection.
 * Why: Keeps table footers consistent across all administrative lists.
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200/80 text-xs text-slate-600">
      <!-- Items info & Page Size -->
      <div class="flex items-center gap-3">
        <span>
          Showing
          <strong class="font-semibold text-slate-800">{{ startItem }}</strong>
          to
          <strong class="font-semibold text-slate-800">{{ endItem }}</strong>
          of
          <strong class="font-semibold text-slate-800">{{ totalItems }}</strong>
          results
        </span>

        @if (showPageSizeSelector) {
          <div class="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
            <label for="pageSizeSelect" class="text-slate-500">Rows per page:</label>
            <select
              id="pageSizeSelect"
              [value]="pageSize"
              (change)="onPageSizeChange($event)"
              class="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              @for (opt of pageSizeOptions; track opt) {
                <option [value]="opt">{{ opt }}</option>
              }
            </select>
          </div>
        }
      </div>

      <!-- Page Controls -->
      <div class="flex items-center gap-1">
        <!-- Previous -->
        <button
          type="button"
          (click)="goToPage(currentPage - 1)"
          [disabled]="currentPage <= 1"
          class="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
          aria-label="Previous page"
        >
          <span class="material-icons-outlined text-base">chevron_left</span>
        </button>

        <!-- Page numbers -->
        @for (p of visiblePages; track p) {
          <button
            type="button"
            (click)="goToPage(p)"
            [class.bg-indigo-600]="p === currentPage"
            [class.text-white]="p === currentPage"
            [class.border-indigo-600]="p === currentPage"
            [class.hover:bg-slate-100]="p !== currentPage"
            class="min-w-[28px] h-7 px-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 transition"
          >
            {{ p }}
          </button>
        }

        <!-- Next -->
        <button
          type="button"
          (click)="goToPage(currentPage + 1)"
          [disabled]="currentPage >= totalPages"
          class="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
          aria-label="Next page"
        >
          <span class="material-icons-outlined text-base">chevron_right</span>
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];
  @Input() showPageSizeSelector: boolean = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range: number[] = [];

    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      range.push(i);
    }
    return range;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(e: Event): void {
    const target = e.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10);
    if (newSize && newSize !== this.pageSize) {
      this.pageSizeChange.emit(newSize);
    }
  }
}
