import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService } from '../../core/services/payroll.service';
import { AuthService } from '../../core/services/auth.service';
import { PayrollPeriod, Payslip } from '../../core/models';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Payroll & Payslips</h1>
          <p class="text-xs text-slate-500 mt-0.5">Manage compensation structures, payroll cycles, and generate PDF payslips</p>
        </div>
      </div>

      <!-- HR Payroll Control Console -->
      @if (authService.isHR()) {
        <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Monthly Payroll Processing</h3>
              <p class="text-xs text-slate-500">Run automated salary, allowances, and deduction calculations for all active staff</p>
            </div>

            @if (periods().length > 0) {
              <button (click)="runPayroll(periods()[0].id)" [disabled]="isProcessing()"
                      class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-2">
                <span class="material-icons-outlined text-sm">play_arrow</span>
                {{ isProcessing() ? 'Processing...' : 'Run Payroll (' + periods()[0].month + '/' + periods()[0].year + ')' }}
              </button>
            }
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            @for (p of periods(); track p.id) {
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div class="text-xs font-bold text-slate-800">Period {{ p.month }}/{{ p.year }}</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">{{ p.total_payslips || 0 }} payslips generated</div>
                  <div class="text-xs font-extrabold text-emerald-600 mt-1">\${{ p.total_payroll_amount || 0 | number:'1.2-2' }}</div>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      [class.bg-emerald-100]="p.is_processed" [class.text-emerald-800]="p.is_processed"
                      [class.bg-slate-200]="!p.is_processed" [class.text-slate-700]="!p.is_processed">
                  {{ p.is_processed ? 'PROCESSED' : 'DRAFT' }}
                </span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Payslips Table -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">Payslip Records</h3>
          <span class="text-xs text-slate-400 font-medium">{{ payslips().length }} records</span>
        </div>

        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-5 py-3.5 font-bold">Payslip ID</th>
              <th class="px-5 py-3.5 font-bold">Employee</th>
              <th class="px-5 py-3.5 font-bold">Basic Pay</th>
              <th class="px-5 py-3.5 font-bold">Allowances</th>
              <th class="px-5 py-3.5 font-bold">Deductions</th>
              <th class="px-5 py-3.5 font-bold">Net Salary</th>
              <th class="px-5 py-3.5 font-bold">Status</th>
              <th class="px-5 py-3.5 font-bold text-right">PDF</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (ps of payslips(); track ps.id) {
              <tr class="hover:bg-slate-50 transition">
                <td class="px-5 py-3.5 font-mono text-slate-700 font-semibold">{{ ps.payslip_number }}</td>
                <td class="px-5 py-3.5">
                  <div class="font-bold text-slate-800">{{ ps.employee_details?.full_name || 'Staff' }}</div>
                  <div class="text-[11px] text-slate-400">{{ ps.employee_details?.department_name || '-' }}</div>
                </td>
                <td class="px-5 py-3.5 font-mono text-slate-600">\${{ ps.basic_salary | number:'1.2-2' }}</td>
                <td class="px-5 py-3.5 font-mono text-emerald-600">+\${{ ps.allowances | number:'1.2-2' }}</td>
                <td class="px-5 py-3.5 font-mono text-rose-500">-\${{ ps.deductions | number:'1.2-2' }}</td>
                <td class="px-5 py-3.5 font-mono font-extrabold text-indigo-600 text-sm">\${{ ps.net_salary | number:'1.2-2' }}</td>
                <td class="px-5 py-3.5">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    PAID
                  </span>
                </td>
                <td class="px-5 py-3.5 text-right">
                  <button (click)="downloadPdf(ps)"
                          class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition">
                    <span class="material-icons-outlined text-sm">download</span> Download PDF
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PayrollComponent implements OnInit {
  periods = signal<PayrollPeriod[]>([]);
  payslips = signal<Payslip[]>([]);
  isProcessing = signal(false);

  constructor(private payrollService: PayrollService, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    if (this.authService.isHR()) {
      this.payrollService.getPeriods().subscribe({
        next: res => this.periods.set(Array.isArray(res) ? res : res.results || [])
      });
      this.payrollService.getAllPayslips().subscribe({
        next: res => this.payslips.set(res.results || [])
      });
    } else {
      this.payrollService.getMyPayslips().subscribe({
        next: res => {
          const list = Array.isArray(res) ? res : res.results;
          this.payslips.set(list || []);
        }
      });
    }
  }

  runPayroll(periodId: number): void {
    this.isProcessing.set(true);
    this.payrollService.processPayroll(periodId).subscribe({
      next: res => {
        this.isProcessing.set(false);
        alert(res.detail || 'Payroll processed successfully.');
        this.loadAll();
      },
      error: () => this.isProcessing.set(false)
    });
  }

  downloadPdf(ps: Payslip): void {
    this.payrollService.downloadPayslipPdf(ps.id).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payslip_${ps.payslip_number}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Failed to download payslip PDF.')
    });
  }
}
