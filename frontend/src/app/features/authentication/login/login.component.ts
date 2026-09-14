import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div>
      <div class="mb-6 text-center">
        <h3 class="text-xl font-bold text-slate-800">Sign In to your workspace</h3>
        <p class="text-xs text-slate-500 mt-1">Enter your organizational credentials to continue</p>
      </div>

      <!-- Quick Role Switcher for Seamless Testing -->
      <div class="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Quick Demo Logins</span>
          <span class="text-[10px] text-indigo-600 font-medium">1-Click Autofill</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" (click)="autofill('admin@employeehub.com', 'admin123')"
                  class="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition">
            <div class="text-xs font-bold text-slate-800">Super Admin</div>
            <div class="text-[10px] text-slate-400 truncate">admin@employeehub.com</div>
          </button>
          <button type="button" (click)="autofill('hr@employeehub.com', 'hr123')"
                  class="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition">
            <div class="text-xs font-bold text-slate-800">HR Manager</div>
            <div class="text-[10px] text-slate-400 truncate">hr@employeehub.com</div>
          </button>
          <button type="button" (click)="autofill('manager@employeehub.com', 'manager123')"
                  class="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition">
            <div class="text-xs font-bold text-slate-800">Team Manager</div>
            <div class="text-[10px] text-slate-400 truncate">manager@employeehub.com</div>
          </button>
          <button type="button" (click)="autofill('employee@employeehub.com', 'employee123')"
                  class="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition">
            <div class="text-xs font-bold text-slate-800">Software Engineer</div>
            <div class="text-[10px] text-slate-400 truncate">employee@employeehub.com</div>
          </button>
        </div>
      </div>

      @if (errorMessage()) {
        <div class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <span class="material-icons-outlined text-sm">error</span>
          <span>{{ errorMessage() }}</span>
        </div>
      }

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Work Email or Username</label>
          <div class="relative">
            <input type="text" formControlName="email" placeholder="name@company.com or username"
                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder:text-slate-400">
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-semibold text-slate-700">Password</label>
          </div>
          <input type="password" formControlName="password" placeholder="••••••••"
                 class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition placeholder:text-slate-400">
        </div>

        <button type="submit" [disabled]="loginForm.invalid || isLoading()"
                class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2">
          @if (isLoading()) {
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span>Authenticating...</span>
          } @else {
            <span>Sign In to EmployeeHub</span>
            <span class="material-icons-outlined text-sm">arrow_forward</span>
          }
        </button>
      </form>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@employeehub.com', [Validators.required]],
      password: ['admin123', [Validators.required, Validators.minLength(3)]]
    });
  }

  autofill(email: string, pass: string): void {
    this.loginForm.patchValue({ email, password: pass });
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: err => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.detail || 'Invalid email or password. Please try again.');
      }
    });
  }
}
