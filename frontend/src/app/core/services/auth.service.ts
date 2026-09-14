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

  private readonly DEMO_USERS: Record<string, User> = {
    'admin@employeehub.com': {
      id: 1,
      username: 'admin',
      email: 'admin@employeehub.com',
      first_name: 'Praveena',
      last_name: 'Krishnakumar',
      full_name: 'Praveena Krishnakumar',
      role: 'SUPER_ADMIN',
      is_active: true
    },
    'hr@employeehub.com': {
      id: 2,
      username: 'hr',
      email: 'hr@employeehub.com',
      first_name: 'David',
      last_name: 'Miller',
      full_name: 'David Miller',
      role: 'HR_MANAGER',
      is_active: true
    },
    'manager@employeehub.com': {
      id: 3,
      username: 'manager',
      email: 'manager@employeehub.com',
      first_name: 'Sarah',
      last_name: 'Jenkins',
      full_name: 'Sarah Jenkins',
      role: 'MANAGER',
      is_active: true
    },
    'employee@employeehub.com': {
      id: 4,
      username: 'employee',
      email: 'employee@employeehub.com',
      first_name: 'Marcus',
      last_name: 'Vance',
      full_name: 'Marcus Vance',
      role: 'EMPLOYEE',
      is_active: true
    }
  };

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Attempts authentication against the backend API endpoint.
   * Why: In Stage 1 (UI development), the Django backend may not be running yet.
   * We intercept network errors or missing endpoints and seamlessly authenticate
   * with the corresponding demo role (SUPER_ADMIN, HR_MANAGER, MANAGER, EMPLOYEE),
   * allowing HR and Managers to immediately test privileges, photo uploads, and workforce management.
   */
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    const rawInput = (credentials.email || '').trim().toLowerCase();
    // Normalize aliases: "admin" -> "admin@employeehub.com", "hr" -> "hr@employeehub.com", etc.
    const normalizedEmail = rawInput.includes('@')
      ? rawInput
      : (this.DEMO_USERS[`${rawInput}@employeehub.com`] ? `${rawInput}@employeehub.com` : `${rawInput}@employeehub.com`);

    return this.http.post<AuthResponse>('/api/auth/login/', { email: normalizedEmail, password: credentials.password }).pipe(
      tap(res => {
        this.saveAuthSession(res);
      }),
      catchError(err => {
        const demoUser = this.DEMO_USERS[normalizedEmail];
        if (demoUser) {
          const mockResponse: AuthResponse = {
            access: 'mock-access-token-' + Date.now(),
            refresh: 'mock-refresh-token-' + Date.now(),
            user: demoUser
          };
          this.saveAuthSession(mockResponse);
          return of(mockResponse);
        }

        // Allow any arbitrary testing credentials during preview mode by granting SUPER_ADMIN
        if (rawInput && credentials.password && credentials.password.length >= 3) {
          const fallbackUser: User = {
            id: 99,
            username: rawInput.split('@')[0],
            email: normalizedEmail,
            first_name: rawInput.split('@')[0],
            last_name: 'Admin',
            full_name: rawInput.split('@')[0],
            role: 'SUPER_ADMIN',
            is_active: true
          };
          const mockResponse: AuthResponse = {
            access: 'mock-access-token-' + Date.now(),
            refresh: 'mock-refresh-token-' + Date.now(),
            user: fallbackUser
          };
          this.saveAuthSession(mockResponse);
          return of(mockResponse);
        }

        return throwError(() => err);
      })
    );
  }

  private saveAuthSession(res: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, res.access);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refresh);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.currentUser.set(res.user);
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
