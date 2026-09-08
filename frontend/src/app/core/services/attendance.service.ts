import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttendanceRecord, TodayAttendanceStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly baseUrl = '/api/attendance/';

  constructor(private http: HttpClient) {}

  getTodayStatus(): Observable<TodayAttendanceStatus> {
    return this.http.get<TodayAttendanceStatus>(`${this.baseUrl}today-status/`);
  }

  checkIn(notes?: string): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.baseUrl}check-in/`, { notes: notes || '' });
  }

  checkOut(): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.baseUrl}check-out/`, {});
  }

  getMyRecords(page: number = 1): Observable<{ results: AttendanceRecord[]; count: number } | AttendanceRecord[]> {
    return this.http.get<{ results: AttendanceRecord[]; count: number } | AttendanceRecord[]>(`${this.baseUrl}my-records/?page=${page}`);
  }

  getAllRecords(params?: { date?: string; employee?: number; status?: string }): Observable<{ results: AttendanceRecord[]; count: number }> {
    let httpParams = new HttpParams();
    if (params?.date) httpParams = httpParams.set('date', params.date);
    if (params?.employee) httpParams = httpParams.set('employee', params.employee.toString());
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<{ results: AttendanceRecord[]; count: number }>(this.baseUrl, { params: httpParams });
  }
}
