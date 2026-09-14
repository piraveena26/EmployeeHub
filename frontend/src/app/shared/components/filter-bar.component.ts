import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  label: string;
  value: any;
}

export interface FilterDefinition {
  key: string;
  label: string;
  options: FilterOption[];
  selectedValue?: any;
}

/**
 * FilterBarComponent provides dynamic dropdown filters and clear functionality.
 * Why: Keeps filtering UI uniform across all directory and history modules.
 */
@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-wrap items-center gap-2.5">
      @for (filter of filters; track filter.key) {
        <div class="flex items-center">
          <select
            [id]="'filter-' + filter.key"
            [(ngModel)]="filter.selectedValue"
            (ngModelChange)="onFilterChange(filter.key, $event)"
            class="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition shadow-sm"
          >
            <option [ngValue]="null">{{ filter.label }}</option>
            @for (opt of filter.options; track opt.value) {
              <option [ngValue]="opt.value">{{ opt.label }}</option>
            }
          </select>
        </div>
      }

      @if (hasActiveFilters) {
        <button
          type="button"
          (click)="resetFilters()"
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition"
        >
          <span class="material-icons-outlined text-sm">restart_alt</span>
          Reset Filters
        </button>
      }
    </div>
  `
})
export class FilterBarComponent {
  @Input() filters: FilterDefinition[] = [];

  @Output() filterChange = new EventEmitter<{ key: string; value: any }>();
  @Output() reset = new EventEmitter<void>();

  get hasActiveFilters(): boolean {
    return this.filters.some(f => f.selectedValue !== null && f.selectedValue !== undefined && f.selectedValue !== '');
  }

  onFilterChange(key: string, value: any): void {
    this.filterChange.emit({ key, value });
  }

  resetFilters(): void {
    this.filters.forEach(f => {
      f.selectedValue = null;
    });
    this.reset.emit();
  }
}
