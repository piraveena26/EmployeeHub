import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department, Designation, JobRole, Shift } from '../models';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly baseUrl = '/api/organization/';

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<{ results: Department[] } | Department[]> {
    return this.http.get<{ results: Department[] } | Department[]>(`${this.baseUrl}departments/`);
  }

  createDepartment(data: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}departments/`, data);
  }

  toggleDepartmentStatus(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}departments/${id}/toggle-status/`, {});
  }

  getDesignations(): Observable<{ results: Designation[] } | Designation[]> {
    return this.http.get<{ results: Designation[] } | Designation[]>(`${this.baseUrl}designations/`);
  }

  createDesignation(data: Partial<Designation>): Observable<Designation> {
    return this.http.post<Designation>(`${this.baseUrl}designations/`, data);
  }

  getJobRoles(): Observable<{ results: JobRole[] } | JobRole[]> {
    return this.http.get<{ results: JobRole[] } | JobRole[]>(`${this.baseUrl}job-roles/`);
  }

  createJobRole(data: Partial<JobRole>): Observable<JobRole> {
    return this.http.post<JobRole>(`${this.baseUrl}job-roles/`, data);
  }

  getShifts(): Observable<{ results: Shift[] } | Shift[]> {
    return this.http.get<{ results: Shift[] } | Shift[]>(`${this.baseUrl}shifts/`);
  }

  createShift(data: Partial<Shift>): Observable<Shift> {
    return this.http.post<Shift>(`${this.baseUrl}shifts/`, data);
  }
}
