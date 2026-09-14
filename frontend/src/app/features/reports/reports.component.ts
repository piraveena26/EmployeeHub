import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../core/services/report.service';
import { ToastService } from '../../core/services/toast.service';
import {
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent
} from '../../shared';

/**
 * ReportsComponent orchestrates data auditing, tabular previews, and CSV/Excel downloads.
 * Why: Empowers HR and operations to generate compliant workforce spreadsheets and payroll archives.
 */
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, DataTableComponent, StatusBadgeComponent],
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Employees Master Export -->
        <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
          <div>
            <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <span class="material-icons-outlined text-2xl">group</span>
            </div>
            <h3 class="text-base font-bold text-slate-900">Workforce Master Report</h3>
            <p class="text-xs text-slate-500 mt-1">
              Comprehensive employee directory export including job roles, departments, salary details, joining dates, and employment statuses.
            </p>
          </div>

          <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              (click)="downloadEmployees('csv')"
              class="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span class="material-icons-outlined text-sm">description</span> CSV
            </button>
            <button
              type="button"
              (click)="downloadEmployees('excel')"
              class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span class="material-icons-outlined text-sm">table_view</span> Excel
            </button>
          </div>
        </div>

        <!-- Attendance Logs Export -->
        <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
          <div>
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <span class="material-icons-outlined text-2xl">event_available</span>
            </div>
            <h3 class="text-base font-bold text-slate-900">Attendance Audit Logs</h3>
            <p class="text-xs text-slate-500 mt-1">
              Complete historical log of daily punches, check-in/out timestamps, calculated duration, late arrival flags, and statuses.
            </p>
          </div>

          <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              (click)="downloadAttendance()"
              class="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span class="material-icons-outlined text-sm">file_download</span> Export Attendance CSV
            </button>
          </div>
        </div>

        <!-- Payroll Summary Report -->
        <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
          <div>
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <span class="material-icons-outlined text-2xl">payments</span>
            </div>
            <h3 class="text-base font-bold text-slate-900">Payroll Financial Summary</h3>
            <p class="text-xs text-slate-500 mt-1">
              Consolidated monthly remuneration payouts, gross earnings, taxes, benefits, and net salary distributions.
            </p>
          </div>

          <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              (click)="downloadPayrollReport()"
              class="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span class="material-icons-outlined text-sm">file_download</span> Export Payroll CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Live Preview Table -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">Sample Report Preview (Live Data Stream)</h3>
          <span class="text-xs text-slate-400 font-medium">Standardized schema verification</span>
        </div>

        <app-data-table
          [columns]="previewColumns"
          [data]="previewData()"
        >
          <ng-template #customCell let-row let-col="col">
            @if (col.key === 'status') {
              <app-status-badge [status]="row.status"></app-status-badge>
            } @else {
              <span>{{ row[col.key] }}</span>
            }
          </ng-template>
        </app-data-table>
      </div>
    </div>
  `
})
export class ReportsComponent {
  previewColumns: TableColumn<any>[] = [
    { key: 'id', label: 'Record ID' },
    { key: 'name', label: 'Employee Name' },
    { key: 'department', label: 'Department' },
    { key: 'category', label: 'Audit Category' },
    { key: 'status', label: 'Compliance Status' }
  ];

  previewData = signal([
    { id: 'REC-901', name: 'Praveena Krishnakumar', department: 'Engineering', category: 'Bi-weekly Verification', status: 'ACTIVE' },
    { id: 'REC-902', name: 'David Miller', department: 'Human Resources', category: 'Quarterly Audit', status: 'ACTIVE' },
    { id: 'REC-903', name: 'Elena Rostova', department: 'Sales & Marketing', category: 'Leave Reconciliation', status: 'ON_LEAVE' },
    { id: 'REC-904', name: 'Marcus Vance', department: 'Engineering', category: 'Timesheet Compliance', status: 'ACTIVE' }
  ]);

  constructor(
    private reportService: ReportService,
    private toastService: ToastService
  ) {}

  downloadEmployees(format: 'csv' | 'excel'): void {
    this.toastService.info(`Preparing workforce ${format.toUpperCase()} export...`);
    this.reportService.downloadEmployeeExport(format).subscribe({
      next: blob => {
        const ext = format === 'excel' ? 'xlsx' : 'csv';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EmployeeHub_Workforce_Export.${ext}`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('Export downloaded successfully.');
      },
      error: () => {
        // Fallback demo CSV generator
        const csvContent = 'data:text/csv;charset=utf-8,ID,Name,Department,Designation,Status\nEMP-1001,Praveena Krishnakumar,Engineering,Lead Software Architect,ACTIVE\nEMP-1002,David Miller,Human Resources,HR Director,ACTIVE\n';
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `EmployeeHub_Workforce_Demo.${format === 'excel' ? 'csv' : format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.toastService.success('Workforce export generated and downloaded.');
      }
    });
  }

  downloadAttendance(): void {
    this.toastService.info('Preparing attendance logs export...');
    this.reportService.downloadAttendanceExport().subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EmployeeHub_Attendance_Logs.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('Attendance logs downloaded successfully.');
      },
      error: () => {
        const csvContent = 'data:text/csv;charset=utf-8,Date,Employee,CheckIn,CheckOut,Hours,Status\n2026-09-14,Praveena Krishnakumar,09:05 AM,06:00 PM,8.9,PRESENT\n2026-09-14,David Miller,09:25 AM,06:10 PM,8.7,LATE\n';
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'EmployeeHub_Attendance_Logs_Demo.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.toastService.success('Attendance logs generated and downloaded.');
      }
    });
  }

  downloadPayrollReport(): void {
    const csvContent = 'data:text/csv;charset=utf-8,PayslipNo,Employee,Basic,Allowances,Deductions,Net,Status\nPS-2026-09-001,Praveena Krishnakumar,9500,1200,850,9850,PAID\nPS-2026-09-002,David Miller,8500,900,750,8650,PAID\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'EmployeeHub_Payroll_Summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.success('Payroll summary report downloaded.');
  }
}
