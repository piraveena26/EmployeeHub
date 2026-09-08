export type UserRole = 'SUPER_ADMIN' | 'HR_MANAGER' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  role_display?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Department {
  id: number;
  department_id: string;
  name: string;
  description?: string;
  manager?: number;
  manager_details?: User;
  status: 'ACTIVE' | 'INACTIVE';
  employee_count?: number;
  created_at?: string;
}

export interface Designation {
  id: number;
  designation_id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  employee_count?: number;
}

export interface JobRole {
  id: number;
  role_id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  employee_count?: number;
}

export interface Shift {
  id: number;
  shift_id: string;
  name: string;
  start_time: string;
  end_time: string;
  working_hours: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface Employee {
  id: number;
  user?: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  date_of_birth?: string;
  address?: string;
  avatar_url?: string;
  photo_display?: string;
  department?: number;
  department_name?: string;
  department_details?: Department;
  designation?: number;
  designation_name?: string;
  designation_details?: Designation;
  job_role?: number;
  job_role_name?: string;
  job_role_details?: JobRole;
  shift?: number;
  shift_name?: string;
  shift_details?: Shift;
  employment_type: EmploymentType;
  employment_status: EmploymentStatus;
  joining_date: string;
  basic_salary: number | string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  created_at?: string;
}

export type AttendanceStatusType = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE';

export interface AttendanceRecord {
  id: number;
  employee: number;
  employee_details?: Employee;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  working_hours: number;
  status: AttendanceStatusType;
  status_display?: string;
  is_late: boolean;
  is_early_departure: boolean;
  notes?: string;
  created_at?: string;
}

export interface TodayAttendanceStatus {
  is_checked_in: boolean;
  is_checked_out: boolean;
  record?: AttendanceRecord | null;
}

export interface LeaveType {
  id: number;
  name: string;
  description?: string;
  default_days: number;
  is_paid: boolean;
}

export interface LeaveBalance {
  id: number;
  employee: number;
  leave_type: number;
  leave_type_name: string;
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
}

export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id: number;
  employee: number;
  employee_details?: Employee;
  leave_type: number;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveRequestStatus;
  status_display?: string;
  reviewed_by?: number;
  reviewed_by_details?: User;
  review_notes?: string;
  created_at?: string;
}

export interface TimesheetEntry {
  id?: number;
  date: string;
  project_name: string;
  task_description: string;
  hours: number;
}

export type TimesheetStatusType = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Timesheet {
  id: number;
  employee: number;
  employee_details?: Employee;
  week_start_date: string;
  total_hours: number;
  status: TimesheetStatusType;
  status_display?: string;
  reviewer?: number;
  reviewer_details?: User;
  reviewer_comments?: string;
  entries: TimesheetEntry[];
  created_at?: string;
}

export interface WorkAllocation {
  id: number;
  employee: number;
  employee_details?: Employee;
  project_name: string;
  task_name: string;
  description?: string;
  assigned_by?: number;
  assigned_by_details?: User;
  start_date: string;
  deadline: string;
  is_completed: boolean;
}

export interface SalaryStructure {
  id: number;
  employee: number;
  employee_details?: Employee;
  basic_salary: number;
  housing_allowance: number;
  transport_allowance: number;
  medical_allowance: number;
  other_allowance: number;
  tax_deduction: number;
  provident_fund: number;
  other_deductions: number;
  total_allowances: number;
  total_deductions: number;
  gross_salary: number;
  net_salary: number;
}

export interface PayrollPeriod {
  id: number;
  month: number;
  year: number;
  start_date: string;
  end_date: string;
  is_processed: boolean;
  processed_at?: string;
  total_payslips?: number;
  total_payroll_amount?: number;
}

export interface Payslip {
  id: number;
  payslip_number: string;
  employee: number;
  employee_details?: Employee;
  period: number;
  period_details?: PayrollPeriod;
  basic_salary: number;
  allowances: number;
  overtime_amount: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  payment_date?: string;
  payment_method: string;
  is_paid: boolean;
  created_at?: string;
}

export interface PerformancePeriod {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
}

export interface Goal {
  id: number;
  employee: number;
  employee_details?: Employee;
  period: number;
  title: string;
  description?: string;
  target_date: string;
  progress_percentage: number;
  weight: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  status_display?: string;
}

export interface PerformanceReview {
  id: number;
  employee: number;
  employee_details?: Employee;
  reviewer?: number;
  reviewer_details?: User;
  period: number;
  period_details?: PerformancePeriod;
  self_rating?: number;
  manager_rating?: number;
  final_score?: number;
  rating_grade: string;
  rating_grade_display?: string;
  employee_comments?: string;
  manager_comments?: string;
  is_submitted_by_employee: boolean;
  is_completed: boolean;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  notification_type_display?: string;
  is_read: boolean;
  target_url?: string;
  created_at: string;
}

export interface DashboardData {
  role: UserRole;
  metrics?: {
    total_employees: number;
    active_employees: number;
    present_today: number;
    absent_today: number;
    on_leave_today: number;
    pending_leaves_count: number;
    pending_timesheets_count: number;
    payroll_status: {
      period: string;
      is_processed: boolean;
      total_amount: number;
    };
    department_distribution: { name: string; count: number }[];
    attendance_trend: { day: string; present: number; total: number }[];
  };
  employee_data?: {
    employee_id: string;
    full_name: string;
    department: string;
    designation: string;
    photo: string;
    today_checked_in: boolean;
    today_checked_out: boolean;
    today_check_in_time?: string;
    today_hours: number;
    leave_balances: { type: string; remaining: number; total: number; used: number }[];
    pending_leaves_count: number;
    active_goals_count: number;
    last_payslip_amount: number;
    last_payslip_number?: string;
  };
}
