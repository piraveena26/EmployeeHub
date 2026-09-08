import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../core/services/report.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Reports & Analytics Export</h1>
          <p class="text-xs text-slate-500 mt-0.5">Generate compliant organizational spreadsheets, audit reports, and logs</p>
        </div>
      </div>

      <!-- Export Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Employees Master Export -->
        <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <span class="material-icons-outlined text-2xl">group</span>
            </div>
            <h3 class="text-base font-bold text-slate-900">Workforce Master Report</h3>
            <p class="text-xs text-slate-500 mt-1">
              Comprehensive employee directory export including job roles, departments, salary details, joining dates, and employment statuses.
            </p>
          </div>

          <div class="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button (click)="downloadEmployees('csv')"
                    class="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition">
              <span class="material-icons-outlined text-sm">description</span> Export CSV
            </button>
            <button (click)="downloadEmployees('excel')"
                    class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-1.5 transition">
              <span class="material-icons-outlined text-sm">table_view</span> Export Excel (.xlsx)
            </button>
          </div>
        </div>

        <!-- Attendance Logs Export -->
        <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <span class="material-icons-outlined text-2xl">event_available</span>
            </div>
            <h3 class="text-base font-bold text-slate-900">Attendance Audit Logs</h3>
            <p class="text-xs text-slate-500 mt-1">
              Complete historical log of daily punches, check-in/out timestamps, calculated duration, late arrival flags, and statuses.
            </p>
          </div>

          <div class="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button (click)="downloadAttendance()"
                    class="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-1.5 transition">
              <span class="material-icons-outlined text-sm">file_download</span> Export Attendance CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent {
  constructor(private reportService: ReportService) {}

  downloadEmployees(format: 'csv' | 'excel'): void {
    this.reportService.downloadEmployeeExport(format).subscribe({
      next: blob => {
        const ext = format === 'excel' ? 'xlsx' : 'csv';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EmployeeHub_Workforce_Export.${ext}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  downloadAttendance(): void {
    this.reportService.downloadAttendanceExport().subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EmployeeHub_Attendance_Logs.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }
}
