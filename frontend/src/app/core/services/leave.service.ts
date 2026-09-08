import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveBalance, LeaveRequest, LeaveType } from '../models';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private readonly baseUrl = '/api/leaves/';

  constructor(private http: HttpClient) {}

  getLeaveTypes(): Observable<{ results: LeaveType[] } | LeaveType[]> {
    return this.http.get<{ results: LeaveType[] } | LeaveType[]>(`${this.baseUrl}types/`);
  }

  getMyBalances(): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(`${this.baseUrl}balances/my-balances/`);
  }

  getMyLeaves(): Observable<{ results: LeaveRequest[]; count: number } | LeaveRequest[]> {
    return this.http.get<{ results: LeaveRequest[]; count: number } | LeaveRequest[]>(`${this.baseUrl}requests/my-leaves/`);
  }

  getAllRequests(params?: { status?: string }): Observable<{ results: LeaveRequest[]; count: number }> {
    const query = params?.status ? `?status=${params.status}` : '';
    return this.http.get<{ results: LeaveRequest[]; count: number }>(`${this.baseUrl}requests/${query}`);
  }

  applyLeave(data: { leave_type: number; start_date: string; end_date: string; total_days: number; reason: string }): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.baseUrl}requests/`, data);
  }

  approveLeave(id: number, reviewNotes?: string): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.baseUrl}requests/${id}/approve/`, { review_notes: reviewNotes || '' });
  }

  rejectLeave(id: number, reviewNotes?: string): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.baseUrl}requests/${id}/reject/`, { review_notes: reviewNotes || '' });
  }
}
