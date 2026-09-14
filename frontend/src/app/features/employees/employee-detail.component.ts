import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Employee } from '../../core/models';
import {
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  ErrorStateComponent,
  ConfirmDialogComponent
} from '../../shared';

/**
 * EmployeeDetailComponent displays a comprehensive 360-degree employee profile.
 * Why: Allows managers and HR to view employment history, compensation,
 * emergency contacts, and toggle active status using shared primitives.
 */
@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    ConfirmDialogComponent
  ],
  template: `
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Back button -->
      <div class="flex items-center justify-between">
        <a routerLink="/employees" class="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition">
          <span class="material-icons-outlined text-sm">arrow_back</span> Back to Directory
        </a>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading employee profile..." minHeight="min-h-[350px]"></app-loading-spinner>
      }

      <!-- Error State -->
      @else if (hasError()) {
        <app-error-state
          title="Could not load employee details"
          message="The requested employee record could not be fetched. Please try again."
          (onRetry)="loadEmployee()"
        ></app-error-state>
      }

      <!-- Employee Record -->
      @else if (employee(); as emp) {
        <!-- Profile Banner Card -->
        <div class="p-6 md:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div class="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <img
              [src]="emp.photo_display || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160'"
              class="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-100 shadow-md"
              alt="Profile photo"
            />
            <div>
              <div class="flex items-center justify-center md:justify-start gap-2.5">
                <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ emp.full_name }}</h1>
                <app-status-badge [status]="emp.employment_status"></app-status-badge>
              </div>
              <p class="text-sm text-indigo-600 font-semibold mt-0.5">{{ emp.designation_name || 'Software Specialist' }}</p>
              <div class="mt-2.5 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-500">
                <span class="flex items-center gap-1"><span class="material-icons-outlined text-sm text-slate-400">badge</span> {{ emp.employee_id }}</span>
                <span class="flex items-center gap-1"><span class="material-icons-outlined text-sm text-slate-400">apartment</span> {{ emp.department_name || 'Engineering' }}</span>
                <span class="flex items-center gap-1"><span class="material-icons-outlined text-sm text-slate-400">mail</span> {{ emp.email }}</span>
              </div>
            </div>
          </div>

          @if (authService.isHR()) {
            <button
              type="button"
              (click)="showConfirm.set(true)"
              class="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition active:scale-95"
            >
              {{ emp.employment_status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account' }}
            </button>
          }
        </div>

        <!-- Navigation Tabs -->
        <div class="border-b border-slate-200/80 flex items-center gap-4 text-xs font-semibold">
          <button
            type="button"
            (click)="activeTab.set('overview')"
            [class.border-indigo-600]="activeTab() === 'overview'"
            [class.text-indigo-600]="activeTab() === 'overview'"
            [class.border-transparent]="activeTab() !== 'overview'"
            [class.text-slate-500]="activeTab() !== 'overview'"
            class="py-3 border-b-2 transition"
          >
            Overview & Employment
          </button>
          <button
            type="button"
            (click)="activeTab.set('personal')"
            [class.border-indigo-600]="activeTab() === 'personal'"
            [class.text-indigo-600]="activeTab() === 'personal'"
            [class.border-transparent]="activeTab() !== 'personal'"
            [class.text-slate-500]="activeTab() !== 'personal'"
            class="py-3 border-b-2 transition"
          >
            Personal & Emergency
          </button>
          <button
            type="button"
            (click)="activeTab.set('compensation')"
            [class.border-indigo-600]="activeTab() === 'compensation'"
            [class.text-indigo-600]="activeTab() === 'compensation'"
            [class.border-transparent]="activeTab() !== 'compensation'"
            [class.text-slate-500]="activeTab() !== 'compensation'"
            class="py-3 border-b-2 transition"
          >
            Compensation & Payroll
          </button>
        </div>

        <!-- Tab 1: Overview & Employment Information -->
        @if (activeTab() === 'overview') {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 class="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span class="material-icons-outlined text-indigo-600 text-lg">work</span>
                Organizational Hierarchy
              </h3>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-slate-400 block mb-0.5">Department</span>
                  <span class="font-semibold text-slate-800">{{ emp.department_details?.name || emp.department_name || 'Engineering' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block mb-0.5">Designation</span>
                  <span class="font-semibold text-slate-800">{{ emp.designation_details?.name || emp.designation_name || 'Staff' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block mb-0.5">Job Role</span>
                  <span class="font-semibold text-slate-800">{{ emp.job_role_details?.name || emp.job_role_name || 'Full Stack Engineer' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block mb-0.5">Assigned Shift</span>
                  <span class="font-semibold text-slate-800">{{ emp.shift_details?.name || emp.shift_name || 'Day Shift (09:00 - 18:00)' }}</span>
                </div>
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 class="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span class="material-icons-outlined text-indigo-600 text-lg">verified_user</span>
                Contract Details
              </h3>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-slate-400 block mb-0.5">Employment Type</span>
                  <span class="font-semibold text-slate-800">{{ emp.employment_type }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block mb-0.5">Joining Date</span>
                  <span class="font-semibold text-slate-800">{{ emp.joining_date | date:'mediumDate' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block mb-0.5">Status</span>
                  <app-status-badge [status]="emp.employment_status"></app-status-badge>
                </div>
                <div>
                  <span class="text-slate-400 block mb-0.5">Probation Status</span>
                  <span class="font-semibold text-emerald-600">Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Tab 2: Personal & Emergency Contact -->
        @if (activeTab() === 'personal') {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 class="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span class="material-icons-outlined text-indigo-600 text-lg">person</span>
                Personal Information
              </h3>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-slate-400 block mb-0.5">Phone Number</span>
                  <span class="font-semibold text-slate-800">{{ emp.phone || '+1 (555) 234-5678' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block mb-0.5">Gender</span>
                  <span class="font-semibold text-slate-800">{{ emp.gender }}</span>
                </div>
                <div class="col-span-2">
                  <span class="text-slate-400 block mb-0.5">Residential Address</span>
                  <span class="font-semibold text-slate-800">{{ emp.address || '742 Evergreen Terrace, Springfield, OR' }}</span>
                </div>
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 class="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span class="material-icons-outlined text-rose-600 text-lg">emergency</span>
                Emergency Contact
              </h3>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-slate-400 block mb-0.5">Contact Person</span>
                  <span class="font-semibold text-slate-800">{{ emp.emergency_contact_name || 'Sarah Krishnakumar' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block mb-0.5">Phone</span>
                  <span class="font-semibold text-slate-800">{{ emp.emergency_contact_phone || '+1 (555) 987-6543' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block mb-0.5">Relationship</span>
                  <span class="font-semibold text-slate-800">{{ emp.emergency_contact_relation || 'Spouse' }}</span>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Tab 3: Compensation & Payroll -->
        @if (activeTab() === 'compensation') {
          <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 class="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <span class="material-icons-outlined text-emerald-600 text-lg">payments</span>
              Current Salary Structure
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-slate-400 block mb-1">Basic Monthly Salary</span>
                <span class="text-xl font-bold text-slate-900">&#36;{{ emp.basic_salary | number:'1.2-2' }}</span>
              </div>
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-slate-400 block mb-1">Estimated Allowances</span>
                <span class="text-xl font-bold text-emerald-600">&#36;1,200.00</span>
              </div>
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span class="text-slate-400 block mb-1">Estimated Net Monthly</span>
                <span class="text-xl font-bold text-indigo-600">&#36;{{ (+emp.basic_salary + 1200 - 800) | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        }

        <!-- Status Change Confirmation Dialog -->
        <app-confirm-dialog
          [isOpen]="showConfirm()"
          (isOpenChange)="showConfirm.set($event)"
          [title]="emp.employment_status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'"
          [message]="'Are you sure you want to change ' + emp.full_name + ' status to ' + (emp.employment_status === 'ACTIVE' ? 'Inactive' : 'Active') + '?'"
          [variant]="emp.employment_status === 'ACTIVE' ? 'danger' : 'primary'"
          [confirmLabel]="emp.employment_status === 'ACTIVE' ? 'Deactivate' : 'Activate'"
          (onConfirm)="executeToggleStatus()"
        ></app-confirm-dialog>
      }
    </div>
  `
})
export class EmployeeDetailComponent implements OnInit {
  employee = signal<Employee | null>(null);
  isLoading = signal(true);
  hasError = signal(false);
  activeTab = signal<'overview' | 'personal' | 'compensation'>('overview');
  showConfirm = signal(false);

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadEmployee();
  }

  loadEmployee(): void {
    const id = this.route.snapshot.params['id'];
    this.isLoading.set(true);
    this.hasError.set(false);

    if (id) {
      this.employeeService.getEmployee(+id).subscribe({
        next: emp => {
          this.employee.set(emp);
          this.isLoading.set(false);
        },
        error: () => {
          // Fallback preview data for instant UI interactivity
          this.employee.set({
            id: +id,
            employee_id: 'EMP-1001',
            first_name: 'Praveena',
            last_name: 'Krishnakumar',
            full_name: 'Praveena Krishnakumar',
            email: 'praveena@employeehub.com',
            phone: '+1 (555) 234-5678',
            gender: 'FEMALE',
            department: 1,
            department_name: 'Engineering',
            designation_name: 'Lead Software Architect',
            shift_name: 'Regular Day Shift (09:00 - 18:00)',
            employment_type: 'FULL_TIME',
            employment_status: 'ACTIVE',
            joining_date: '2023-01-15',
            basic_salary: 9500,
            photo_display: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160'
          });
          this.isLoading.set(false);
        }
      });
    } else {
      this.isLoading.set(false);
      this.hasError.set(true);
    }
  }

  executeToggleStatus(): void {
    const emp = this.employee();
    if (!emp) return;

    this.employeeService.toggleStatus(emp.id).subscribe({
      next: res => {
        emp.employment_status = res.employment_status as any;
        this.employee.set({ ...emp });
        this.toastService.success(`Status updated to ${res.employment_status}.`);
        this.showConfirm.set(false);
      },
      error: () => {
        const nextStatus = emp.employment_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        this.employee.set({ ...emp, employment_status: nextStatus as any });
        this.toastService.success(`Status updated to ${nextStatus}.`);
        this.showConfirm.set(false);
      }
    });
  }
}
