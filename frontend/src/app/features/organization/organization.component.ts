import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/services/auth.service';
import { Department, Designation, JobRole, Shift } from '../../core/models';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Organization Structure</h1>
          <p class="text-xs text-slate-500 mt-0.5">Manage departments, designations, job roles, and operational shifts</p>
        </div>
        <div>
          <button (click)="openAddModal()"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition">
            <span class="material-icons-outlined text-sm">add_circle</span> Add {{ activeTab() }}
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-500">
        <button (click)="activeTab.set('Department')" [class.text-indigo-600]="activeTab() === 'Department'" [class.border-indigo-600]="activeTab() === 'Department'"
                class="pb-3 border-b-2 border-transparent transition flex items-center gap-1.5">
          <span class="material-icons-outlined text-base">apartment</span> Departments ({{ departments().length }})
        </button>
        <button (click)="activeTab.set('Designation')" [class.text-indigo-600]="activeTab() === 'Designation'" [class.border-indigo-600]="activeTab() === 'Designation'"
                class="pb-3 border-b-2 border-transparent transition flex items-center gap-1.5">
          <span class="material-icons-outlined text-base">workspace_premium</span> Designations ({{ designations().length }})
        </button>
        <button (click)="activeTab.set('Job Role')" [class.text-indigo-600]="activeTab() === 'Job Role'" [class.border-indigo-600]="activeTab() === 'Job Role'"
                class="pb-3 border-b-2 border-transparent transition flex items-center gap-1.5">
          <span class="material-icons-outlined text-base">category</span> Job Roles ({{ jobRoles().length }})
        </button>
        <button (click)="activeTab.set('Shift')" [class.text-indigo-600]="activeTab() === 'Shift'" [class.border-indigo-600]="activeTab() === 'Shift'"
                class="pb-3 border-b-2 border-transparent transition flex items-center gap-1.5">
          <span class="material-icons-outlined text-base">schedule</span> Shifts ({{ shifts().length }})
        </button>
      </div>

      <!-- Content -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <!-- 1. DEPARTMENTS TAB -->
        @if (activeTab() === 'Department') {
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-5 py-3.5 font-bold">Code</th>
                <th class="px-5 py-3.5 font-bold">Department Name</th>
                <th class="px-5 py-3.5 font-bold">Description</th>
                <th class="px-5 py-3.5 font-bold">Staff Count</th>
                <th class="px-5 py-3.5 font-bold">Status</th>
                <th class="px-5 py-3.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (d of departments(); track d.id) {
                <tr class="hover:bg-slate-50 transition">
                  <td class="px-5 py-3.5 font-mono text-slate-500">{{ d.department_id }}</td>
                  <td class="px-5 py-3.5 font-bold text-slate-800">{{ d.name }}</td>
                  <td class="px-5 py-3.5 text-slate-500 max-w-xs truncate">{{ d.description || '-' }}</td>
                  <td class="px-5 py-3.5 font-semibold text-indigo-600">{{ d.employee_count }} employees</td>
                  <td class="px-5 py-3.5">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                          [class.bg-emerald-50]="d.status === 'ACTIVE'" [class.text-emerald-700]="d.status === 'ACTIVE'"
                          [class.bg-rose-50]="d.status === 'INACTIVE'" [class.text-rose-700]="d.status === 'INACTIVE'">
                      {{ d.status }}
                    </span>
                  </td>
                  <td class="px-5 py-3.5 text-right">
                    <button (click)="toggleDepartmentStatus(d)" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
                      Toggle Status
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }

        <!-- 2. DESIGNATIONS TAB -->
        @if (activeTab() === 'Designation') {
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-5 py-3.5 font-bold">Code</th>
                <th class="px-5 py-3.5 font-bold">Designation Title</th>
                <th class="px-5 py-3.5 font-bold">Active Staff</th>
                <th class="px-5 py-3.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (des of designations(); track des.id) {
                <tr class="hover:bg-slate-50 transition">
                  <td class="px-5 py-3.5 font-mono text-slate-500">{{ des.designation_id }}</td>
                  <td class="px-5 py-3.5 font-bold text-slate-800">{{ des.name }}</td>
                  <td class="px-5 py-3.5 font-semibold text-indigo-600">{{ des.employee_count }} staff</td>
                  <td class="px-5 py-3.5">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {{ des.status }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }

        <!-- 3. JOB ROLES TAB -->
        @if (activeTab() === 'Job Role') {
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-5 py-3.5 font-bold">Code</th>
                <th class="px-5 py-3.5 font-bold">Role Name</th>
                <th class="px-5 py-3.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (r of jobRoles(); track r.id) {
                <tr class="hover:bg-slate-50 transition">
                  <td class="px-5 py-3.5 font-mono text-slate-500">{{ r.role_id }}</td>
                  <td class="px-5 py-3.5 font-bold text-slate-800">{{ r.name }}</td>
                  <td class="px-5 py-3.5">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {{ r.status }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }

        <!-- 4. SHIFTS TAB -->
        @if (activeTab() === 'Shift') {
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-5 py-3.5 font-bold">Shift ID</th>
                <th class="px-5 py-3.5 font-bold">Shift Name</th>
                <th class="px-5 py-3.5 font-bold">Timing</th>
                <th class="px-5 py-3.5 font-bold">Standard Hours</th>
                <th class="px-5 py-3.5 font-bold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (s of shifts(); track s.id) {
                <tr class="hover:bg-slate-50 transition">
                  <td class="px-5 py-3.5 font-mono text-slate-500">{{ s.shift_id }}</td>
                  <td class="px-5 py-3.5 font-bold text-slate-800">{{ s.name }}</td>
                  <td class="px-5 py-3.5 font-mono text-indigo-600">{{ s.start_time }} - {{ s.end_time }}</td>
                  <td class="px-5 py-3.5 font-semibold text-slate-700">{{ s.working_hours }} hrs / day</td>
                  <td class="px-5 py-3.5">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {{ s.status }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Add Modal Dialog -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-sm font-bold text-slate-900">Add New {{ activeTab() }}</h3>
              <button (click)="showModal.set(false)" class="text-slate-400 material-icons-outlined text-sm">close</button>
            </div>

            <form (ngSubmit)="saveItem()" class="space-y-3 mt-4 text-xs">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Code / Identifier *</label>
                <input type="text" [(ngModel)]="newItem.code" name="code" placeholder="e.g. DEP-MKT" required
                       class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Name / Title *</label>
                <input type="text" [(ngModel)]="newItem.name" name="name" placeholder="Title" required
                       class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea [(ngModel)]="newItem.description" name="description" rows="2"
                          class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
              </div>

              <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" (click)="showModal.set(false)" class="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-semibold">Cancel</button>
                <button type="submit" class="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class OrganizationComponent implements OnInit {
  activeTab = signal<'Department' | 'Designation' | 'Job Role' | 'Shift'>('Department');
  departments = signal<Department[]>([]);
  designations = signal<Designation[]>([]);
  jobRoles = signal<JobRole[]>([]);
  shifts = signal<Shift[]>([]);
  showModal = signal(false);

  newItem = { code: '', name: '', description: '' };

  constructor(private orgService: OrganizationService, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.orgService.getDepartments().subscribe({
      next: res => this.departments.set(Array.isArray(res) ? res : res.results || [])
    });
    this.orgService.getDesignations().subscribe({
      next: res => this.designations.set(Array.isArray(res) ? res : res.results || [])
    });
    this.orgService.getJobRoles().subscribe({
      next: res => this.jobRoles.set(Array.isArray(res) ? res : res.results || [])
    });
    this.orgService.getShifts().subscribe({
      next: res => this.shifts.set(Array.isArray(res) ? res : res.results || [])
    });
  }

  toggleDepartmentStatus(d: Department): void {
    this.orgService.toggleDepartmentStatus(d.id).subscribe({
      next: res => d.status = res.new_status
    });
  }

  openAddModal(): void {
    this.newItem = { code: '', name: '', description: '' };
    this.showModal.set(true);
  }

  saveItem(): void {
    const tab = this.activeTab();
    if (tab === 'Department') {
      this.orgService.createDepartment({ department_id: this.newItem.code, name: this.newItem.name, description: this.newItem.description }).subscribe({
        next: () => { this.showModal.set(false); this.loadAll(); }
      });
    } else if (tab === 'Designation') {
      this.orgService.createDesignation({ designation_id: this.newItem.code, name: this.newItem.name, description: this.newItem.description }).subscribe({
        next: () => { this.showModal.set(false); this.loadAll(); }
      });
    } else if (tab === 'Job Role') {
      this.orgService.createJobRole({ role_id: this.newItem.code, name: this.newItem.name, description: this.newItem.description }).subscribe({
        next: () => { this.showModal.set(false); this.loadAll(); }
      });
    }
  }
}
