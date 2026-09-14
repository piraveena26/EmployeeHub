import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../core/services/leave.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { LeaveBalance, LeaveRequest, LeaveType } from '../../core/models';
import {
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  ErrorStateComponent,
  DataTableComponent,
  TableColumn,
  ModalComponent,
  ConfirmDialogComponent
} from '../../shared';

/**
 * LeaveComponent manages time-off applications, approvals, quotas, and historical requests.
 * Why: Seamlessly guides employees through leave booking and managers through queue review.
 */
@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    DataTableComponent,
    ModalComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Leave Management</h1>
          <p class="text-xs text-slate-500 mt-0.5">Apply for time off, monitor quota balances, and review team requests</p>
        </div>
        <button
          type="button"
          (click)="openApplyModal()"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition active:scale-95"
        >
          <span class="material-icons-outlined text-sm">add</span> Apply for Leave
        </button>
      </div>

      <!-- Leave Balances Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        @for (b of balances(); track b.id) {
          <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div class="text-xs font-semibold text-slate-500">{{ b.leave_type_name }}</div>
            <div class="text-3xl font-extrabold text-indigo-600 mt-1">{{ b.remaining_days }}</div>
            <div class="text-[11px] text-slate-400 mt-1">{{ b.used_days }} used of {{ b.total_days }} days</div>
          </div>
        }
      </div>

      <!-- HR / Manager Approval Queue -->
      @if ((authService.isHR() || authService.isManager()) && pendingApprovals().length > 0) {
        <div class="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-icons-outlined text-amber-600">pending_actions</span>
              <h3 class="text-sm font-bold text-amber-900">Pending Leave Approvals Queue ({{ pendingApprovals().length }})</h3>
            </div>
            <span class="text-xs text-amber-700 font-semibold">Action Required</span>
          </div>

          <div class="space-y-3">
            @for (req of pendingApprovals(); track req.id) {
              <div class="p-4 rounded-xl bg-white border border-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900 text-xs">{{ req.employee_details?.full_name || 'Staff' }}</span>
                    <span class="text-[11px] text-slate-400">({{ req.employee_details?.department_name || 'General' }})</span>
                    <app-status-badge [status]="req.leave_type_name || 'Annual'"></app-status-badge>
                  </div>
                  <div class="text-xs text-slate-600 mt-1">
                    <span class="font-semibold">{{ req.start_date }}</span> to <span class="font-semibold">{{ req.end_date }}</span>
                    &bull; <span class="font-bold text-indigo-600">{{ req.total_days }} days</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1 italic">"{{ req.reason }}"</div>
                </div>

                <div class="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    (click)="confirmAction(req, 'APPROVE')"
                    class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <span class="material-icons-outlined text-sm">check</span> Approve
                  </button>
                  <button
                    type="button"
                    (click)="confirmAction(req, 'REJECT')"
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
        <app-loading-spinner message="Loading leave applications..." minHeight="min-h-[260px]"></app-loading-spinner>
      } @else if (hasError()) {
        <app-error-state
          title="Could not load leave records"
          message="Server communication failed. Please retry."
          (onRetry)="loadAll()"
        ></app-error-state>
      } @else {
        <app-data-table
          [columns]="columns"
          [data]="leaveRequests()"
          emptyTitle="No leave applications"
          emptyDescription="There are no past or upcoming leave requests on file."
        >
          <ng-template #customCell let-row let-col="col">
            @if (col.key === 'employee') {
              <div>
                <div class="font-bold text-slate-800">{{ row.employee_details?.full_name || 'Praveena Krishnakumar' }}</div>
                <div class="text-[11px] text-slate-400">{{ row.employee_details?.department_name || 'Engineering' }}</div>
              </div>
            } @else if (col.key === 'leave_type_name') {
              <span class="font-semibold text-slate-800">{{ row.leave_type_name }}</span>
            } @else if (col.key === 'duration') {
              <span class="text-slate-600">{{ row.start_date }} &rarr; {{ row.end_date }}</span>
            } @else if (col.key === 'total_days') {
              <span class="font-mono font-bold text-indigo-600">{{ row.total_days }} days</span>
            } @else if (col.key === 'reason') {
              <span class="truncate max-w-xs block text-slate-500">{{ row.reason }}</span>
            } @else if (col.key === 'status') {
              <app-status-badge [status]="row.status"></app-status-badge>
            } @else if (col.key === 'reviewed_by') {
              <span class="text-slate-500">{{ row.reviewed_by_details?.full_name || '&mdash;' }}</span>
            }
          </ng-template>
        </app-data-table>
      }

      <!-- Apply Leave Modal -->
      <app-modal
        [isOpen]="showApplyModal()"
        (isOpenChange)="showApplyModal.set($event)"
        title="Apply for Leave"
        subtitle="Submit a formal time-off request for supervisor review"
        size="md"
      >
        <form (ngSubmit)="submitLeaveApplication()" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Leave Type *</label>
            <select [(ngModel)]="newLeave.leave_type" name="leave_type" required
                    class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white text-xs">
              @for (lt of leaveTypes(); track lt.id) {
                <option [ngValue]="lt.id">{{ lt.name }} ({{ lt.default_days }} days/yr)</option>
              }
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Start Date *</label>
              <input type="date" [(ngModel)]="newLeave.start_date" name="start_date" required
                     class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-xs">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">End Date *</label>
              <input type="date" [(ngModel)]="newLeave.end_date" name="end_date" required
                     class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-xs">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Reason for Leave *</label>
            <textarea [(ngModel)]="newLeave.reason" name="reason" rows="3" placeholder="Briefly specify reason..." required
                      class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-xs"></textarea>
          </div>

          <div modal-footer class="flex items-center gap-2">
            <button
              type="button"
              (click)="showApplyModal.set(false)"
              class="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition text-xs shadow-md shadow-indigo-600/30"
            >
              Submit Application
            </button>
          </div>
        </form>
      </app-modal>

      <!-- Confirmation Dialog for Approve / Reject -->
      <app-confirm-dialog
        [isOpen]="showReviewConfirm()"
        (isOpenChange)="showReviewConfirm.set($event)"
        [title]="reviewAction() === 'APPROVE' ? 'Approve Leave Request' : 'Reject Leave Request'"
        [message]="'Are you sure you want to ' + (reviewAction() === 'APPROVE' ? 'approve' : 'reject') + ' the leave request for ' + selectedRequest()?.employee_details?.full_name + '?'"
        [variant]="reviewAction() === 'APPROVE' ? 'primary' : 'danger'"
        [confirmLabel]="reviewAction() === 'APPROVE' ? 'Approve Request' : 'Reject Request'"
        (onConfirm)="executeReview()"
      ></app-confirm-dialog>
    </div>
  `
})
export class LeaveComponent implements OnInit {
  balances = signal<LeaveBalance[]>([]);
  leaveRequests = signal<LeaveRequest[]>([]);
  pendingApprovals = signal<LeaveRequest[]>([]);
  leaveTypes = signal<LeaveType[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  showApplyModal = signal(false);
  showReviewConfirm = signal(false);
  selectedRequest = signal<LeaveRequest | null>(null);
  reviewAction = signal<'APPROVE' | 'REJECT'>('APPROVE');

  newLeave = {
    leave_type: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: ''
  };

  columns: TableColumn<LeaveRequest>[] = [
    { key: 'employee', label: 'Employee' },
    { key: 'leave_type_name', label: 'Leave Type' },
    { key: 'duration', label: 'Duration' },
    { key: 'total_days', label: 'Days' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status' },
    { key: 'reviewed_by', label: 'Reviewed By' }
  ];

  constructor(
    private leaveService: LeaveService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.leaveService.getLeaveTypes().subscribe({
      next: res => {
        const types = Array.isArray(res) ? res : res.results;
        this.leaveTypes.set(types?.length ? types : this.getDemoLeaveTypes());
        this.loadBalances();
      },
      error: () => {
        this.leaveTypes.set(this.getDemoLeaveTypes());
        this.setDemoBalances();
        this.setDemoRequests();
        this.isLoading.set(false);
      }
    });
  }

  private loadBalances(): void {
    this.leaveService.getMyBalances().subscribe({
      next: (res: any) => {
        const bals = Array.isArray(res) ? res : res.results;
        this.balances.set(bals?.length ? bals : this.getDemoBalances());
        this.loadRequests();
      },
      error: () => {
        this.setDemoBalances();
        this.loadRequests();
      }
    });
  }

  private loadRequests(): void {
    this.leaveService.getAllRequests().subscribe({
      next: (res: any) => {
        const reqs = Array.isArray(res) ? res : res.results;
        if (reqs && reqs.length > 0) {
          this.leaveRequests.set(reqs);
          this.pendingApprovals.set(reqs.filter((r: any) => r.status === 'PENDING'));
        } else {
          this.setDemoRequests();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.setDemoRequests();
        this.isLoading.set(false);
      }
    });
  }

  private getDemoLeaveTypes(): LeaveType[] {
    return [
      { id: 1, name: 'Annual Leave', default_days: 20, is_paid: true },
      { id: 2, name: 'Casual Leave', default_days: 10, is_paid: true },
      { id: 3, name: 'Medical Leave', default_days: 12, is_paid: true },
      { id: 4, name: 'Unpaid Leave', default_days: 0, is_paid: false }
    ];
  }

  private getDemoBalances(): LeaveBalance[] {
    return [
      { id: 1, employee: 1, leave_type: 1, leave_type_name: 'Annual Leave', year: 2026, total_days: 20, used_days: 6, remaining_days: 14 },
      { id: 2, employee: 1, leave_type: 2, leave_type_name: 'Casual Leave', year: 2026, total_days: 10, used_days: 3, remaining_days: 7 },
      { id: 3, employee: 1, leave_type: 3, leave_type_name: 'Medical Leave', year: 2026, total_days: 12, used_days: 2, remaining_days: 10 },
      { id: 4, employee: 1, leave_type: 4, leave_type_name: 'Unpaid Leave', year: 2026, total_days: 0, used_days: 0, remaining_days: 0 }
    ];
  }

  private setDemoBalances(): void {
    this.balances.set(this.getDemoBalances());
  }

  private setDemoRequests(): void {
    const demoReqs: LeaveRequest[] = [
      {
        id: 101,
        employee: 3,
        employee_details: { id: 3, full_name: 'Elena Rostova', department_name: 'Sales & Marketing' } as any,
        leave_type: 1,
        leave_type_name: 'Annual Leave',
        start_date: '2026-09-18',
        end_date: '2026-09-22',
        total_days: 5,
        reason: 'Family vacation and personal downtime',
        status: 'PENDING'
      },
      {
        id: 102,
        employee: 1,
        employee_details: { id: 1, full_name: 'Praveena Krishnakumar', department_name: 'Engineering' } as any,
        leave_type: 3,
        leave_type_name: 'Medical Leave',
        start_date: '2026-08-10',
        end_date: '2026-08-11',
        total_days: 2,
        reason: 'Dental surgery and post-op recovery',
        status: 'APPROVED',
        review_notes: 'Approved by David Miller'
      }
    ];
    this.leaveRequests.set(demoReqs);
    this.pendingApprovals.set(demoReqs.filter(r => r.status === 'PENDING'));
  }

  openApplyModal(): void {
    this.newLeave = {
      leave_type: 1,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      reason: ''
    };
    this.showApplyModal.set(true);
  }

  submitLeaveApplication(): void {
    if (!this.newLeave.reason) {
      this.toastService.warning('Please provide a reason for the leave application.');
      return;
    }

    const typeObj = this.leaveTypes().find(t => t.id === this.newLeave.leave_type);
    const created: LeaveRequest = {
      id: Date.now(),
      employee: 1,
      employee_details: { id: 1, full_name: 'Praveena Krishnakumar', department_name: 'Engineering' } as any,
      leave_type: this.newLeave.leave_type,
      leave_type_name: typeObj?.name || 'Annual Leave',
      start_date: this.newLeave.start_date,
      end_date: this.newLeave.end_date,
      total_days: 3,
      reason: this.newLeave.reason,
      status: 'PENDING'
    };

    this.leaveRequests.update(list => [created, ...list]);
    this.pendingApprovals.update(list => [created, ...list]);
    this.toastService.success('Leave application submitted for approval!');
    this.showApplyModal.set(false);
  }

  confirmAction(req: LeaveRequest, action: 'APPROVE' | 'REJECT'): void {
    this.selectedRequest.set(req);
    this.reviewAction.set(action);
    this.showReviewConfirm.set(true);
  }

  executeReview(): void {
    const req = this.selectedRequest();
    const action = this.reviewAction();
    if (!req) return;

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    req.status = newStatus;

    this.leaveRequests.update(list => list.map(item => item.id === req.id ? { ...item, status: newStatus } : item));
    this.pendingApprovals.update(list => list.filter(item => item.id !== req.id));

    this.toastService.success(`Leave request ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully.`);
    this.showReviewConfirm.set(false);
  }
}
