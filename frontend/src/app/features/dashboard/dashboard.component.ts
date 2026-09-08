import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ReportService } from '../../core/services/report.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { PayrollService } from '../../core/services/payroll.service';
import { DashboardData } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">
            Welcome back, <span class="font-semibold text-slate-700">{{ authService.currentUser()?.full_name }}</span>! Here is what is happening today.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold uppercase tracking-wider">
            {{ authService.currentUser()?.role_display || authService.currentUser()?.role }}
          </span>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="py-20 text-center">
          <div class="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div class="mt-2 text-xs text-slate-500 font-medium">Loading dashboard analytics...</div>
        </div>
      } @else if (data()) {

        <!-- HR / ADMIN VIEW -->
        @if (authService.isHR() && data()?.metrics; as m) {
          <!-- Top KPI Stat Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Total Employees -->
            <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500">Total Workforce</span>
                <span class="p-2 rounded-xl bg-indigo-50 text-indigo-600 material-icons-outlined text-[20px]">people</span>
              </div>
              <div class="text-3xl font-extrabold text-slate-900 mt-2">{{ m.total_employees }}</div>
              <div class="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <span class="material-icons-outlined text-sm">check_circle</span>
                <span>{{ m.active_employees }} Active Employees</span>
              </div>
            </div>

            <!-- Present Today -->
            <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500">Present Today</span>
                <span class="p-2 rounded-xl bg-emerald-50 text-emerald-600 material-icons-outlined text-[20px]">how_to_reg</span>
              </div>
              <div class="text-3xl font-extrabold text-slate-900 mt-2">{{ m.present_today }}</div>
              <div class="mt-2 text-xs text-slate-500 font-medium">
                {{ m.active_employees ? ((m.present_today / m.active_employees) * 100 | number:'1.0-0') : 0 }}% Attendance Rate
              </div>
            </div>

            <!-- Absent Today -->
            <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500">Absent Today</span>
                <span class="p-2 rounded-xl bg-rose-50 text-rose-600 material-icons-outlined text-[20px]">person_off</span>
              </div>
              <div class="text-3xl font-extrabold text-slate-900 mt-2">{{ m.absent_today }}</div>
              <div class="mt-2 text-xs text-slate-500 font-medium">Unexcused or missing</div>
            </div>

            <!-- On Leave -->
            <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500">On Approved Leave</span>
                <span class="p-2 rounded-xl bg-amber-50 text-amber-600 material-icons-outlined text-[20px]">beach_access</span>
              </div>
              <div class="text-3xl font-extrabold text-slate-900 mt-2">{{ m.on_leave_today }}</div>
              <div class="mt-2 text-xs text-amber-600 font-medium">Authorized Absence</div>
            </div>
          </div>

          <!-- Secondary Action Badges / Pending Approvals -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a routerLink="/leave" class="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 flex items-center justify-between hover:opacity-95 transition">
              <div>
                <div class="text-xs font-semibold text-amber-100">Pending Leaves</div>
                <div class="text-2xl font-bold mt-1">{{ m.pending_leaves_count }} Requests</div>
              </div>
              <span class="material-icons-outlined text-3xl text-amber-200">pending_actions</span>
            </a>

            <a routerLink="/timesheets" class="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20 flex items-center justify-between hover:opacity-95 transition">
              <div>
                <div class="text-xs font-semibold text-indigo-200">Pending Timesheets</div>
                <div class="text-2xl font-bold mt-1">{{ m.pending_timesheets_count }} Submissions</div>
              </div>
              <span class="material-icons-outlined text-3xl text-indigo-300">fact_check</span>
            </a>

            <a routerLink="/payroll" class="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 flex items-center justify-between hover:opacity-95 transition">
              <div>
                <div class="text-xs font-semibold text-emerald-200">Current Payroll</div>
                <div class="text-2xl font-bold mt-1">&#36;{{ m.payroll_status.total_amount | number:'1.0-0' }}</div>
              </div>
              <span class="material-icons-outlined text-3xl text-emerald-300">payments</span>
            </a>
          </div>

          <!-- Visual Charts Grid: 7-Day Attendance Trend & Department Breakdown -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- 7-Day Attendance Trend -->
            <div class="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-base font-bold text-slate-900">Attendance Trend (Last 7 Days)</h3>
                  <p class="text-xs text-slate-500">Daily presence across active staff</p>
                </div>
                <span class="material-icons-outlined text-slate-400">bar_chart</span>
              </div>

              <!-- Bar Chart Representation -->
              <div class="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
                @for (day of m.attendance_trend; track day.day) {
                  <div class="flex-1 flex flex-col items-center gap-2 group">
                    <div class="w-full bg-slate-100 rounded-t-lg h-36 relative flex items-end overflow-hidden">
                      <div class="w-full bg-indigo-600 group-hover:bg-indigo-500 rounded-t-lg transition-all duration-300 relative"
                           [style.height.%]="day.total ? ((day.present / day.total) * 100) : 0">
                        <span class="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded shadow border border-slate-100 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                          {{ day.present }} / {{ day.total }}
                        </span>
                      </div>
                    </div>
                    <span class="text-[10px] font-medium text-slate-500 truncate">{{ day.day }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Department Distribution -->
            <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <h3 class="text-base font-bold text-slate-900 mb-1">Department Distribution</h3>
              <p class="text-xs text-slate-500 mb-4">Workforce allocation by domain</p>
              
              <div class="space-y-4">
                @for (d of m.department_distribution; track d.name) {
                  <div>
                    <div class="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>{{ d.name }}</span>
                      <span class="text-indigo-600">{{ d.count }} staff</span>
                    </div>
                    <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div class="h-full bg-indigo-600 rounded-full"
                           [style.width.%]="m.active_employees ? ((d.count / m.active_employees) * 100) : 0"></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- EMPLOYEE VIEW (Personal Profile, Clock In/Out widget, Balances) -->
        @if (data()?.employee_data; as emp) {
          <!-- Hero Card for Employee -->
          <div class="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div class="flex items-center gap-4 z-10">
              <img [src]="emp.photo" class="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-lg" alt="Profile">
              <div>
                <div class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Employee Portal &bull; {{ emp.employee_id }}</div>
                <h2 class="text-2xl font-extrabold text-white mt-0.5">{{ emp.full_name }}</h2>
                <p class="text-xs text-slate-300">{{ emp.designation }} &bull; {{ emp.department }}</p>
              </div>
            </div>

            <!-- Live Clock Widget -->
            <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col items-center text-center min-w-[200px] z-10">
              <span class="text-xs text-indigo-200">Today's Attendance</span>
              <div class="text-lg font-bold mt-1">
                @if (emp.today_checked_in && !emp.today_checked_out) {
                  <span class="text-emerald-400 flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Checked In ({{ emp.today_hours }} hrs)
                  </span>
                } @else if (emp.today_checked_out) {
                  <span class="text-indigo-300 flex items-center gap-1">
                    <span class="material-icons-outlined text-sm text-emerald-400">check_circle</span>
                    Done ({{ emp.today_hours }} hrs)
                  </span>
                } @else {
                  <span class="text-amber-300">Not Checked In</span>
                }
              </div>
              <div class="text-[11px] text-slate-300 mt-1">
                {{ emp.today_check_in_time ? ('In at: ' + emp.today_check_in_time) : 'Tap clock in at top' }}
              </div>
            </div>
          </div>

          <!-- Leave Balances & Quick Metrics -->
          <div>
            <h3 class="text-base font-bold text-slate-800 mb-3">Leave Balances (Current Year)</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              @for (lb of emp.leave_balances; track lb.type) {
                <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div class="text-xs font-semibold text-slate-500">{{ lb.type }}</div>
                  <div class="text-2xl font-extrabold text-indigo-600 mt-1">{{ lb.remaining }} <span class="text-xs font-normal text-slate-400">days left</span></div>
                  <div class="text-[11px] text-slate-400 mt-1">{{ lb.used }} days used of {{ lb.total }}</div>
                </div>
              }
            </div>
          </div>

          <!-- Quick Shortcuts for Employee -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span class="text-xs font-semibold text-slate-500">Active Goals</span>
                <div class="text-2xl font-bold text-slate-800 mt-1">{{ emp.active_goals_count }} Goals</div>
              </div>
              <a routerLink="/performance" class="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition">
                View KPIs
              </a>
            </div>

            <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span class="text-xs font-semibold text-slate-500">Pending Leaves</span>
                <div class="text-2xl font-bold text-slate-800 mt-1">{{ emp.pending_leaves_count }}</div>
              </div>
              <a routerLink="/leave" class="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-xl hover:bg-amber-100 transition">
                Apply Leave
              </a>
            </div>

            <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span class="text-xs font-semibold text-slate-500">Latest Net Salary</span>
                <div class="text-2xl font-bold text-emerald-600 mt-1">&#36;{{ emp.last_payslip_amount | number:'1.2-2' }}</div>
              </div>
              <a routerLink="/payroll" class="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition">
                Payslips
              </a>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  isLoading = signal(true);
  data = signal<DashboardData | null>(null);

  constructor(
    public authService: AuthService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.reportService.getDashboardMetrics().subscribe({
      next: res => {
        this.data.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
