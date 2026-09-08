import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimesheetService } from '../../core/services/timesheet.service';
import { AuthService } from '../../core/services/auth.service';
import { Timesheet, WorkAllocation } from '../../core/models';

@Component({
  selector: 'app-timesheets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Timesheet Management</h1>
          <p class="text-xs text-slate-500 mt-0.5">Log weekly task hours, track project allocations, and review submissions</p>
        </div>
        <button (click)="openCreateModal()"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition">
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
        <div class="p-6 rounded-2xl bg-amber-50/50 border border-amber-200 shadow-sm space-y-4">
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
                    <span class="font-bold text-slate-900 text-xs">{{ ts.employee_details?.full_name }}</span>
                    <span class="text-[11px] text-slate-400">Week of {{ ts.week_start_date }}</span>
                    <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">SUBMITTED</span>
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
                  <button (click)="approve(ts.id)"
                          class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1">
                    <span class="material-icons-outlined text-sm">check</span> Approve
                  </button>
                  <button (click)="reject(ts.id)"
                          class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1">
                    <span class="material-icons-outlined text-sm">close</span> Reject
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Timesheets History Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">Timesheets History</h3>
        </div>

        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-5 py-3.5 font-bold">Week Starting</th>
              <th class="px-5 py-3.5 font-bold">Employee</th>
              <th class="px-5 py-3.5 font-bold">Total Hours</th>
              <th class="px-5 py-3.5 font-bold">Entries</th>
              <th class="px-5 py-3.5 font-bold">Status</th>
              <th class="px-5 py-3.5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (ts of timesheets(); track ts.id) {
              <tr class="hover:bg-slate-50 transition">
                <td class="px-5 py-3.5 font-bold text-slate-900">{{ ts.week_start_date | date:'mediumDate' }}</td>
                <td class="px-5 py-3.5 font-medium text-slate-800">{{ ts.employee_details?.full_name || 'Staff' }}</td>
                <td class="px-5 py-3.5 font-mono font-bold text-indigo-600">{{ ts.total_hours }} hrs</td>
                <td class="px-5 py-3.5 text-slate-500">{{ ts.entries.length }} tasks logged</td>
                <td class="px-5 py-3.5">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        [class.bg-slate-100]="ts.status === 'DRAFT'" [class.text-slate-700]="ts.status === 'DRAFT'"
                        [class.bg-amber-50]="ts.status === 'SUBMITTED'" [class.text-amber-700]="ts.status === 'SUBMITTED'"
                        [class.bg-emerald-50]="ts.status === 'APPROVED'" [class.text-emerald-700]="ts.status === 'APPROVED'"
                        [class.bg-rose-50]="ts.status === 'REJECTED'" [class.text-rose-700]="ts.status === 'REJECTED'">
                    {{ ts.status }}
                  </span>
                </td>
                <td class="px-5 py-3.5 text-right">
                  @if (ts.status === 'DRAFT' || ts.status === 'REJECTED') {
                    <button (click)="submitTimesheet(ts.id)" class="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                      Submit For Review
                    </button>
                  } @else {
                    <span class="text-slate-400 font-medium">Locked</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Create Timesheet Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-sm font-bold text-slate-900">Create Weekly Timesheet</h3>
              <button (click)="showModal.set(false)" class="text-slate-400 material-icons-outlined text-sm">close</button>
            </div>

            <form (ngSubmit)="saveTimesheet()" class="space-y-4 mt-4 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Week Starting Monday *</label>
                <input type="date" [(ngModel)]="newTs.week_start_date" name="week_start_date" required
                       class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
              </div>

              <div class="border-t border-slate-100 pt-3">
                <div class="font-bold text-slate-800 mb-2">Initial Entry</div>
                <div class="space-y-2">
                  <input type="text" [(ngModel)]="newEntry.project_name" name="project_name" placeholder="Project Name (e.g. EmployeeHub)" required
                         class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                  <input type="text" [(ngModel)]="newEntry.task_description" name="task_description" placeholder="Task Description" required
                         class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                  <input type="number" [(ngModel)]="newEntry.hours" name="hours" placeholder="Hours (e.g. 8)" required
                         class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                </div>
              </div>

              <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" (click)="showModal.set(false)" class="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-semibold">Cancel</button>
                <button type="submit" class="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold">Save Timesheet</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class TimesheetsComponent implements OnInit {
  timesheets = signal<Timesheet[]>([]);
  pendingTimesheets = signal<Timesheet[]>([]);
  myTasks = signal<WorkAllocation[]>([]);
  showModal = signal(false);

  newTs = {
    week_start_date: new Date().toISOString().split('T')[0]
  };
  newEntry = {
    project_name: 'EmployeeHub',
    task_description: 'Feature development and testing',
    hours: 8
  };

  constructor(private timesheetService: TimesheetService, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.timesheetService.getMyTasks().subscribe({
      next: res => this.myTasks.set(res || [])
    });

    this.timesheetService.getMyTimesheets().subscribe({
      next: res => this.timesheets.set(Array.isArray(res) ? res : res.results || [])
    });

    if (this.authService.isHR() || this.authService.isManager()) {
      this.timesheetService.getAllTimesheets('SUBMITTED').subscribe({
        next: res => this.pendingTimesheets.set(res.results || [])
      });
    }
  }

  openCreateModal(): void {
    this.showModal.set(true);
  }

  saveTimesheet(): void {
    this.timesheetService.createTimesheet({
      week_start_date: this.newTs.week_start_date,
      entries: [{
        date: this.newTs.week_start_date,
        project_name: this.newEntry.project_name,
        task_description: this.newEntry.task_description,
        hours: +this.newEntry.hours
      }]
    }).subscribe({
      next: () => {
        this.showModal.set(false);
        this.loadAll();
      },
      error: err => alert(JSON.stringify(err.error || 'Failed to save timesheet.'))
    });
  }

  submitTimesheet(id: number): void {
    this.timesheetService.submitTimesheet(id).subscribe({
      next: () => this.loadAll()
    });
  }

  approve(id: number): void {
    this.timesheetService.approveTimesheet(id).subscribe({
      next: () => this.loadAll()
    });
  }

  reject(id: number): void {
    const comments = prompt('Rejection reason:');
    this.timesheetService.rejectTimesheet(id, comments || '').subscribe({
      next: () => this.loadAll()
    });
  }
}
