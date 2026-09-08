import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../core/services/leave.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaveBalance, LeaveRequest, LeaveType } from '../../core/models';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Leave Management</h1>
          <p class="text-xs text-slate-500 mt-0.5">Apply for time off, monitor quota balances, and review team requests</p>
        </div>
        <button (click)="openApplyModal()"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition">
          <span class="material-icons-outlined text-sm">add</span> Apply for Leave
        </button>
      </div>

      <!-- Leave Balances Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        @for (b of balances(); track b.id) {
          <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <div class="text-xs font-semibold text-slate-500">{{ b.leave_type_name }}</div>
            <div class="text-3xl font-extrabold text-indigo-600 mt-1">{{ b.remaining_days }}</div>
            <div class="text-[11px] text-slate-400 mt-1">{{ b.used_days }} days used of {{ b.total_days }} total</div>
          </div>
        }
      </div>

      <!-- HR / Manager Approval Queue -->
      @if ((authService.isHR() || authService.isManager()) && pendingApprovals().length > 0) {
        <div class="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/80 shadow-sm space-y-4">
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
                    <span class="font-bold text-slate-900 text-xs">{{ req.employee_details?.full_name }}</span>
                    <span class="text-[11px] text-slate-400">({{ req.employee_details?.department_name }})</span>
                    <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase">{{ req.leave_type_name }}</span>
                  </div>
                  <div class="text-xs text-slate-600 mt-1">
                    <span class="font-semibold">{{ req.start_date }}</span> to <span class="font-semibold">{{ req.end_date }}</span>
                    &bull; <span class="font-bold text-indigo-600">{{ req.total_days }} days</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1 italic">"{{ req.reason }}"</div>
                </div>

                <div class="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button (click)="approve(req.id)"
                          class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1">
                    <span class="material-icons-outlined text-sm">check</span> Approve
                  </button>
                  <button (click)="reject(req.id)"
                          class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1">
                    <span class="material-icons-outlined text-sm">close</span> Reject
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Leave Requests History Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">Leave Requests History</h3>
        </div>

        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-5 py-3.5 font-bold">Employee</th>
              <th class="px-5 py-3.5 font-bold">Leave Type</th>
              <th class="px-5 py-3.5 font-bold">Duration</th>
              <th class="px-5 py-3.5 font-bold">Days</th>
              <th class="px-5 py-3.5 font-bold">Reason</th>
              <th class="px-5 py-3.5 font-bold">Status</th>
              <th class="px-5 py-3.5 font-bold">Reviewed By</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (req of leaveRequests(); track req.id) {
              <tr class="hover:bg-slate-50 transition">
                <td class="px-5 py-3.5 font-bold text-slate-900">{{ req.employee_details?.full_name || 'Staff' }}</td>
                <td class="px-5 py-3.5 text-indigo-600 font-semibold">{{ req.leave_type_name }}</td>
                <td class="px-5 py-3.5 text-slate-700">{{ req.start_date }} &rarr; {{ req.end_date }}</td>
                <td class="px-5 py-3.5 font-bold text-slate-900">{{ req.total_days }}</td>
                <td class="px-5 py-3.5 text-slate-500 max-w-xs truncate">{{ req.reason }}</td>
                <td class="px-5 py-3.5">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        [class.bg-amber-50]="req.status === 'PENDING'" [class.text-amber-700]="req.status === 'PENDING'"
                        [class.bg-emerald-50]="req.status === 'APPROVED'" [class.text-emerald-700]="req.status === 'APPROVED'"
                        [class.bg-rose-50]="req.status === 'REJECTED'" [class.text-rose-700]="req.status === 'REJECTED'">
                    {{ req.status }}
                  </span>
                </td>
                <td class="px-5 py-3.5 text-slate-400">{{ req.reviewed_by_details?.full_name || '-' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Apply Leave Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-sm font-bold text-slate-900">Apply for Leave</h3>
              <button (click)="showModal.set(false)" class="text-slate-400 material-icons-outlined text-sm">close</button>
            </div>

            <form (ngSubmit)="submitLeave()" class="space-y-3 mt-4 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Leave Type *</label>
                <select [(ngModel)]="applyForm.leave_type" name="leave_type" required
                        class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500">
                  <option [ngValue]="null">Select Type</option>
                  @for (t of leaveTypes(); track t.id) {
                    <option [ngValue]="t.id">{{ t.name }} ({{ t.default_days }} days/yr)</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input type="date" [(ngModel)]="applyForm.start_date" (change)="calculateDays()" name="start_date" required
                         class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">End Date *</label>
                  <input type="date" [(ngModel)]="applyForm.end_date" (change)="calculateDays()" name="end_date" required
                         class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                </div>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Calculated Days</label>
                <input type="number" [(ngModel)]="applyForm.total_days" name="total_days" readonly
                       class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-indigo-600">
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Reason for Leave *</label>
                <textarea [(ngModel)]="applyForm.reason" name="reason" rows="3" placeholder="Provide context..." required
                          class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
              </div>

              <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" (click)="showModal.set(false)" class="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-semibold">Cancel</button>
                <button type="submit" class="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class LeaveComponent implements OnInit {
  balances = signal<LeaveBalance[]>([]);
  leaveRequests = signal<LeaveRequest[]>([]);
  pendingApprovals = signal<LeaveRequest[]>([]);
  leaveTypes = signal<LeaveType[]>([]);
  showModal = signal(false);

  applyForm = {
    leave_type: null as number | null,
    start_date: '',
    end_date: '',
    total_days: 1,
    reason: ''
  };

  constructor(private leaveService: LeaveService, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.leaveService.getMyBalances().subscribe({
      next: res => this.balances.set(res || [])
    });

    this.leaveService.getLeaveTypes().subscribe({
      next: res => this.leaveTypes.set(Array.isArray(res) ? res : res.results || [])
    });

    this.leaveService.getMyLeaves().subscribe({
      next: res => this.leaveRequests.set(Array.isArray(res) ? res : res.results || [])
    });

    if (this.authService.isHR() || this.authService.isManager()) {
      this.leaveService.getAllRequests({ status: 'PENDING' }).subscribe({
        next: res => this.pendingApprovals.set(res.results || [])
      });
    }
  }

  openApplyModal(): void {
    this.applyForm = {
      leave_type: this.leaveTypes()[0]?.id || null,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      total_days: 1,
      reason: ''
    };
    this.showModal.set(true);
  }

  calculateDays(): void {
    if (this.applyForm.start_date && this.applyForm.end_date) {
      const d1 = new Date(this.applyForm.start_date);
      const d2 = new Date(this.applyForm.end_date);
      const diff = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1);
      this.applyForm.total_days = diff;
    }
  }

  submitLeave(): void {
    if (!this.applyForm.leave_type) return;
    this.leaveService.applyLeave({
      leave_type: this.applyForm.leave_type,
      start_date: this.applyForm.start_date,
      end_date: this.applyForm.end_date,
      total_days: this.applyForm.total_days,
      reason: this.applyForm.reason
    }).subscribe({
      next: () => {
        this.showModal.set(false);
        this.loadAll();
      },
      error: err => alert(JSON.stringify(err.error || 'Failed to submit leave.'))
    });
  }

  approve(id: number): void {
    this.leaveService.approveLeave(id).subscribe({
      next: () => this.loadAll()
    });
  }

  reject(id: number): void {
    const reason = prompt('Rejection reason:');
    this.leaveService.rejectLeave(id, reason || '').subscribe({
      next: () => this.loadAll()
    });
  }
}
