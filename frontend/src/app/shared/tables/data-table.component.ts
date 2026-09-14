import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../components/loading-spinner.component';
import { EmptyStateComponent } from '../components/empty-state.component';
import { ErrorStateComponent } from '../components/error-state.component';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  formatter?: (row: T) => string | number;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortEvent {
  column: string;
  direction: SortDirection;
}

/**
 * DataTableComponent provides a standardized, responsive table container.
 * Why: Standardizing tables prevents duplicated markup, ensures consistent
 * padding/borders, and handles loading, error, and empty states uniformly across modules.
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, ErrorStateComponent],
  template: `
    <div class="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      <!-- Loading State -->
      @if (loading) {
        <app-loading-spinner [message]="loadingMessage" minHeight="min-h-[260px]"></app-loading-spinner>
      }

      <!-- Error State -->
      @else if (hasError) {
        <div class="p-6">
          <app-error-state
            [title]="errorMessageTitle"
            [message]="errorMessage"
            (onRetry)="retry.emit()"
          ></app-error-state>
        </div>
      }

      <!-- Empty State -->
      @else if (!data || data.length === 0) {
        <app-empty-state
          [icon]="emptyIcon"
          [title]="emptyTitle"
          [description]="emptyDescription"
          [actionLabel]="emptyActionLabel"
          (onAction)="emptyAction.emit()"
        ></app-empty-state>
      }

      <!-- Table Content -->
      @else {
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                @for (col of columns; track col.key) {
                  <th
                    [style.width]="col.width"
                    [class.text-left]="col.align === 'left' || !col.align"
                    [class.text-center]="col.align === 'center'"
                    [class.text-right]="col.align === 'right'"
                    [class.cursor-pointer]="col.sortable"
                    (click)="handleSort(col)"
                    class="py-3.5 px-4 select-none hover:bg-slate-100/60 transition group"
                  >
                    <div class="inline-flex items-center gap-1.5" [class.justify-center]="col.align === 'center'" [class.justify-end]="col.align === 'right'">
                      <span>{{ col.label }}</span>
                      @if (col.sortable) {
                        <span class="material-icons-outlined text-sm transition-transform text-slate-400 group-hover:text-slate-600">
                          @if (currentSortColumn === col.key) {
                            {{ currentSortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                          } @else {
                            unfold_more
                          }
                        </span>
                      }
                    </div>
                  </th>
                }
                @if (hasActions) {
                  <th class="py-3.5 px-4 text-right">Actions</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
              @for (row of data; track trackByFn(row); let idx = $index) {
                <tr
                  [class.hover:bg-indigo-50/30]="hoverable"
                  class="transition-colors duration-150 group"
                >
                  @for (col of columns; track col.key) {
                    <td
                      [class.text-left]="col.align === 'left' || !col.align"
                      [class.text-center]="col.align === 'center'"
                      [class.text-right]="col.align === 'right'"
                      class="py-3 px-4 font-normal align-middle"
                    >
                      <!-- Custom Cell Template projection if supplied -->
                      @if (customCell) {
                        <ng-container
                          *ngTemplateOutlet="customCell; context: { $implicit: row, col: col, index: idx }"
                        ></ng-container>
                      } @else {
                        {{ getCellValue(row, col) }}
                      }
                    </td>
                  }

                  <!-- Actions Template Slot -->
                  @if (hasActions && actionsTemplate) {
                    <td class="py-3 px-4 text-right align-middle whitespace-nowrap">
                      <ng-container
                        *ngTemplateOutlet="actionsTemplate; context: { $implicit: row, index: idx }"
                      ></ng-container>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class DataTableComponent<T = any> {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() loading: boolean = false;
  @Input() loadingMessage: string = 'Loading records...';
  @Input() hasError: boolean = false;
  @Input() errorMessageTitle: string = 'Failed to load records';
  @Input() errorMessage: string = 'There was an issue fetching data. Please retry.';
  @Input() emptyTitle: string = 'No records found';
  @Input() emptyDescription: string = 'No entries match the current filter or search criteria.';
  @Input() emptyIcon: string = 'format_list_bulleted';
  @Input() emptyActionLabel?: string;
  @Input() hoverable: boolean = true;
  @Input() hasActions: boolean = false;
  @Input() rowTrackBy: string = 'id';

  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() retry = new EventEmitter<void>();
  @Output() emptyAction = new EventEmitter<void>();

  @ContentChild('customCell') customCell?: TemplateRef<any>;
  @ContentChild('actionsTemplate') actionsTemplate?: TemplateRef<any>;

  currentSortColumn: string | null = null;
  currentSortDirection: SortDirection = null;

  trackByFn(item: any): any {
    return item[this.rowTrackBy] || item;
  }

  getCellValue(row: any, col: TableColumn<T>): any {
    if (col.formatter) {
      return col.formatter(row);
    }
    return row ? row[col.key] : '';
  }

  handleSort(col: TableColumn<T>): void {
    if (!col.sortable) return;

    if (this.currentSortColumn !== col.key) {
      this.currentSortColumn = col.key;
      this.currentSortDirection = 'asc';
    } else if (this.currentSortDirection === 'asc') {
      this.currentSortDirection = 'desc';
    } else {
      this.currentSortColumn = null;
      this.currentSortDirection = null;
    }

    this.sortChange.emit({
      column: col.key,
      direction: this.currentSortDirection
    });
  }
}
