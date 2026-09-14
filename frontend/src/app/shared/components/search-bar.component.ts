import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * SearchBarComponent provides a debounced, clearable search input.
 * Why: Emitting debounced queries reduces unnecessary filtering/API calls
 * and ensures a responsive user experience.
 */
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full" [ngClass]="containerClass">
      <span class="material-icons-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
        search
      </span>
      <input
        type="text"
        [(ngModel)]="query"
        (ngModelChange)="onModelChange($event)"
        [placeholder]="placeholder"
        class="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white transition shadow-sm"
      />
      @if (query) {
        <button
          type="button"
          (click)="clear()"
          aria-label="Clear search"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full transition"
        >
          <span class="material-icons-outlined text-base">close</span>
        </button>
      }
    </div>
  `
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Search records...';
  @Input() containerClass: string = 'max-w-md';
  @Input() debounceMs: number = 300;
  @Input() initialValue: string = '';

  @Output() search = new EventEmitter<string>();

  query: string = '';
  private searchSubject = new Subject<string>();
  private sub?: Subscription;

  ngOnInit(): void {
    this.query = this.initialValue;
    this.sub = this.searchSubject.pipe(
      debounceTime(this.debounceMs),
      distinctUntilChanged()
    ).subscribe(value => {
      this.search.emit(value.trim());
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onModelChange(val: string): void {
    this.searchSubject.next(val);
  }

  clear(): void {
    this.query = '';
    this.searchSubject.next('');
  }
}
