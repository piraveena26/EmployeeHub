import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly baseUrl = '/api/employees/';

  constructor(private http: HttpClient) {}

  getEmployees(params?: { search?: string; department?: number; employment_status?: string; page?: number }): Observable<{ results: Employee[]; count: number }> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.department) httpParams = httpParams.set('department', params.department.toString());
    if (params?.employment_status) httpParams = httpParams.set('employment_status', params.employment_status);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    return this.http.get<{ results: Employee[]; count: number }>(this.baseUrl, { params: httpParams });
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}${id}/`);
  }

  getMyProfile(): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}me/`);
  }

  createEmployee(data: Partial<Employee>): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, data);
  }

  updateEmployee(id: number, data: Partial<Employee>): Observable<Employee> {
    return this.http.patch<Employee>(`${this.baseUrl}${id}/`, data);
  }

  toggleStatus(id: number): Observable<{ status: string; employment_status: string; detail: string }> {
    return this.http.post<{ status: string; employment_status: string; detail: string }>(`${this.baseUrl}${id}/toggle-status/`, {});
  }
}
