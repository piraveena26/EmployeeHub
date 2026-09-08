import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/services/auth.service';
import { Employee } from '../../core/models';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Back button -->
      <div>
        <a routerLink="/employees" class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
          <span class="material-icons-outlined text-sm">arrow_back</span> Back to Directory
        </a>
      </div>

      @if (isLoading()) {
        <div class="py-20 text-center">
          <div class="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div class="mt-2 text-xs text-slate-500 font-medium">Loading employee profile...</div>
        </div>
      } @else if (employee(); as emp) {
        <!-- Profile Banner Card -->
        <div class="p-6 md:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div class="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <img [src]="emp.photo_display" class="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-100 shadow-md" alt="">
            <div>
              <div class="flex items-center justify-center md:justify-start gap-2">
                <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ emp.full_name }}</h1>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      [class.bg-emerald-50]="emp.employment_status === 'ACTIVE'"
                      [class.text-emerald-700]="emp.employment_status === 'ACTIVE'"
                      [class.bg-rose-50]="emp.employment_status === 'INACTIVE'"
                      [class.text-rose-700]="emp.employment_status === 'INACTIVE'">
                  {{ emp.employment_status }}
                </span>
              </div>
              <p class="text-sm text-indigo-600 font-semibold mt-0.5">{{ emp.designation_name || 'Staff' }}</p>
              <div class="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-500">
                <span class="flex items-center gap-1"><span class="material-icons-outlined text-sm">badge</span> {{ emp.employee_id }}</span>
                <span class="flex items-center gap-1"><span class="material-icons-outlined text-sm">apartment</span> {{ emp.department_name }}</span>
                <span class="flex items-center gap-1"><span class="material-icons-outlined text-sm">mail</span> {{ emp.email }}</span>
              </div>
            </div>
          </div>

          @if (authService.isHR()) {
            <button (click)="toggleStatus()"
                    class="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition">
              {{ emp.employment_status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account' }}
            </button>
          }
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Employment Information -->
          <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 class="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <span class="material-icons-outlined text-indigo-600 text-lg">work</span>
              Employment Information
            </h3>
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span class="text-slate-400 block mb-0.5">Department</span>
                <span class="font-semibold text-slate-800">{{ emp.department_details?.name || emp.department_name || '-' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block mb-0.5">Designation</span>
                <span class="font-semibold text-slate-800">{{ emp.designation_details?.name || emp.designation_name || '-' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block mb-0.5">Job Role</span>
                <span class="font-semibold text-slate-800">{{ emp.job_role_details?.name || emp.job_role_name || '-' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block mb-0.5">Assigned Shift</span>
                <span class="font-semibold text-slate-800">{{ emp.shift_details?.name || emp.shift_name || '-' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block mb-0.5">Employment Type</span>
                <span class="font-semibold text-slate-800">{{ emp.employment_type }}</span>
              </div>
              <div>
                <span class="text-slate-400 block mb-0.5">Joining Date</span>
                <span class="font-semibold text-slate-800">{{ emp.joining_date | date:'mediumDate' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block mb-0.5">Basic Monthly Salary</span>
                <span class="font-semibold text-emerald-600 font-mono text-sm">\${{ emp.basic_salary }}</span>
              </div>
            </div>
          </div>

          <!-- Personal Information & Emergency Contact -->
          <div class="space-y-6">
            <div class="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 class="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span class="material-icons-outlined text-indigo-600 text-lg">person</span>
                Personal Details
              </h3>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-slate-400 block mb-0.5">Phone Number</span>
                  <span class="font-semibold text-slate-800">{{ emp.phone || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block mb-0.5">Gender</span>
                  <span class="font-semibold text-slate-800">{{ emp.gender }}</span>
                </div>
                <div class="col-span-2">
                  <span class="text-slate-400 block mb-0.5">Residential Address</span>
                  <span class="font-semibold text-slate-800">{{ emp.address || 'Not specified' }}</span>
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
                  <span class="font-semibold text-slate-800">{{ emp.emergency_contact_name || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block mb-0.5">Phone</span>
                  <span class="font-semibold text-slate-800">{{ emp.emergency_contact_phone || '-' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block mb-0.5">Relationship</span>
                  <span class="font-semibold text-slate-800">{{ emp.emergency_contact_relation || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class EmployeeDetailComponent implements OnInit {
  employee = signal<Employee | null>(null);
  isLoading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.employeeService.getEmployee(+id).subscribe({
        next: emp => {
          this.employee.set(emp);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  toggleStatus(): void {
    const emp = this.employee();
    if (!emp) return;
    this.employeeService.toggleStatus(emp.id).subscribe({
      next: res => {
        emp.employment_status = res.employment_status as any;
        this.employee.set({ ...emp });
      }
    });
  }
}
