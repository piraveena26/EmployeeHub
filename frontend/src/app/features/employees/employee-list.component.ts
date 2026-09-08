import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/services/auth.service';
import { Employee, Department } from '../../core/models';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Employee Directory</h1>
          <p class="text-xs text-slate-500 mt-0.5">Manage workforce profiles, roles, departments, and status</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- View Toggle -->
          <div class="inline-flex rounded-xl bg-slate-200/80 p-1 border border-slate-300/60">
            <button (click)="viewMode.set('grid')" [class.bg-white]="viewMode() === 'grid'" [class.shadow-sm]="viewMode() === 'grid'"
                    class="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-700 flex items-center gap-1 transition">
              <span class="material-icons-outlined text-sm">grid_view</span> Grid
            </button>
            <button (click)="viewMode.set('table')" [class.bg-white]="viewMode() === 'table'" [class.shadow-sm]="viewMode() === 'table'"
                    class="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-700 flex items-center gap-1 transition">
              <span class="material-icons-outlined text-sm">table_rows</span> Table
            </button>
          </div>

          @if (authService.isHR()) {
            <button (click)="openAddModal()"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition">
              <span class="material-icons-outlined text-sm">person_add</span> Add Employee
            </button>
          }
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative w-full md:w-96">
          <span class="material-icons-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input type="text" [(ngModel)]="searchQuery" (input)="onSearchChange()"
                 placeholder="Search by name, employee ID, or email..."
                 class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
        </div>

        <!-- Filters -->
        <div class="flex items-center gap-3 w-full md:w-auto">
          <select [(ngModel)]="selectedDepartment" (change)="loadEmployees()"
                  class="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option [ngValue]="null">All Departments</option>
            @for (d of departments(); track d.id) {
              <option [ngValue]="d.id">{{ d.name }}</option>
            }
          </select>

          <select [(ngModel)]="selectedStatus" (change)="loadEmployees()"
                  class="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </div>
      </div>

      <!-- Content -->
      @if (isLoading()) {
        <div class="py-20 text-center">
          <div class="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div class="mt-2 text-xs text-slate-500 font-medium">Loading employees...</div>
        </div>
      } @else if (employees().length === 0) {
        <div class="p-12 text-center rounded-2xl bg-white border border-slate-200">
          <span class="material-icons-outlined text-4xl text-slate-300">person_off</span>
          <h3 class="text-sm font-bold text-slate-700 mt-2">No employees found</h3>
          <p class="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      } @else {

        <!-- GRID VIEW (Cards) -->
        @if (viewMode() === 'grid') {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            @for (emp of employees(); track emp.id) {
              <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
                <div>
                  <!-- Card Header: Photo + Status -->
                  <div class="flex items-start justify-between">
                    <div class="relative">
                      <img [src]="emp.photo_display" class="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm" alt="Photo">
                      <span class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                            [class.bg-emerald-500]="emp.employment_status === 'ACTIVE'"
                            [class.bg-amber-500]="emp.employment_status === 'ON_LEAVE'"
                            [class.bg-rose-500]="emp.employment_status === 'INACTIVE'"></span>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
                          [class.bg-emerald-50]="emp.employment_status === 'ACTIVE'"
                          [class.text-emerald-700]="emp.employment_status === 'ACTIVE'"
                          [class.bg-rose-50]="emp.employment_status === 'INACTIVE'"
                          [class.text-rose-700]="emp.employment_status === 'INACTIVE'"
                          [class.bg-amber-50]="emp.employment_status === 'ON_LEAVE'"
                          [class.text-amber-700]="emp.employment_status === 'ON_LEAVE'">
                      {{ emp.employment_status }}
                    </span>
                  </div>

                  <!-- Name and Details -->
                  <div class="mt-3">
                    <h3 class="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                      {{ emp.full_name }}
                    </h3>
                    <p class="text-xs text-indigo-600 font-medium truncate">{{ emp.designation_name || 'Staff' }}</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">{{ emp.department_name || 'General' }} &bull; {{ emp.employee_id }}</p>
                  </div>

                  <!-- Contact Details -->
                  <div class="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div class="flex items-center gap-2 truncate">
                      <span class="material-icons-outlined text-sm text-slate-400">mail</span>
                      <span class="truncate">{{ emp.email }}</span>
                    </div>
                    <div class="flex items-center gap-2 truncate">
                      <span class="material-icons-outlined text-sm text-slate-400">call</span>
                      <span>{{ emp.phone || 'N/A' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Footer Actions -->
                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a [routerLink]="['/employees', emp.id]" class="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
                    View Profile <span class="material-icons-outlined text-sm">chevron_right</span>
                  </a>

                  @if (authService.isHR()) {
                    <button (click)="toggleStatus(emp)"
                            title="Activate / Deactivate"
                            class="px-2 py-1 rounded-lg text-[11px] font-medium border border-slate-200 hover:bg-slate-100 transition">
                      {{ emp.employment_status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- TABLE VIEW -->
        @if (viewMode() === 'table') {
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th class="px-5 py-3.5 font-bold">Employee</th>
                  <th class="px-5 py-3.5 font-bold">Department</th>
                  <th class="px-5 py-3.5 font-bold">Designation</th>
                  <th class="px-5 py-3.5 font-bold">Shift</th>
                  <th class="px-5 py-3.5 font-bold">Status</th>
                  <th class="px-5 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (emp of employees(); track emp.id) {
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-3">
                        <img [src]="emp.photo_display" class="w-8 h-8 rounded-full object-cover border border-slate-200" alt="">
                        <div>
                          <div class="font-bold text-slate-900">{{ emp.full_name }}</div>
                          <div class="text-[11px] text-slate-400">{{ emp.employee_id }} &bull; {{ emp.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-5 py-3.5 font-medium text-slate-700">{{ emp.department_name || '-' }}</td>
                    <td class="px-5 py-3.5 text-indigo-600 font-medium">{{ emp.designation_name || '-' }}</td>
                    <td class="px-5 py-3.5 text-slate-500">{{ emp.shift_name || '-' }}</td>
                    <td class="px-5 py-3.5">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            [class.bg-emerald-50]="emp.employment_status === 'ACTIVE'"
                            [class.text-emerald-700]="emp.employment_status === 'ACTIVE'"
                            [class.bg-rose-50]="emp.employment_status === 'INACTIVE'"
                            [class.text-rose-700]="emp.employment_status === 'INACTIVE'">
                        {{ emp.employment_status }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 text-right space-x-2">
                      <a [routerLink]="['/employees', emp.id]" class="text-indigo-600 hover:text-indigo-800 font-semibold">
                        View
                      </a>
                      @if (authService.isHR()) {
                        <button (click)="toggleStatus(emp)" class="text-slate-400 hover:text-slate-600 font-medium">
                          {{ emp.employment_status === 'ACTIVE' ? 'Disable' : 'Enable' }}
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }

      <!-- Add Employee Modal Dialog -->
      @if (showAddModal()) {
        <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 class="text-base font-bold text-slate-900">Add New Employee</h3>
              <button (click)="showAddModal.set(false)" class="text-slate-400 hover:text-slate-600 material-icons-outlined text-lg">close</button>
            </div>

            <form (ngSubmit)="saveNewEmployee()" class="space-y-4 mt-4 text-xs">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input type="text" [(ngModel)]="newEmp.first_name" name="first_name" required
                         class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input type="text" [(ngModel)]="newEmp.last_name" name="last_name" required
                         class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Employee ID *</label>
                  <input type="text" [(ngModel)]="newEmp.employee_id" name="employee_id" placeholder="EMP-1009" required
                         class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Work Email *</label>
                  <input type="email" [(ngModel)]="newEmp.email" name="email" placeholder="name@company.com" required
                         class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input type="text" [(ngModel)]="newEmp.phone" name="phone" placeholder="+1 (555) 000-0000"
                         class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Department</label>
                  <select [(ngModel)]="newEmp.department" name="department"
                          class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option [ngValue]="null">Select Department</option>
                    @for (d of departments(); track d.id) {
                      <option [ngValue]="d.id">{{ d.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Basic Salary ($) *</label>
                  <input type="number" [(ngModel)]="newEmp.basic_salary" name="basic_salary" placeholder="7000" required
                         class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Joining Date *</label>
                  <input type="date" [(ngModel)]="newEmp.joining_date" name="joining_date" required
                         class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" (click)="showAddModal.set(false)"
                        class="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit"
                        class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition">
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class EmployeeListComponent implements OnInit {
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  isLoading = signal(true);
  viewMode = signal<'grid' | 'table'>('grid');
  showAddModal = signal(false);

  searchQuery = '';
  selectedDepartment: number | null = null;
  selectedStatus: string = '';

  newEmp: Partial<Employee> = {
    first_name: '',
    last_name: '',
    employee_id: '',
    email: '',
    phone: '',
    basic_salary: 6500,
    joining_date: new Date().toISOString().split('T')[0],
    gender: 'MALE',
    employment_type: 'FULL_TIME',
    employment_status: 'ACTIVE'
  };

  constructor(
    private employeeService: EmployeeService,
    private orgService: OrganizationService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments(): void {
    this.orgService.getDepartments().subscribe({
      next: res => {
        const list = Array.isArray(res) ? res : res.results;
        this.departments.set(list || []);
      }
    });
  }

  loadEmployees(): void {
    this.isLoading.set(true);
    this.employeeService.getEmployees({
      search: this.searchQuery || undefined,
      department: this.selectedDepartment || undefined,
      employment_status: this.selectedStatus || undefined
    }).subscribe({
      next: res => {
        this.employees.set(res.results || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearchChange(): void {
    this.loadEmployees();
  }

  toggleStatus(emp: Employee): void {
    this.employeeService.toggleStatus(emp.id).subscribe({
      next: res => {
        emp.employment_status = res.employment_status as any;
      }
    });
  }

  openAddModal(): void {
    this.showAddModal.set(true);
  }

  saveNewEmployee(): void {
    this.employeeService.createEmployee(this.newEmp).subscribe({
      next: () => {
        this.showAddModal.set(false);
        this.loadEmployees();
      },
      error: err => alert(JSON.stringify(err.error || 'Failed to create employee.'))
    });
  }
}
