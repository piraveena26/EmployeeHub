import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardData } from '../models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly baseUrl = '/api/reports/';

  constructor(private http: HttpClient) {}

  getDashboardMetrics(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.baseUrl}dashboard/`);
  }

  downloadEmployeeExport(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}export-employees/?format=${format}`, { responseType: 'blob' });
  }

  downloadAttendanceExport(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}export-attendance/`, { responseType: 'blob' });
  }
}
