import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/services/attendance.service';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceRecord, TodayAttendanceStatus } from '../../core/models';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance Management</h1>
          <p class="text-xs text-slate-500 mt-0.5">Track daily check-ins, working hours, shifts, and historical records</p>
        </div>
      </div>

      <!-- Clock In / Out Hero Console Card -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <span class="material-icons-outlined text-3xl">schedule</span>
          </div>
          <div>
            <div class="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Punch Terminal</div>
            <div class="text-3xl font-mono font-extrabold text-white mt-0.5">{{ currentTime() }}</div>
            <div class="text-xs text-slate-400 mt-1">{{ currentDate() }}</div>
          </div>
        </div>

        <!-- Terminal Status & Action Buttons -->
        <div class="flex flex-wrap items-center gap-3">
          @if (todayStatus(); as ts) {
            @if (!ts.is_checked_in) {
              <div class="flex items-center gap-2">
                <input type="text" [(ngModel)]="checkInNote" placeholder="Notes (optional)..."
                       class="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-slate-400 focus:outline-none">
                <button (click)="checkIn()"
                        class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition">
                  <span class="material-icons-outlined text-base">login</span> Check In
                </button>
              </div>
            } @else if (!ts.is_checked_out) {
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <div class="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Checked In: {{ ts.record?.check_in_time }}
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5">Shift In Progress</div>
                </div>
                <button (click)="checkOut()"
                        class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition">
                  <span class="material-icons-outlined text-base">logout</span> Check Out
                </button>
              </div>
            } @else {
              <div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-200 font-medium">
                <span class="material-icons-outlined text-emerald-400 text-base">task_alt</span>
                Today Completed &bull; Total: <span class="font-bold text-white font-mono">{{ ts.record?.working_hours }} hrs</span>
              </div>
            }
          }
        </div>
      </div>

      <!-- Attendance Records Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">Attendance Log History</h3>
          <span class="text-xs text-slate-400 font-medium">{{ records().length }} records loaded</span>
        </div>

        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-5 py-3.5 font-bold">Date</th>
              <th class="px-5 py-3.5 font-bold">Employee</th>
              <th class="px-5 py-3.5 font-bold">Check In</th>
              <th class="px-5 py-3.5 font-bold">Check Out</th>
              <th class="px-5 py-3.5 font-bold">Total Hours</th>
              <th class="px-5 py-3.5 font-bold">Status</th>
              <th class="px-5 py-3.5 font-bold">Flags</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (r of records(); track r.id) {
              <tr class="hover:bg-slate-50 transition">
                <td class="px-5 py-3.5 font-medium text-slate-900">{{ r.date | date:'EEE, MMM d, y' }}</td>
                <td class="px-5 py-3.5">
                  <div class="font-bold text-slate-800">{{ r.employee_details?.full_name || 'Staff' }}</div>
                  <div class="text-[11px] text-slate-400">{{ r.employee_details?.department_name || '-' }}</div>
                </td>
                <td class="px-5 py-3.5 font-mono text-slate-700">{{ r.check_in_time || '--:--' }}</td>
                <td class="px-5 py-3.5 font-mono text-slate-700">{{ r.check_out_time || '--:--' }}</td>
                <td class="px-5 py-3.5 font-mono font-bold text-indigo-600">{{ r.working_hours }} hrs</td>
                <td class="px-5 py-3.5">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        [class.bg-emerald-50]="r.status === 'PRESENT'" [class.text-emerald-700]="r.status === 'PRESENT'"
                        [class.bg-amber-50]="r.status === 'LATE'" [class.text-amber-700]="r.status === 'LATE'"
                        [class.bg-purple-50]="r.status === 'HALF_DAY'" [class.text-purple-700]="r.status === 'HALF_DAY'"
                        [class.bg-rose-50]="r.status === 'ABSENT'" [class.text-rose-700]="r.status === 'ABSENT'"
                        [class.bg-blue-50]="r.status === 'ON_LEAVE'" [class.text-blue-700]="r.status === 'ON_LEAVE'">
                    {{ r.status }}
                  </span>
                </td>
                <td class="px-5 py-3.5">
                  @if (r.is_late) {
                    <span class="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-semibold mr-1">Late Arrival</span>
                  }
                  @if (r.is_early_departure) {
                    <span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-semibold">Early Leave</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AttendanceComponent implements OnInit {
  currentTime = signal('');
  currentDate = signal('');
  todayStatus = signal<TodayAttendanceStatus | null>(null);
  records = signal<AttendanceRecord[]>([]);
  checkInNote = '';

  constructor(private attendanceService: AttendanceService, public authService: AuthService) {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  ngOnInit(): void {
    this.loadToday();
    this.loadRecords();
  }

  updateClock(): void {
    const d = new Date();
    this.currentTime.set(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    this.currentDate.set(d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }

  loadToday(): void {
    this.attendanceService.getTodayStatus().subscribe({
      next: res => this.todayStatus.set(res)
    });
  }

  loadRecords(): void {
    if (this.authService.isHR() || this.authService.isManager()) {
      this.attendanceService.getAllRecords().subscribe({
        next: res => this.records.set(res.results || [])
      });
    } else {
      this.attendanceService.getMyRecords().subscribe({
        next: res => {
          const list = Array.isArray(res) ? res : res.results;
          this.records.set(list || []);
        }
      });
    }
  }

  checkIn(): void {
    this.attendanceService.checkIn(this.checkInNote).subscribe({
      next: () => {
        this.checkInNote = '';
        this.loadToday();
        this.loadRecords();
      },
      error: err => alert(err.error?.detail || 'Check-in failed')
    });
  }

  checkOut(): void {
    this.attendanceService.checkOut().subscribe({
      next: () => {
        this.loadToday();
        this.loadRecords();
      },
      error: err => alert(err.error?.detail || 'Check-out failed')
    });
  }
}
