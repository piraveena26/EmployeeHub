import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { AuthResponse, User, UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'employeehub_access_token';
  private readonly REFRESH_TOKEN_KEY = 'employeehub_refresh_token';
  private readonly USER_KEY = 'employeehub_user';

  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role ?? null);

  readonly isSuperAdmin = computed(() => this.userRole() === 'SUPER_ADMIN');
  readonly isHR = computed(() => this.userRole() === 'SUPER_ADMIN' || this.userRole() === 'HR_MANAGER');
  readonly isManager = computed(() => this.userRole() === 'SUPER_ADMIN' || this.userRole() === 'HR_MANAGER' || this.userRole() === 'MANAGER');
  readonly isEmployeeOnly = computed(() => this.userRole() === 'EMPLOYEE');

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login/', credentials).pipe(
      tap(res => {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, res.access);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refresh);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this.currentUser.set(res.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }
    return this.http.post<{ access: string }>('/api/auth/refresh/', { refresh }).pipe(
      tap(res => {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, res.access);
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>('/api/auth/me/').pipe(
      tap(user => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
      })
    );
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
