import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppNotification } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = '/api/notifications/';
  readonly unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<{ results: AppNotification[]; count: number } | AppNotification[]> {
    return this.http.get<{ results: AppNotification[]; count: number } | AppNotification[]>(this.baseUrl);
  }

  fetchUnreadCount(): Observable<{ unread_count: number }> {
    return this.http.get<{ unread_count: number }>(`${this.baseUrl}unread-count/`).pipe(
      tap(res => this.unreadCount.set(res.unread_count))
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.baseUrl}mark-all-as-read/`, {}).pipe(
      tap(() => this.unreadCount.set(0))
    );
  }

  markAsRead(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}${id}/mark-as-read/`, {}).pipe(
      tap(() => this.unreadCount.update(c => Math.max(0, c - 1)))
    );
  }
}
