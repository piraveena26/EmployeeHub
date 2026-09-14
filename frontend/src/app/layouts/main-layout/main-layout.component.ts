import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from '../../shared/components/toast.component';
import { AppNotification, TodayAttendanceStatus } from '../../core/models';

/**
 * MainLayoutComponent is the master application shell.
 * Why: Encapsulates responsive sidebar navigation, global top bar,
 * live attendance quick actions, toast system container, and user profile drawer.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent],
  template: `
    <!-- Global floating toasts container -->
    <app-toast></app-toast>

    <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <!-- Mobile Backdrop -->
      @if (isMobileMenuOpen()) {
        <div
          (click)="isMobileMenuOpen.set(false)"
          class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden"
        ></div>
      }

      <!-- Sidebar -->
      <aside
        [class.-translate-x-full]="!isMobileMenuOpen()"
        [class.translate-x-0]="isMobileMenuOpen()"
        class="fixed md:static inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-300 ease-in-out z-40 md:translate-x-0"
      >
        <!-- Logo Section -->
        <div class="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 text-base">
              EH
            </div>
            <div>
              <div class="text-base font-bold text-white tracking-wide leading-tight">
                Employee<span class="text-indigo-400">Hub</span>
              </div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Enterprise HRMS
              </div>
            </div>
          </div>
          <button
            type="button"
            (click)="isMobileMenuOpen.set(false)"
            class="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <span class="material-icons-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div class="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </div>

          <a routerLink="/dashboard" (click)="isMobileMenuOpen.set(false)"
             routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
            <span class="material-icons-outlined text-[20px]">dashboard</span>
            Dashboard
          </a>

          @if (authService.isHR() || authService.isManager()) {
            <a routerLink="/employees" (click)="isMobileMenuOpen.set(false)"
               routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
              <span class="material-icons-outlined text-[20px]">badge</span>
              Employees
            </a>
          }

          @if (authService.isHR()) {
            <a routerLink="/organization" (click)="isMobileMenuOpen.set(false)"
               routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
              <span class="material-icons-outlined text-[20px]">apartment</span>
              Organization
            </a>
          }

          <a routerLink="/attendance" (click)="isMobileMenuOpen.set(false)"
             routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
            <span class="material-icons-outlined text-[20px]">schedule</span>
            Attendance
          </a>

          <a routerLink="/leave" (click)="isMobileMenuOpen.set(false)"
             routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
            <span class="material-icons-outlined text-[20px]">event_note</span>
            Leave Management
          </a>

          <a routerLink="/timesheets" (click)="isMobileMenuOpen.set(false)"
             routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
            <span class="material-icons-outlined text-[20px]">access_time</span>
            Timesheets
          </a>

          <a routerLink="/payroll" (click)="isMobileMenuOpen.set(false)"
             routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
            <span class="material-icons-outlined text-[20px]">payments</span>
            Payroll & Payslips
          </a>



          @if (authService.isHR() || authService.isManager()) {
            <a routerLink="/reports" (click)="isMobileMenuOpen.set(false)"
               routerLinkActive="bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition">
              <span class="material-icons-outlined text-[20px]">bar_chart</span>
              Reports & Export
            </a>
          }
        </nav>

        <!-- Current User Footer Card in Sidebar -->
        <div class="p-3 border-t border-slate-800/80">
          <div class="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40">
            <img [src]="authService.currentUser()?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'"
                 class="w-9 h-9 rounded-full object-cover border border-indigo-400/40" alt="Avatar">
            <div class="flex-1 min-w-0">
              <div class="text-xs font-semibold text-white truncate">
                {{ authService.currentUser()?.full_name || authService.currentUser()?.username || 'User' }}
              </div>
              <div class="text-[10px] text-indigo-400 font-medium truncate">
                {{ authService.currentUser()?.role_display || authService.currentUser()?.role || 'Staff' }}
              </div>
            </div>
            <button (click)="authService.logout()" title="Logout"
                    class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition">
              <span class="material-icons-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Layout Body -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Navigation Header -->
        <header class="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 z-20 shadow-sm">
          <!-- Left: Mobile Menu Trigger + Live Clock -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="isMobileMenuOpen.set(true)"
              class="md:hidden p-2 text-slate-600 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition"
              aria-label="Open menu"
            >
              <span class="material-icons-outlined text-2xl">menu</span>
            </button>

            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-xl text-xs text-slate-600 font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live System &bull; {{ currentTime() }}
            </div>
          </div>

          <!-- Actions: Quick Clock-In/Out & Notifications & Profile -->
          <div class="flex items-center gap-3 sm:gap-4">
            <!-- Quick Clock In / Out Toggle Button -->
            @if (todayStatus()) {
              @if (!todayStatus()?.is_checked_in) {
                <button (click)="quickCheckIn()"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95">
                  <span class="material-icons-outlined text-[16px]">login</span>
                  Clock In
                </button>
              } @else if (!todayStatus()?.is_checked_out) {
                <button (click)="quickCheckOut()"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition active:scale-95">
                  <span class="material-icons-outlined text-[16px]">logout</span>
                  Clock Out ({{ todayStatus()?.record?.working_hours || 0 }}h)
                </button>
              } @else {
                <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
                  <span class="material-icons-outlined text-sm">check_circle</span>
                  Completed ({{ todayStatus()?.record?.working_hours }}h)
                </div>
              }
            }

            <!-- Notification Bell Icon -->
            <div class="relative">
              <button (click)="toggleNotifications()"
                      class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition relative"
                      aria-label="Notifications">
                <span class="material-icons-outlined text-[22px]">notifications</span>
                @if (notificationService.unreadCount() > 0) {
                  <span class="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {{ notificationService.unreadCount() }}
                  </span>
                }
              </button>

              <!-- Notifications Popover Menu -->
              @if (isNotificationOpen()) {
                <div class="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div class="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                    <span class="font-bold text-xs uppercase tracking-wider">System Notifications</span>
                    <button (click)="markAllNotificationsRead()" class="text-[11px] text-indigo-300 hover:text-white underline">
                      Mark all as read
                    </button>
                  </div>
                  <div class="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    @if (notificationsList().length === 0) {
                      <div class="p-8 text-center text-xs text-slate-400">
                        <span class="material-icons-outlined text-3xl text-slate-300 block mb-1">notifications_off</span>
                        No notifications to display.
                      </div>
                    } @else {
                      @for (n of notificationsList(); track n.id) {
                        <div class="p-3.5 hover:bg-slate-50 transition flex items-start gap-3" [class.bg-indigo-50/40]="!n.is_read">
                          <span class="material-icons-outlined text-indigo-600 text-[18px] shrink-0 mt-0.5">info</span>
                          <div class="flex-1 min-w-0">
                            <div class="text-xs font-semibold text-slate-800 leading-snug">{{ n.title }}</div>
                            <div class="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{{ n.message }}</div>
                            <div class="text-[10px] text-slate-400 mt-1">{{ n.created_at | date:'short' }}</div>
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Profile Info in Topbar -->
            <div class="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img [src]="authService.currentUser()?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'"
                   class="w-8 h-8 rounded-full object-cover border border-slate-200" alt="Avatar">
              <div class="hidden sm:block text-left">
                <div class="text-xs font-semibold text-slate-800 leading-none">
                  {{ authService.currentUser()?.first_name || authService.currentUser()?.username || 'Employee' }}
                </div>
                <div class="text-[10px] text-slate-400 font-medium mt-0.5">
                  {{ authService.currentUser()?.role || 'Staff' }}
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Dynamic Feature Content Outlet -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent implements OnInit {
  currentTime = signal<string>('');
  todayStatus = signal<TodayAttendanceStatus | null>(null);
  isNotificationOpen = signal<boolean>(false);
  isMobileMenuOpen = signal<boolean>(false);
  notificationsList = signal<AppNotification[]>([]);

  constructor(
    public authService: AuthService,
    private attendanceService: AttendanceService,
    public notificationService: NotificationService,
    private toastService: ToastService
  ) {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  ngOnInit(): void {
    this.refreshAttendance();
    this.refreshNotifications();
  }

  updateClock(): void {
    const d = new Date();
    this.currentTime.set(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }

  refreshAttendance(): void {
    this.attendanceService.getTodayStatus().subscribe({
      next: res => this.todayStatus.set(res),
      error: () => {}
    });
  }

  refreshNotifications(): void {
    this.notificationService.fetchUnreadCount().subscribe();
    this.notificationService.getNotifications().subscribe({
      next: res => {
        const list = Array.isArray(res) ? res : res.results;
        this.notificationsList.set(list || []);
      }
    });
  }

  quickCheckIn(): void {
    this.attendanceService.checkIn().subscribe({
      next: () => {
        this.toastService.success('Checked in successfully. Have a productive day!');
        this.refreshAttendance();
      },
      error: err => this.toastService.error(err.error?.detail || 'Check-in failed. Please try again.')
    });
  }

  quickCheckOut(): void {
    this.attendanceService.checkOut().subscribe({
      next: () => {
        this.toastService.success('Checked out successfully. See you tomorrow!');
        this.refreshAttendance();
      },
      error: err => this.toastService.error(err.error?.detail || 'Check-out failed. Please try again.')
    });
  }

  toggleNotifications(): void {
    this.isNotificationOpen.update(v => !v);
  }

  markAllNotificationsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.toastService.info('All notifications marked as read.');
        this.refreshNotifications();
        this.isNotificationOpen.set(false);
      }
    });
  }
}
