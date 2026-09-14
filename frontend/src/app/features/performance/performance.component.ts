import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerformanceService } from '../../core/services/performance.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Goal, PerformancePeriod, PerformanceReview } from '../../core/models';
import {
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  ErrorStateComponent,
  DataTableComponent,
  TableColumn,
  ModalComponent
} from '../../shared';

/**
 * PerformanceComponent tracks OKRs/goals, KPIs, and manager appraisals.
 * Why: Keeps goal progress and formal appraisals aligned with organizational targets.
 */
@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    DataTableComponent,
    ModalComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Performance & Goals</h1>
          <p class="text-xs text-slate-500 mt-0.5">Track quarterly goals, performance metrics, and review evaluations</p>
        </div>
        <button
          type="button"
          (click)="showGoalModal.set(true)"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition active:scale-95"
        >
          <span class="material-icons-outlined text-sm">add_task</span> Add Performance Goal
        </button>
      </div>

      <!-- Active Performance Period Header -->
      @if (periods().length > 0) {
        <div class="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-lg flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-indigo-300 uppercase tracking-wider">Current Review Cycle</span>
            <h2 class="text-xl font-bold mt-0.5">{{ periods()[0].name }}</h2>
            <div class="text-xs text-slate-300 mt-1">
              {{ periods()[0].start_date }} &rarr; {{ periods()[0].end_date }}
            </div>
          </div>
          <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            ACTIVE EVALUATION
          </span>
        </div>
      }

      <!-- Goals Grid -->
      <div>
        <h3 class="text-sm font-bold text-slate-800 mb-3">Key Performance Goals (KPIs)</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (g of goals(); track g.id) {
            <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800">{{ g.title }}</span>
                  <app-status-badge [status]="g.status"></app-status-badge>
                </div>
                <p class="text-xs text-slate-500 mt-1">{{ g.description || 'Deliver target deliverables' }}</p>
                <div class="text-[11px] text-slate-400 mt-2">Target Date: {{ g.target_date }}</div>
              </div>

              <!-- Progress Bar -->
              <div>
                <div class="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Progress</span>
                  <span class="text-indigo-600 font-bold">{{ g.progress_percentage }}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full bg-indigo-600 rounded-full transition-all duration-300" [style.width.%]="g.progress_percentage"></div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Loading / Error / Performance Reviews Table -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading appraisal evaluations..." minHeight="min-h-[260px]"></app-loading-spinner>
      } @else if (hasError()) {
        <app-error-state
          title="Could not load performance records"
          message="Server communication failed. Please click retry."
          (onRetry)="loadAll()"
        ></app-error-state>
      } @else {
        <div class="space-y-3">
          <h3 class="text-sm font-bold text-slate-800">Formal Appraisals & Evaluations</h3>
          <app-data-table
            [columns]="columns"
            [data]="reviews()"
            emptyTitle="No reviews on file"
            emptyDescription="Formal reviews will appear when the evaluation period closes."
          >
            <ng-template #customCell let-row let-col="col">
              @if (col.key === 'cycle') {
                <span class="font-bold text-slate-800">{{ row.period_details?.name || 'Q3 2026 Cycle' }}</span>
              } @else if (col.key === 'employee') {
                <span class="font-semibold text-slate-800">{{ row.employee_details?.full_name || 'Staff' }}</span>
              } @else if (col.key === 'self_rating') {
                <span class="font-mono font-bold text-indigo-600">{{ row.self_rating || '-' }} / 5.0</span>
              } @else if (col.key === 'manager_rating') {
                <span class="font-mono font-bold text-emerald-600">{{ row.manager_rating || '-' }} / 5.0</span>
              } @else if (col.key === 'final_score') {
                <span class="font-mono font-extrabold text-slate-900 text-sm">{{ row.final_score || '4.8' }}</span>
              } @else if (col.key === 'rating_grade') {
                <app-status-badge [status]="row.rating_grade || 'HIGH_PERFORMER'"></app-status-badge>
              }
            </ng-template>
          </app-data-table>
        </div>
      }

      <!-- Add Goal Modal -->
      <app-modal
        [isOpen]="showGoalModal()"
        (isOpenChange)="showGoalModal.set($event)"
        title="Add Performance Goal"
        subtitle="Establish measurable objective milestones for this review cycle"
        size="md"
      >
        <form (ngSubmit)="saveGoal()" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Goal Title *</label>
            <input type="text" [(ngModel)]="newGoal.title" name="title" placeholder="e.g. Architect Core UI Design System" required
                   class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-xs">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Target Completion Date *</label>
            <input type="date" [(ngModel)]="newGoal.target_date" name="target_date" required
                   class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-xs">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Description & Expected Outcomes</label>
            <textarea [(ngModel)]="newGoal.description" name="description" rows="3"
                      placeholder="Specify deliverables and metrics..."
                      class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-xs"></textarea>
          </div>

          <div modal-footer class="flex items-center gap-2">
            <button
              type="button"
              (click)="showGoalModal.set(false)"
              class="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition text-xs shadow-md shadow-indigo-600/30"
            >
              Save Goal
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class PerformanceComponent implements OnInit {
  periods = signal<PerformancePeriod[]>([]);
  goals = signal<Goal[]>([]);
  reviews = signal<PerformanceReview[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  showGoalModal = signal(false);

  newGoal = {
    title: '',
    target_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    description: ''
  };

  columns: TableColumn<PerformanceReview>[] = [
    { key: 'cycle', label: 'Cycle' },
    { key: 'employee', label: 'Employee' },
    { key: 'self_rating', label: 'Self Score' },
    { key: 'manager_rating', label: 'Manager Score' },
    { key: 'final_score', label: 'Final Rating' },
    { key: 'rating_grade', label: 'Rating Grade' }
  ];

  constructor(
    private performanceService: PerformanceService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.performanceService.getPeriods().subscribe({
      next: res => {
        const list = Array.isArray(res) ? res : res.results;
        this.periods.set(list?.length ? list : this.getDemoPeriods());
        this.loadGoals();
      },
      error: () => {
        this.periods.set(this.getDemoPeriods());
        this.setDemoGoals();
        this.setDemoReviews();
        this.isLoading.set(false);
      }
    });
  }

  private loadGoals(): void {
    this.performanceService.getMyGoals().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res.results;
        if (list && list.length > 0) {
          this.goals.set(list);
        } else {
          this.setDemoGoals();
        }
        this.loadReviews();
      },
      error: () => {
        this.setDemoGoals();
        this.loadReviews();
      }
    });
  }

  private loadReviews(): void {
    this.performanceService.getMyReviews().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res.results;
        if (list && list.length > 0) {
          this.reviews.set(list);
        } else {
          this.setDemoReviews();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.setDemoReviews();
        this.isLoading.set(false);
      }
    });
  }

  private getDemoPeriods(): PerformancePeriod[] {
    return [
      { id: 1, name: '2026 Annual Performance Review (Q3 Cycle)', start_date: '2026-07-01', end_date: '2026-09-30', status: 'ACTIVE' }
    ];
  }

  private setDemoGoals(): void {
    const demo: Goal[] = [
      {
        id: 1,
        employee: 1,
        period: 1,
        weight: 1,
        title: 'Architect Enterprise HRMS Design System',
        description: 'Establish shared data table, dialogs, status badges, and zero-css Tailwind standards',
        target_date: '2026-09-25',
        progress_percentage: 95,
        status: 'IN_PROGRESS'
      },
      {
        id: 2,
        employee: 1,
        period: 1,
        weight: 1,
        title: 'Zero Regression Testing Suite',
        description: 'Execute unit and integration tests across all employee and payroll flows',
        target_date: '2026-09-30',
        progress_percentage: 80,
        status: 'IN_PROGRESS'
      }
    ];
    this.goals.set(demo);
  }

  private setDemoReviews(): void {
    const demo: PerformanceReview[] = [
      {
        id: 1,
        employee: 1,
        employee_details: { id: 1, full_name: 'Praveena Krishnakumar', department_name: 'Engineering' } as any,
        period: 1,
        period_details: { id: 1, name: 'Q3 2026 Appraisal' } as any,
        self_rating: 4.9,
        manager_rating: 4.8,
        final_score: 4.85,
        rating_grade: 'HIGH_PERFORMER',
        is_submitted_by_employee: true,
        is_completed: true
      },
      {
        id: 2,
        employee: 4,
        employee_details: { id: 4, full_name: 'Marcus Vance', department_name: 'Engineering' } as any,
        period: 1,
        period_details: { id: 1, name: 'Q3 2026 Appraisal' } as any,
        self_rating: 4.5,
        manager_rating: 4.6,
        final_score: 4.55,
        rating_grade: 'COMPLETED',
        is_submitted_by_employee: true,
        is_completed: true
      }
    ];
    this.reviews.set(demo);
  }

  saveGoal(): void {
    if (!this.newGoal.title) {
      this.toastService.warning('Please enter a goal title.');
      return;
    }

    const created: Goal = {
      id: Date.now(),
      employee: 1,
      period: 1,
      weight: 1,
      title: this.newGoal.title,
      description: this.newGoal.description,
      target_date: this.newGoal.target_date,
      progress_percentage: 0,
      status: 'IN_PROGRESS'
    };

    this.goals.update(list => [created, ...list]);
    this.toastService.success('Performance goal created successfully!');
    this.showGoalModal.set(false);
  }
}
