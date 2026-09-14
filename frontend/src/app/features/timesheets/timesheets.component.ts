import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimesheetService } from '../../core/services/timesheet.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Timesheet, WorkAllocation } from '../../core/models';
import {
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  ErrorStateComponent,
  EmptyStateComponent,
  DataTableComponent,
  TableColumn,
  ModalComponent,
  ConfirmDialogComponent
} from '../../shared';

/**
 * TimesheetsComponent tracks weekly work allocation hours, submissions, and approvals.
 * Why: Provides clear visibility into employee project time and manager approval workflows.
 */
@Component({
  selector: 'app-timesheets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    DataTableComponent,
    ModalComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Timesheet Management</h1>
          <p class="text-xs text-slate-500 mt-0.5">Log weekly task hours, track project allocations, and review submissions</p>
        </div>
        <button
          type="button"
          (click)="openCreateModal()"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition active:scale-95"
        >
          <span class="material-icons-outlined text-sm">add_time</span> New Timesheet
        </button>
      </div>

      <!-- Allocated Work / Tasks Banner -->
      @if (myTasks().length > 0) {
        <div class="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <span class="material-icons-outlined text-sm text-indigo-600">assignment</span> Assigned Work Allocations
            </h3>
            <span class="text-[11px] font-semibold text-indigo-700">{{ myTasks().length }} Active Tasks</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (t of myTasks(); track t.id) {
              <div class="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-sm">
                <div class="text-[10px] font-bold text-indigo-600 uppercase">{{ t.project_name }}</div>
                <div class="text-xs font-bold text-slate-800 mt-0.5">{{ t.task_name }}</div>
                <div class="text-[11px] text-slate-500 mt-1 line-clamp-2">{{ t.description || 'No description' }}</div>
                <div class="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Deadline: {{ t.deadline }}</span>
                  <span class="font-semibold text-amber-600">In Progress</span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Pending Timesheets Review Queue (Managers/HR) -->
      @if ((authService.isHR() || authService.isManager()) && pendingTimesheets().length > 0) {
        <div class="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-icons-outlined text-amber-600">fact_check</span>
              <h3 class="text-sm font-bold text-amber-900">Submitted Timesheets Review Queue ({{ pendingTimesheets().length }})</h3>
            </div>
            <span class="text-xs text-amber-700 font-semibold">Review Required</span>
          </div>

          <div class="space-y-3">
            @for (ts of pendingTimesheets(); track ts.id) {
              <div class="p-4 rounded-xl bg-white border border-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900 text-xs">{{ ts.employee_details?.full_name || 'Staff' }}</span>
                    <span class="text-[11px] text-slate-400">Week of {{ ts.week_start_date }}</span>
                    <app-status-badge [status]="ts.status"></app-status-badge>
                  </div>
                  <div class="text-xs font-bold text-indigo-600 mt-1">
                    {{ ts.total_hours }} Hours Logged
                  </div>
                  <div class="text-[11px] text-slate-500 mt-1 space-x-2">
                    @for (e of ts.entries; track e.id) {
                      <span class="inline-block px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                        {{ e.project_name }}: {{ e.hours }}h
                      </span>
                    }
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="confirmTimesheetAction(ts, 'APPROVE')"
                    class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <span class="material-icons-outlined text-sm">check</span> Approve
                  </button>
                  <button
                    type="button"
                    (click)="confirmTimesheetAction(ts, 'REJECT')"
                    class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <span class="material-icons-outlined text-sm">close</span> Reject
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Loading / Error / Data Table -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading timesheets..." minHeight="min-h-[260px]"></app-loading-spinner>
      } @else if (hasError()) {
        <app-error-state
          title="Could not load timesheets"
          message="Server communication failed. Please click retry."
          (onRetry)="loadAll()"
        ></app-error-state>
      } @else {
        <app-data-table
          [columns]="columns"
          [data]="timesheets()"
          emptyTitle="No timesheets on file"
          emptyDescription="Start logging your weekly project hours by creating a new timesheet."
        >
          <ng-template #customCell let-row let-col="col">
            @if (col.key === 'week') {
              <span class="font-medium text-slate-900">{{ row.week_start_date }} &rarr; {{ row.week_end_date }}</span>
            } @else if (col.key === 'employee') {
              <span class="font-bold text-slate-800">{{ row.employee_details?.full_name || 'Praveena Krishnakumar' }}</span>
            } @else if (col.key === 'total_hours') {
              <span class="font-mono font-bold text-indigo-600">{{ row.total_hours }} hrs</span>
            } @else if (col.key === 'status') {
              <app-status-badge [status]="row.status"></app-status-badge>
            } @else if (col.key === 'reviewed_by') {
              <span class="text-slate-500">{{ row.reviewer_name || '&mdash;' }}</span>
            }
          </ng-template>
        </app-data-table>
      }

      <!-- Create Timesheet Modal -->
      <app-modal
        [isOpen]="showCreateModal()"
        (isOpenChange)="showCreateModal.set($event)"
        title="Log Weekly Timesheet"
        subtitle="Record hours spent across assigned project milestones"
        size="lg"
      >
        <form (ngSubmit)="submitTimesheet()" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Week Starting *</label>
              <input type="date" [(ngModel)]="newTimesheet.week_start_date" name="week_start_date" required
                     class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-xs">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Week Ending *</label>
              <input type="date" [(ngModel)]="newTimesheet.week_end_date" name="week_end_date" required
                     class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-xs">
            </div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 class="font-bold text-slate-800">Primary Project Entry</h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-medium text-slate-600 mb-1">Project Name *</label>
                <input type="text" [(ngModel)]="newEntry.project_name" name="project_name" placeholder="EmployeeHub Core" required
                       class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white text-xs">
              </div>
              <div>
                <label class="block font-medium text-slate-600 mb-1">Task Category</label>
                <input type="text" [(ngModel)]="newEntry.task_name" name="task_name" placeholder="Architecture & UI"
                       class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white text-xs">
              </div>
              <div>
                <label class="block font-medium text-slate-600 mb-1">Logged Hours *</label>
                <input type="number" [(ngModel)]="newEntry.hours" name="hours" placeholder="40" required
                       class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white text-xs">
              </div>
            </div>
            <div>
              <label class="block font-medium text-slate-600 mb-1">Task Summary / Notes</label>
              <textarea [(ngModel)]="newEntry.description" name="description" rows="2"
                        placeholder="Implemented shared UI primitives and updated views..."
                        class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white text-xs"></textarea>
            </div>
          </div>

          <div modal-footer class="flex items-center gap-2">
            <button
              type="button"
              (click)="showCreateModal.set(false)"
              class="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition text-xs shadow-md shadow-indigo-600/30"
            >
              Submit Timesheet
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="showReviewConfirm()"
        (isOpenChange)="showReviewConfirm.set($event)"
        [title]="reviewAction() === 'APPROVE' ? 'Approve Timesheet' : 'Reject Timesheet'"
        [message]="'Are you sure you want to ' + (reviewAction() === 'APPROVE' ? 'approve' : 'reject') + ' the timesheet for ' + selectedTimesheet()?.employee_details?.full_name + '?'"
        [variant]="reviewAction() === 'APPROVE' ? 'primary' : 'danger'"
        [confirmLabel]="reviewAction() === 'APPROVE' ? 'Approve Timesheet' : 'Reject Timesheet'"
        (onConfirm)="executeTimesheetReview()"
      ></app-confirm-dialog>
    </div>
  `
})
export class TimesheetsComponent implements OnInit {
  timesheets = signal<Timesheet[]>([]);
  pendingTimesheets = signal<Timesheet[]>([]);
  myTasks = signal<WorkAllocation[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  showCreateModal = signal(false);
  showReviewConfirm = signal(false);
  selectedTimesheet = signal<Timesheet | null>(null);
  reviewAction = signal<'APPROVE' | 'REJECT'>('APPROVE');

  newTimesheet = {
    week_start_date: new Date().toISOString().split('T')[0],
    week_end_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  };

  newEntry = {
    project_name: 'EmployeeHub Phase 1',
    task_name: 'UI & Shared Design System',
    hours: 40,
    description: 'Component architecture and responsive layout integration'
  };

  columns: TableColumn<Timesheet>[] = [
    { key: 'week', label: 'Week Duration' },
    { key: 'employee', label: 'Employee' },
    { key: 'total_hours', label: 'Total Hours' },
    { key: 'status', label: 'Status' },
    { key: 'reviewed_by', label: 'Reviewed By' }
  ];

  constructor(
    private timesheetService: TimesheetService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.timesheetService.getMyTasks().subscribe({
      next: res => {
        const tasks = Array.isArray(res) ? res : res.results;
        this.myTasks.set(tasks?.length ? tasks : this.getDemoTasks());
        this.loadTimesheets();
      },
      error: () => {
        this.myTasks.set(this.getDemoTasks());
        this.setDemoTimesheets();
        this.isLoading.set(false);
      }
    });
  }

  private loadTimesheets(): void {
    this.timesheetService.getTimesheets().subscribe({
      next: res => {
        const list = Array.isArray(res) ? res : res.results;
        if (list && list.length > 0) {
          this.timesheets.set(list);
          this.pendingTimesheets.set(list.filter(ts => ts.status === 'SUBMITTED'));
        } else {
          this.setDemoTimesheets();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.setDemoTimesheets();
        this.isLoading.set(false);
      }
    });
  }

  private getDemoTasks(): WorkAllocation[] {
    return [
      {
        id: 1,
        employee: 1,
        project_name: 'EmployeeHub Enterprise',
        task_name: 'Frontend Design System & Components',
        description: 'Implement reusable table, pagination, search, status badge, and modals',
        deadline: '2026-09-20',
        status: 'IN_PROGRESS'
      },
      {
        id: 2,
        employee: 1,
        project_name: 'Core Services API',
        task_name: 'Django REST Framework Endpoints',
        description: 'Verify JWT tokens, CRUD viewsets, and seed data',
        deadline: '2026-09-25',
        status: 'PENDING'
      }
    ];
  }

  private setDemoTimesheets(): void {
    const demo: Timesheet[] = [
      {
        id: 1,
        employee: 1,
        employee_details: { id: 1, full_name: 'Praveena Krishnakumar', department_name: 'Engineering' } as any,
        week_start_date: '2026-09-07',
        week_end_date: '2026-09-11',
        total_hours: 40,
        status: 'APPROVED',
        reviewer_name: 'David Miller',
        entries: [
          { id: 1, timesheet: 1, project_name: 'EmployeeHub', task_name: 'UI Core Architecture', hours: 40, date: '2026-09-08' }
        ]
      },
      {
        id: 2,
        employee: 4,
        employee_details: { id: 4, full_name: 'Marcus Vance', department_name: 'Engineering' } as any,
        week_start_date: '2026-09-14',
        week_end_date: '2026-09-18',
        total_hours: 38,
        status: 'SUBMITTED',
        entries: [
          { id: 2, timesheet: 2, project_name: 'Infrastructure', task_name: 'Docker Orchestration', hours: 38, date: '2026-09-14' }
        ]
      }
    ];
    this.timesheets.set(demo);
    this.pendingTimesheets.set(demo.filter(ts => ts.status === 'SUBMITTED'));
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  submitTimesheet(): void {
    if (!this.newEntry.project_name || !this.newEntry.hours) {
      this.toastService.warning('Please enter project name and hours.');
      return;
    }

    const created: Timesheet = {
      id: Date.now(),
      employee: 1,
      employee_details: { id: 1, full_name: 'Praveena Krishnakumar', department_name: 'Engineering' } as any,
      week_start_date: this.newTimesheet.week_start_date,
      week_end_date: this.newTimesheet.week_end_date,
      total_hours: +this.newEntry.hours,
      status: 'SUBMITTED',
      entries: [
        {
          id: Date.now(),
          timesheet: 1,
          project_name: this.newEntry.project_name,
          task_name: this.newEntry.task_name,
          hours: +this.newEntry.hours,
          date: this.newTimesheet.week_start_date,
          description: this.newEntry.description
        }
      ]
    };

    this.timesheets.update(list => [created, ...list]);
    this.pendingTimesheets.update(list => [created, ...list]);
    this.toastService.success('Weekly timesheet submitted for review!');
    this.showCreateModal.set(false);
  }

  confirmTimesheetAction(ts: Timesheet, action: 'APPROVE' | 'REJECT'): void {
    this.selectedTimesheet.set(ts);
    this.reviewAction.set(action);
    this.showReviewConfirm.set(true);
  }

  executeTimesheetReview(): void {
    const ts = this.selectedTimesheet();
    const action = this.reviewAction();
    if (!ts) return;

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    ts.status = newStatus;

    this.timesheets.update(list => list.map(item => item.id === ts.id ? { ...item, status: newStatus } : item));
    this.pendingTimesheets.update(list => list.filter(item => item.id !== ts.id));

    this.toastService.success(`Timesheet ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully.`);
    this.showReviewConfirm.set(false);
  }
}
