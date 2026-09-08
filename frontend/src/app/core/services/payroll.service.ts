import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PayrollPeriod, Payslip, SalaryStructure } from '../models';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private readonly baseUrl = '/api/payroll/';

  constructor(private http: HttpClient) {}

  getPeriods(): Observable<{ results: PayrollPeriod[] } | PayrollPeriod[]> {
    return this.http.get<{ results: PayrollPeriod[] } | PayrollPeriod[]>(`${this.baseUrl}periods/`);
  }

  processPayroll(periodId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}periods/${periodId}/process-payroll/`, {});
  }

  getMyPayslips(): Observable<{ results: Payslip[]; count: number } | Payslip[]> {
    return this.http.get<{ results: Payslip[]; count: number } | Payslip[]>(`${this.baseUrl}payslips/my-payslips/`);
  }

  getAllPayslips(periodId?: number): Observable<{ results: Payslip[]; count: number }> {
    const query = periodId ? `?period=${periodId}` : '';
    return this.http.get<{ results: Payslip[]; count: number }>(`${this.baseUrl}payslips/${query}`);
  }

  downloadPayslipPdf(payslipId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}payslips/${payslipId}/download-pdf/`, { responseType: 'blob' });
  }
}
