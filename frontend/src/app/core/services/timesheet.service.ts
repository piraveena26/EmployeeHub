import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Timesheet, WorkAllocation } from '../models';

@Injectable({ providedIn: 'root' })
export class TimesheetService {
  private readonly baseUrl = '/api/timesheets/';

  constructor(private http: HttpClient) {}

  getMyTimesheets(): Observable<{ results: Timesheet[]; count: number } | Timesheet[]> {
    return this.http.get<{ results: Timesheet[]; count: number } | Timesheet[]>(`${this.baseUrl}my-timesheets/`);
  }

  getAllTimesheets(status?: string): Observable<{ results: Timesheet[]; count: number }> {
    const query = status ? `?status=${status}` : '';
    return this.http.get<{ results: Timesheet[]; count: number }>(`${this.baseUrl}${query}`);
  }

  getMyTasks(): Observable<WorkAllocation[]> {
    return this.http.get<WorkAllocation[]>(`${this.baseUrl}allocations/my-tasks/`);
  }

  createTimesheet(data: Partial<Timesheet>): Observable<Timesheet> {
    return this.http.post<Timesheet>(this.baseUrl, data);
  }

  submitTimesheet(id: number): Observable<Timesheet> {
    return this.http.post<Timesheet>(`${this.baseUrl}${id}/submit/`, {});
  }

  approveTimesheet(id: number, comments?: string): Observable<Timesheet> {
    return this.http.post<Timesheet>(`${this.baseUrl}${id}/approve/`, { reviewer_comments: comments || '' });
  }

  rejectTimesheet(id: number, comments?: string): Observable<Timesheet> {
    return this.http.post<Timesheet>(`${this.baseUrl}${id}/reject/`, { reviewer_comments: comments || '' });
  }
}
