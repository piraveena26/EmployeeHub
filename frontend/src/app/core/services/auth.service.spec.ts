import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: any;

  beforeEach(() => {
    localStorage.clear();
    mockRouter = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with no authenticated user if localStorage is empty', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.isHR()).toBe(false);
  });

  it('should authenticate demo Super Admin on backend failure', () => {
    service.login({ email: 'admin@employeehub.com', password: 'password123' }).subscribe(res => {
      expect(res.user.role).toBe('SUPER_ADMIN');
      expect(service.isAuthenticated()).toBe(true);
      expect(service.isHR()).toBe(true);
      expect(service.isSuperAdmin()).toBe(true);
    });

    const req = httpMock.expectOne('/api/auth/login/');
    req.error(new ProgressEvent('error'));
  });

  it('should authenticate demo HR Manager with HR privileges', () => {
    service.login({ email: 'hr@employeehub.com', password: 'hr123' }).subscribe(res => {
      expect(res.user.role).toBe('HR_MANAGER');
      expect(service.isAuthenticated()).toBe(true);
      expect(service.isHR()).toBe(true);
      expect(service.isSuperAdmin()).toBe(false);
    });

    const req = httpMock.expectOne('/api/auth/login/');
    req.error(new ProgressEvent('error'));
  });

  it('should logout and clear authentication state', () => {
    service.login({ email: 'admin@employeehub.com', password: 'admin123' }).subscribe();
    const req = httpMock.expectOne('/api/auth/login/');
    req.error(new ProgressEvent('error'));

    expect(service.isAuthenticated()).toBe(true);
    service.logout();

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
