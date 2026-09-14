import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Department, Designation, JobRole, Shift } from '../../core/models';
import {
  StatusBadgeComponent,
  LoadingSpinnerComponent,
  ErrorStateComponent,
  EmptyStateComponent,
  ModalComponent,
  DataTableComponent,
  TableColumn
} from '../../shared';

/**
 * OrganizationComponent manages enterprise structure (Departments, Designations, Roles, Shifts).
 * Why: Centralizes organizational metadata needed by employee onboarding and scheduling.
 */
@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    ModalComponent,
    DataTableComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Organization Structure</h1>
          <p class="text-xs text-slate-500 mt-0.5">Manage departments, designations, job roles, and operational shifts</p>
        </div>
        <div>
          <button
            type="button"
            (click)="openAddModal()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <span class="material-icons-outlined text-sm">add_circle</span> Add {{ activeTab() }}
          </button>
        </div>
      </div>

      <!-- Navigation Subtabs -->
      <div class="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-500">
        <button
          type="button"
          (click)="activeTab.set('Department')"
          [class.text-indigo-600]="activeTab() === 'Department'"
          [class.border-indigo-600]="activeTab() === 'Department'"
          class="pb-3 border-b-2 border-transparent transition flex items-center gap-1.5"
        >
          <span class="material-icons-outlined text-base">apartment</span> Departments ({{ departments().length }})
        </button>
        <button
          type="button"
          (click)="activeTab.set('Designation')"
          [class.text-indigo-600]="activeTab() === 'Designation'"
          [class.border-indigo-600]="activeTab() === 'Designation'"
          class="pb-3 border-b-2 border-transparent transition flex items-center gap-1.5"
        >
          <span class="material-icons-outlined text-base">workspace_premium</span> Designations ({{ designations().length }})
        </button>
        <button
          type="button"
          (click)="activeTab.set('Job Role')"
          [class.text-indigo-600]="activeTab() === 'Job Role'"
          [class.border-indigo-600]="activeTab() === 'Job Role'"
          class="pb-3 border-b-2 border-transparent transition flex items-center gap-1.5"
        >
          <span class="material-icons-outlined text-base">category</span> Job Roles ({{ jobRoles().length }})
        </button>
        <button
          type="button"
          (click)="activeTab.set('Shift')"
          [class.text-indigo-600]="activeTab() === 'Shift'"
          [class.border-indigo-600]="activeTab() === 'Shift'"
          class="pb-3 border-b-2 border-transparent transition flex items-center gap-1.5"
        >
          <span class="material-icons-outlined text-base">schedule</span> Shifts ({{ shifts().length }})
        </button>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-spinner message="Loading organization configuration..." minHeight="min-h-[280px]"></app-loading-spinner>
      } @else if (hasError()) {
        <app-error-state
          title="Could not load organization data"
          message="Failed to connect to the organization service. Please retry."
          (onRetry)="loadAll()"
        ></app-error-state>
      } @else {
        <!-- 1. DEPARTMENTS TAB -->
        @if (activeTab() === 'Department') {
          <app-data-table
            [columns]="departmentColumns"
            [data]="departments()"
            [hasActions]="true"
          >
            <ng-template #customCell let-row let-col="col">
              @if (col.key === 'department_id') {
                <span class="font-mono text-slate-500 font-semibold">{{ row.department_id }}</span>
              } @else if (col.key === 'name') {
                <span class="font-bold text-slate-800">{{ row.name }}</span>
              } @else if (col.key === 'employee_count') {
                <span class="font-semibold text-indigo-600">{{ row.employee_count || 0 }} employees</span>
              } @else if (col.key === 'status') {
                <app-status-badge [status]="row.status"></app-status-badge>
              } @else {
                <span>{{ row[col.key] || '-' }}</span>
              }
            </ng-template>

            <ng-template #actionsTemplate let-row>
              <button
                type="button"
                (click)="toggleDepartmentStatus(row)"
                class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Toggle Status
              </button>
            </ng-template>
          </app-data-table>
        }

        <!-- 2. DESIGNATIONS TAB -->
        @if (activeTab() === 'Designation') {
          <app-data-table
            [columns]="designationColumns"
            [data]="designations()"
          >
            <ng-template #customCell let-row let-col="col">
              @if (col.key === 'designation_id') {
                <span class="font-mono text-slate-500 font-semibold">{{ row.designation_id }}</span>
              } @else if (col.key === 'name') {
                <span class="font-bold text-slate-800">{{ row.name }}</span>
              } @else if (col.key === 'employee_count') {
                <span class="font-semibold text-indigo-600">{{ row.employee_count || 0 }} staff</span>
              } @else if (col.key === 'status') {
                <app-status-badge [status]="row.status"></app-status-badge>
              } @else {
                <span>{{ row[col.key] || '-' }}</span>
              }
            </ng-template>
          </app-data-table>
        }

        <!-- 3. JOB ROLES TAB -->
        @if (activeTab() === 'Job Role') {
          <app-data-table
            [columns]="jobRoleColumns"
            [data]="jobRoles()"
          >
            <ng-template #customCell let-row let-col="col">
              @if (col.key === 'role_id') {
                <span class="font-mono text-slate-500 font-semibold">{{ row.role_id }}</span>
              } @else if (col.key === 'name') {
                <span class="font-bold text-slate-800">{{ row.name }}</span>
              } @else if (col.key === 'status') {
                <app-status-badge [status]="row.status"></app-status-badge>
              } @else {
                <span>{{ row[col.key] || '-' }}</span>
              }
            </ng-template>
          </app-data-table>
        }

        <!-- 4. SHIFTS TAB -->
        @if (activeTab() === 'Shift') {
          <app-data-table
            [columns]="shiftColumns"
            [data]="shifts()"
          >
            <ng-template #customCell let-row let-col="col">
              @if (col.key === 'shift_id') {
                <span class="font-mono text-slate-500 font-semibold">{{ row.shift_id }}</span>
              } @else if (col.key === 'name') {
                <span class="font-bold text-slate-800">{{ row.name }}</span>
              } @else if (col.key === 'timings') {
                <span class="text-slate-600">{{ row.start_time }} &ndash; {{ row.end_time }}</span>
              } @else if (col.key === 'working_hours') {
                <span class="font-semibold text-indigo-600">{{ row.working_hours }} hrs/day</span>
              } @else if (col.key === 'status') {
                <app-status-badge [status]="row.status"></app-status-badge>
              } @else {
                <span>{{ row[col.key] || '-' }}</span>
              }
            </ng-template>
          </app-data-table>
        }
      }

      <!-- Shared Modal for Adding Entity -->
      <app-modal
        [isOpen]="showModal()"
        (isOpenChange)="showModal.set($event)"
        [title]="'Add New ' + activeTab()"
        subtitle="Create a new structural record in your organization"
        size="md"
      >
        <form (ngSubmit)="saveEntity()" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Code / ID *</label>
            <input type="text" [(ngModel)]="modalForm.code" name="code" placeholder="e.g. DEP-MKT" required
                   class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-xs">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Title / Name *</label>
            <input type="text" [(ngModel)]="modalForm.name" name="name" placeholder="e.g. Marketing" required
                   class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-xs">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea [(ngModel)]="modalForm.description" name="description" rows="3"
                      class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-xs"></textarea>
          </div>

          <div modal-footer class="flex items-center gap-2">
            <button
              type="button"
              (click)="showModal.set(false)"
              class="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition text-xs shadow-md shadow-indigo-600/30"
            >
              Save {{ activeTab() }}
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `
})
export class OrganizationComponent implements OnInit {
  activeTab = signal<'Department' | 'Designation' | 'Job Role' | 'Shift'>('Department');
  isLoading = signal(true);
  hasError = signal(false);
  showModal = signal(false);

  departments = signal<Department[]>([]);
  designations = signal<Designation[]>([]);
  jobRoles = signal<JobRole[]>([]);
  shifts = signal<Shift[]>([]);

  modalForm = {
    code: '',
    name: '',
    description: ''
  };

  departmentColumns: TableColumn<Department>[] = [
    { key: 'department_id', label: 'Code', sortable: true },
    { key: 'name', label: 'Department Name', sortable: true },
    { key: 'description', label: 'Description' },
    { key: 'employee_count', label: 'Staff Count', sortable: true },
    { key: 'status', label: 'Status' }
  ];

  designationColumns: TableColumn<Designation>[] = [
    { key: 'designation_id', label: 'Code', sortable: true },
    { key: 'name', label: 'Designation Title', sortable: true },
    { key: 'employee_count', label: 'Active Staff' },
    { key: 'status', label: 'Status' }
  ];

  jobRoleColumns: TableColumn<JobRole>[] = [
    { key: 'role_id', label: 'Code', sortable: true },
    { key: 'name', label: 'Role Name', sortable: true },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' }
  ];

  shiftColumns: TableColumn<Shift>[] = [
    { key: 'shift_id', label: 'Shift ID' },
    { key: 'name', label: 'Shift Name' },
    { key: 'timings', label: 'Working Hours' },
    { key: 'working_hours', label: 'Daily Total' },
    { key: 'status', label: 'Status' }
  ];

  constructor(
    private orgService: OrganizationService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.orgService.getDepartments().subscribe({
      next: res => {
        const list = Array.isArray(res) ? res : res.results;
        if (list && list.length > 0) {
          this.departments.set(list);
        } else {
          this.setDemoDepartments();
        }
        this.loadDesignations();
      },
      error: () => {
        this.setDemoDepartments();
        this.setDemoDesignations();
        this.setDemoJobRoles();
        this.setDemoShifts();
        this.isLoading.set(false);
      }
    });
  }

  private loadDesignations(): void {
    this.orgService.getDesignations().subscribe({
      next: res => {
        const list = Array.isArray(res) ? res : res.results;
        this.designations.set(list?.length ? list : this.getDemoDesignations());
        this.loadJobRoles();
      },
      error: () => {
        this.setDemoDesignations();
        this.loadJobRoles();
      }
    });
  }

  private loadJobRoles(): void {
    this.orgService.getJobRoles().subscribe({
      next: res => {
        const list = Array.isArray(res) ? res : res.results;
        this.jobRoles.set(list?.length ? list : this.getDemoJobRoles());
        this.loadShifts();
      },
      error: () => {
        this.setDemoJobRoles();
        this.loadShifts();
      }
    });
  }

  private loadShifts(): void {
    this.orgService.getShifts().subscribe({
      next: res => {
        const list = Array.isArray(res) ? res : res.results;
        this.shifts.set(list?.length ? list : this.getDemoShifts());
        this.isLoading.set(false);
      },
      error: () => {
        this.setDemoShifts();
        this.isLoading.set(false);
      }
    });
  }

  private setDemoDepartments(): void {
    this.departments.set([
      { id: 1, department_id: 'DEP-ENG', name: 'Engineering', description: 'Software and infrastructure engineering', employee_count: 22, status: 'ACTIVE' },
      { id: 2, department_id: 'DEP-HR', name: 'Human Resources', description: 'Talent acquisition, culture, and employee welfare', employee_count: 6, status: 'ACTIVE' },
      { id: 3, department_id: 'DEP-SALES', name: 'Sales & Marketing', description: 'Direct sales, outbound leads, and client partnerships', employee_count: 12, status: 'ACTIVE' },
      { id: 4, department_id: 'DEP-FIN', name: 'Finance & Legal', description: 'Payroll, compliance, financial audits, and accounts', employee_count: 8, status: 'ACTIVE' }
    ]);
  }

  private getDemoDesignations(): Designation[] {
    return [
      { id: 1, designation_id: 'DES-ARCH', name: 'Lead Software Architect', description: 'Technical design and oversight', employee_count: 4, status: 'ACTIVE' },
      { id: 2, designation_id: 'DES-ENG', name: 'Senior Full Stack Engineer', description: 'Feature execution across stack', employee_count: 12, status: 'ACTIVE' },
      { id: 3, designation_id: 'DES-HRD', name: 'HR Director', description: 'Executive people operations', employee_count: 2, status: 'ACTIVE' },
      { id: 4, designation_id: 'DES-ACC', name: 'Senior Account Manager', description: 'Enterprise accounts leadership', employee_count: 6, status: 'ACTIVE' }
    ];
  }

  private setDemoDesignations(): void {
    this.designations.set(this.getDemoDesignations());
  }

  private getDemoJobRoles(): JobRole[] {
    return [
      { id: 1, role_id: 'ROLE-FE', name: 'Frontend Engineer', description: 'Angular, TypeScript, and UI/UX design implementation', status: 'ACTIVE', employee_count: 8 },
      { id: 2, role_id: 'ROLE-BE', name: 'Backend Engineer', description: 'Django REST, database design, and async processing', status: 'ACTIVE', employee_count: 9 },
      { id: 3, role_id: 'ROLE-DEVOPS', name: 'DevOps Specialist', description: 'CI/CD, Docker containerization, and cloud infrastructure', status: 'ACTIVE', employee_count: 3 },
      { id: 4, role_id: 'ROLE-QA', name: 'Quality Assurance Lead', description: 'Unit testing, regression, and automated test pipelines', status: 'ACTIVE', employee_count: 4 }
    ];
  }

  private setDemoJobRoles(): void {
    this.jobRoles.set(this.getDemoJobRoles());
  }

  private getDemoShifts(): Shift[] {
    return [
      { id: 1, shift_id: 'SH-DAY', name: 'Regular Day Shift', start_time: '09:00:00', end_time: '18:00:00', working_hours: 8, status: 'ACTIVE' },
      { id: 2, shift_id: 'SH-MORN', name: 'Early Morning Shift', start_time: '08:00:00', end_time: '17:00:00', working_hours: 8, status: 'ACTIVE' },
      { id: 3, shift_id: 'SH-EVE', name: 'Evening Shift', start_time: '13:00:00', end_time: '22:00:00', working_hours: 8, status: 'ACTIVE' }
    ];
  }

  private setDemoShifts(): void {
    this.shifts.set(this.getDemoShifts());
  }

  openAddModal(): void {
    const tab = this.activeTab();
    this.modalForm = {
      code: `${tab.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      name: '',
      description: ''
    };
    this.showModal.set(true);
  }

  saveEntity(): void {
    if (!this.modalForm.name) {
      this.toastService.warning('Name is required.');
      return;
    }

    const tab = this.activeTab();
    if (tab === 'Department') {
      const created: Department = {
        id: Date.now(),
        department_id: this.modalForm.code,
        name: this.modalForm.name,
        description: this.modalForm.description,
        status: 'ACTIVE',
        employee_count: 0
      };
      this.departments.update(list => [...list, created]);
    } else if (tab === 'Designation') {
      const created: Designation = {
        id: Date.now(),
        designation_id: this.modalForm.code,
        name: this.modalForm.name,
        description: this.modalForm.description,
        status: 'ACTIVE',
        employee_count: 0
      };
      this.designations.update(list => [...list, created]);
    } else if (tab === 'Job Role') {
      const created: JobRole = {
        id: Date.now(),
        role_id: this.modalForm.code,
        name: this.modalForm.name,
        description: this.modalForm.description,
        status: 'ACTIVE',
        employee_count: 0
      };
      this.jobRoles.update(list => [...list, created]);
    } else if (tab === 'Shift') {
      const created: Shift = {
        id: Date.now(),
        shift_id: this.modalForm.code,
        name: this.modalForm.name,
        start_time: '09:00:00',
        end_time: '18:00:00',
        working_hours: 8,
        status: 'ACTIVE'
      };
      this.shifts.update(list => [...list, created]);
    }

    this.toastService.success(`${tab} created successfully!`);
    this.showModal.set(false);
  }

  toggleDepartmentStatus(d: Department): void {
    const nextStatus = d.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    d.status = nextStatus;
    this.departments.update(list => list.map(item => item.id === d.id ? { ...item, status: nextStatus } : item));
    this.toastService.info(`Department status set to ${nextStatus}.`);
  }
}
