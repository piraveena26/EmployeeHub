import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Goal, PerformancePeriod, PerformanceReview } from '../models';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly baseUrl = '/api/performance/';

  constructor(private http: HttpClient) {}

  getPeriods(): Observable<{ results: PerformancePeriod[] } | PerformancePeriod[]> {
    return this.http.get<{ results: PerformancePeriod[] } | PerformancePeriod[]>(`${this.baseUrl}periods/`);
  }

  getMyGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.baseUrl}goals/my-goals/`);
  }

  getMyReviews(): Observable<PerformanceReview[]> {
    return this.http.get<PerformanceReview[]>(`${this.baseUrl}reviews/my-reviews/`);
  }

  getAllReviews(): Observable<{ results: PerformanceReview[]; count: number }> {
    return this.http.get<{ results: PerformanceReview[]; count: number }>(`${this.baseUrl}reviews/`);
  }

  submitSelfReview(id: number, data: { self_rating: number; employee_comments: string }): Observable<PerformanceReview> {
    return this.http.post<PerformanceReview>(`${this.baseUrl}reviews/${id}/submit-self-review/`, data);
  }

  completeManagerReview(id: number, data: { manager_rating: number; manager_comments: string; final_score: number; rating_grade: string }): Observable<PerformanceReview> {
    return this.http.post<PerformanceReview>(`${this.baseUrl}reviews/${id}/complete-manager-review/`, data);
  }
}
