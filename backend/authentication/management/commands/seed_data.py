from datetime import date, time, timedelta
from decimal import Decimal
import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from authentication.models import User, UserRole
from organization.models import Department, Designation, JobRole, Shift
from employees.models import Employee, EmploymentTypeChoices, EmploymentStatusChoices, GenderChoices
from attendance.models import AttendanceRecord, AttendanceStatus
from leave_management.models import LeaveType, LeaveBalance, LeaveRequest, LeaveStatus
from timesheets.models import WorkAllocation, Timesheet, TimesheetEntry, TimesheetStatus
from payroll.models import PayrollPeriod, SalaryStructure, Payslip
from performance.models import PerformancePeriod, Goal, PerformanceReview, RatingGrade, GoalStatus
from notifications.models import Notification, NotificationType


class Command(BaseCommand):
    help = 'Seeds initial database with roles, organization, employees, attendance, leaves, payroll, and performance.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding EmployeeHub data..."))

        # 1. Create Core Users
        users_data = [
            {
                'email': 'admin@employeehub.com',
                'username': 'admin',
                'first_name': 'Alexander',
                'last_name': 'Wright',
                'role': UserRole.SUPER_ADMIN,
                'phone': '+1 (555) 019-2831',
                'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                'password': 'admin123',
                'is_superuser': True,
                'is_staff': True
            },
            {
                'email': 'hr@employeehub.com',
                'username': 'hr_manager',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'role': UserRole.HR_MANAGER,
                'phone': '+1 (555) 014-9921',
                'avatar_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
                'password': 'hr123',
                'is_staff': True
            },
            {
                'email': 'manager@employeehub.com',
                'username': 'manager_marcus',
                'first_name': 'Marcus',
                'last_name': 'Vance',
                'role': UserRole.MANAGER,
                'phone': '+1 (555) 018-4729',
                'avatar_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
                'password': 'manager123'
            },
            {
                'email': 'employee@employeehub.com',
                'username': 'employee_elena',
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'role': UserRole.EMPLOYEE,
                'phone': '+1 (555) 017-3820',
                'avatar_url': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
                'password': 'employee123'
            }
        ]

        created_users = {}
        for u in users_data:
            user, created = User.objects.get_or_create(
                email=u['email'],
                defaults={
                    'username': u['username'],
                    'first_name': u['first_name'],
                    'last_name': u['last_name'],
                    'role': u['role'],
                    'phone': u['phone'],
                    'avatar_url': u['avatar_url'],
                    'is_superuser': u.get('is_superuser', False),
                    'is_staff': u.get('is_staff', False),
                }
            )
            user.set_password(u['password'])
            user.save()
            created_users[u['email']] = user

        admin_user = created_users['admin@employeehub.com']
        hr_user = created_users['hr@employeehub.com']
        manager_user = created_users['manager@employeehub.com']
        employee_user = created_users['employee@employeehub.com']

        # 2. Shifts
        shift_std, _ = Shift.objects.get_or_create(
            shift_id='SFT-STD',
            defaults={'name': 'Standard Day Shift', 'start_time': time(9, 0), 'end_time': time(17, 0), 'working_hours': Decimal('8.00')}
        )
        shift_mrn, _ = Shift.objects.get_or_create(
            shift_id='SFT-MRN',
            defaults={'name': 'Early Morning Shift', 'start_time': time(8, 0), 'end_time': time(16, 0), 'working_hours': Decimal('8.00')}
        )
        shift_flx, _ = Shift.objects.get_or_create(
            shift_id='SFT-FLX',
            defaults={'name': 'Flexible Tech Shift', 'start_time': time(10, 0), 'end_time': time(18, 0), 'working_hours': Decimal('8.00')}
        )

        # 3. Departments
        dep_eng, _ = Department.objects.get_or_create(
            department_id='DEP-ENG',
            defaults={'name': 'Engineering & Technology', 'description': 'Product development, architecture, QA and Cloud operations.', 'manager': manager_user}
        )
        dep_hr, _ = Department.objects.get_or_create(
            department_id='DEP-HR',
            defaults={'name': 'Human Resources', 'description': 'Talent acquisition, culture, employee relations, and compensation.', 'manager': hr_user}
        )
        dep_des, _ = Department.objects.get_or_create(
            department_id='DEP-DES',
            defaults={'name': 'Product & UX Design', 'description': 'User research, interface design, design systems, and brand experience.'}
        )
        dep_fin, _ = Department.objects.get_or_create(
            department_id='DEP-FIN',
            defaults={'name': 'Finance & Accounting', 'description': 'Payroll, financial analysis, reporting, and statutory compliance.'}
        )
        dep_ops, _ = Department.objects.get_or_create(
            department_id='DEP-OPS',
            defaults={'name': 'Operations & Customer Success', 'description': 'Client support, operational logistics, and strategic partnerships.'}
        )

        # 4. Designations
        des_sr_dev, _ = Designation.objects.get_or_create(designation_id='DES-SR-DEV', defaults={'name': 'Senior Full Stack Engineer'})
        des_tech_lead, _ = Designation.objects.get_or_create(designation_id='DES-LEAD', defaults={'name': 'Engineering Lead'})
        des_hr_spec, _ = Designation.objects.get_or_create(designation_id='DES-HR-SPEC', defaults={'name': 'Senior HR Specialist'})
        des_ux_lead, _ = Designation.objects.get_or_create(designation_id='DES-UX-LEAD', defaults={'name': 'Lead Product Designer'})
        des_fin_analyst, _ = Designation.objects.get_or_create(designation_id='DES-FIN-AN', defaults={'name': 'Senior Financial Analyst'})
        des_devops, _ = Designation.objects.get_or_create(designation_id='DES-DEVOPS', defaults={'name': 'DevOps & Cloud Engineer'})
        des_qa, _ = Designation.objects.get_or_create(designation_id='DES-QA', defaults={'name': 'QA Automation Engineer'})

        # 5. Job Roles
        rol_be, _ = JobRole.objects.get_or_create(role_id='ROL-BE', defaults={'name': 'Backend Development'})
        rol_fe, _ = JobRole.objects.get_or_create(role_id='ROL-FE', defaults={'name': 'Frontend UI/UX'})
        rol_rec, _ = JobRole.objects.get_or_create(role_id='ROL-REC', defaults={'name': 'Talent Recruitment'})
        rol_cloud, _ = JobRole.objects.get_or_create(role_id='ROL-CLD', defaults={'name': 'Cloud Infrastructure'})

        # 6. Leave Types
        lt_annual, _ = LeaveType.objects.get_or_create(name='Annual Leave', defaults={'default_days': 18, 'is_paid': True, 'description': 'Paid vacation leave'})
        lt_casual, _ = LeaveType.objects.get_or_create(name='Casual Leave', defaults={'default_days': 8, 'is_paid': True, 'description': 'Short-term personal matters'})
        lt_medical, _ = LeaveType.objects.get_or_create(name='Medical Leave', defaults={'default_days': 12, 'is_paid': True, 'description': 'Paid medical recovery'})
        lt_unpaid, _ = LeaveType.objects.get_or_create(name='Unpaid Leave', defaults={'default_days': 30, 'is_paid': False, 'description': 'Authorized unpaid leave'})

        # 7. Create Employee Profiles
        staff_data = [
            {
                'user': admin_user,
                'emp_id': 'EMP-1001',
                'first_name': 'Alexander',
                'last_name': 'Wright',
                'email': 'admin@employeehub.com',
                'phone': '+1 (555) 019-2831',
                'dept': dep_eng,
                'desig': des_tech_lead,
                'role': rol_be,
                'shift': shift_flx,
                'salary': Decimal('9500.00'),
                'gender': GenderChoices.MALE,
                'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
            },
            {
                'user': hr_user,
                'emp_id': 'EMP-1002',
                'first_name': 'Sarah',
                'last_name': 'Jenkins',
                'email': 'hr@employeehub.com',
                'phone': '+1 (555) 014-9921',
                'dept': dep_hr,
                'desig': des_hr_spec,
                'role': rol_rec,
                'shift': shift_std,
                'salary': Decimal('7800.00'),
                'gender': GenderChoices.FEMALE,
                'avatar': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
            },
            {
                'user': manager_user,
                'emp_id': 'EMP-1003',
                'first_name': 'Marcus',
                'last_name': 'Vance',
                'email': 'manager@employeehub.com',
                'phone': '+1 (555) 018-4729',
                'dept': dep_eng,
                'desig': des_tech_lead,
                'role': rol_be,
                'shift': shift_flx,
                'salary': Decimal('8900.00'),
                'gender': GenderChoices.MALE,
                'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
            },
            {
                'user': employee_user,
                'emp_id': 'EMP-1004',
                'first_name': 'Elena',
                'last_name': 'Rostova',
                'email': 'employee@employeehub.com',
                'phone': '+1 (555) 017-3820',
                'dept': dep_eng,
                'desig': des_sr_dev,
                'role': rol_fe,
                'shift': shift_flx,
                'salary': Decimal('7200.00'),
                'gender': GenderChoices.FEMALE,
                'avatar': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
            },
            {
                'user': None,
                'emp_id': 'EMP-1005',
                'first_name': 'Liam',
                'last_name': 'Chen',
                'email': 'liam.chen@employeehub.com',
                'phone': '+1 (555) 021-9844',
                'dept': dep_des,
                'desig': des_ux_lead,
                'role': rol_fe,
                'shift': shift_std,
                'salary': Decimal('7500.00'),
                'gender': GenderChoices.MALE,
                'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
            },
            {
                'user': None,
                'emp_id': 'EMP-1006',
                'first_name': 'Amina',
                'last_name': 'Al-Sayed',
                'email': 'amina.alsayed@employeehub.com',
                'phone': '+1 (555) 032-1178',
                'dept': dep_fin,
                'desig': des_fin_analyst,
                'role': rol_rec,
                'shift': shift_mrn,
                'salary': Decimal('6900.00'),
                'gender': GenderChoices.FEMALE,
                'avatar': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
            },
            {
                'user': None,
                'emp_id': 'EMP-1007',
                'first_name': 'David',
                'last_name': 'Kowalski',
                'email': 'david.k@employeehub.com',
                'phone': '+1 (555) 045-6623',
                'dept': dep_eng,
                'desig': des_devops,
                'role': rol_cloud,
                'shift': shift_flx,
                'salary': Decimal('8100.00'),
                'gender': GenderChoices.MALE,
                'avatar': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80'
            },
            {
                'user': None,
                'emp_id': 'EMP-1008',
                'first_name': 'Sophia',
                'last_name': 'Martinez',
                'email': 'sophia.m@employeehub.com',
                'phone': '+1 (555) 067-8912',
                'dept': dep_ops,
                'desig': des_qa,
                'role': rol_be,
                'shift': shift_std,
                'salary': Decimal('6400.00'),
                'gender': GenderChoices.FEMALE,
                'avatar': 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80'
            }
        ]

        employees_list = []
        for s in staff_data:
            emp, _ = Employee.objects.get_or_create(
                employee_id=s['emp_id'],
                defaults={
                    'user': s['user'],
                    'first_name': s['first_name'],
                    'last_name': s['last_name'],
                    'email': s['email'],
                    'phone': s['phone'],
                    'department': s['dept'],
                    'designation': s['desig'],
                    'job_role': s['role'],
                    'shift': s['shift'],
                    'employment_type': EmploymentTypeChoices.FULL_TIME,
                    'employment_status': EmploymentStatusChoices.ACTIVE,
                    'joining_date': date(2023, 1, 15),
                    'basic_salary': s['salary'],
                    'gender': s['gender'],
                    'avatar_url': s['avatar'],
                    'address': '124 Innovation Way, Silicon Park, CA',
                    'emergency_contact_name': 'Emergency Contact',
                    'emergency_contact_phone': '+1 (555) 999-0000',
                    'emergency_contact_relation': 'Family'
                }
            )
            employees_list.append(emp)

            # Salary structure
            SalaryStructure.objects.get_or_create(
                employee=emp,
                defaults={
                    'basic_salary': emp.basic_salary,
                    'housing_allowance': Decimal('800.00'),
                    'transport_allowance': Decimal('300.00'),
                    'medical_allowance': Decimal('200.00'),
                    'tax_deduction': Decimal('650.00'),
                    'provident_fund': Decimal('350.00'),
                }
            )

            # Leave balances for current year
            current_year = timezone.localdate().year
            for lt in [lt_annual, lt_casual, lt_medical, lt_unpaid]:
                LeaveBalance.objects.get_or_create(
                    employee=emp,
                    leave_type=lt,
                    year=current_year,
                    defaults={'total_days': lt.default_days, 'used_days': Decimal('2.0') if lt == lt_annual else Decimal('0.0')}
                )

        # 8. Past Attendance Records (Last 14 days)
        today = timezone.localdate()
        for emp in employees_list:
            for day_offset in range(14, -1, -1):
                att_date = today - timedelta(days=day_offset)
                # Skip weekends
                if att_date.weekday() >= 5:
                    continue

                if day_offset == 0:
                    # Today: check in Elena and Marcus
                    if emp in [employees_list[2], employees_list[3]]:
                        AttendanceRecord.objects.get_or_create(
                            employee=emp,
                            date=att_date,
                            defaults={
                                'check_in_time': time(9, 2),
                                'status': AttendanceStatus.PRESENT,
                                'working_hours': Decimal('5.50')
                            }
                        )
                else:
                    # Historical days
                    status_choice = AttendanceStatus.PRESENT
                    is_late = False
                    check_in = time(8, 55)
                    check_out = time(17, 10)
                    hours = Decimal('8.25')

                    if day_offset == 3 and emp == employees_list[3]:
                        status_choice = AttendanceStatus.LATE
                        is_late = True
                        check_in = time(9, 35)
                        hours = Decimal('7.60')

                    AttendanceRecord.objects.get_or_create(
                        employee=emp,
                        date=att_date,
                        defaults={
                            'check_in_time': check_in,
                            'check_out_time': check_out,
                            'working_hours': hours,
                            'status': status_choice,
                            'is_late': is_late
                        }
                    )

        # 9. Sample Leave Request
        elena_emp = employees_list[3]
        LeaveRequest.objects.get_or_create(
            employee=elena_emp,
            leave_type=lt_annual,
            start_date=today + timedelta(days=5),
            end_date=today + timedelta(days=7),
            defaults={
                'total_days': Decimal('3.0'),
                'reason': 'Family vacation trip',
                'status': LeaveStatus.PENDING
            }
        )

        # 10. Sample Timesheet
        monday_this_week = today - timedelta(days=today.weekday())
        ts, _ = Timesheet.objects.get_or_create(
            employee=elena_emp,
            week_start_date=monday_this_week,
            defaults={
                'total_hours': Decimal('24.0'),
                'status': TimesheetStatus.SUBMITTED
            }
        )
        TimesheetEntry.objects.get_or_create(
            timesheet=ts,
            date=monday_this_week,
            project_name='EmployeeHub Portal',
            defaults={'task_description': 'Refactor JWT interceptor and state management', 'hours': Decimal('8.0')}
        )
        TimesheetEntry.objects.get_or_create(
            timesheet=ts,
            date=monday_this_week + timedelta(days=1),
            project_name='EmployeeHub Portal',
            defaults={'task_description': 'Design modern UI dashboard cards and charts', 'hours': Decimal('8.0')}
        )

        # 11. Work Allocation
        WorkAllocation.objects.get_or_create(
            employee=elena_emp,
            project_name='EmployeeHub Enterprise',
            task_name='Complete Attendance Calendar Widget',
            defaults={
                'description': 'Deliver real-time clock widget and monthly overview calendar.',
                'assigned_by': manager_user,
                'start_date': monday_this_week,
                'deadline': monday_this_week + timedelta(days=10),
                'is_completed': False
            }
        )

        # 12. Payroll Period & Payslip
        period, _ = PayrollPeriod.objects.get_or_create(
            month=today.month,
            year=today.year,
            defaults={
                'start_date': today.replace(day=1),
                'end_date': today,
                'is_processed': True,
                'processed_at': timezone.now()
            }
        )
        for emp in employees_list:
            struct = emp.salary_structure
            Payslip.objects.get_or_create(
                employee=emp,
                period=period,
                defaults={
                    'payslip_number': f"PAY-{period.year}{period.month:02d}-{emp.employee_id}",
                    'basic_salary': struct.basic_salary,
                    'allowances': struct.total_allowances,
                    'deductions': struct.total_deductions,
                    'gross_salary': struct.gross_salary,
                    'net_salary': struct.net_salary,
                    'payment_date': today,
                    'is_paid': True
                }
            )

        # 13. Performance Period & Goals
        perf_period, _ = PerformancePeriod.objects.get_or_create(
            name=f"Q{((today.month - 1) // 3) + 1} {today.year} Performance Cycle",
            defaults={
                'start_date': today - timedelta(days=45),
                'end_date': today + timedelta(days=45),
                'status': 'ACTIVE'
            }
        )
        Goal.objects.get_or_create(
            employee=elena_emp,
            period=perf_period,
            title='Achieve 99.5% Unit Test Coverage for Core Modules',
            defaults={
                'description': 'Implement automated tests for auth, payroll, and timesheet services.',
                'target_date': today + timedelta(days=30),
                'progress_percentage': 75,
                'weight': Decimal('2.0'),
                'status': GoalStatus.IN_PROGRESS
            }
        )
        PerformanceReview.objects.get_or_create(
            employee=elena_emp,
            period=perf_period,
            defaults={
                'reviewer': manager_user,
                'self_rating': Decimal('4.5'),
                'manager_rating': Decimal('4.8'),
                'final_score': Decimal('4.6'),
                'rating_grade': RatingGrade.EXCEEDS,
                'employee_comments': 'Successfully delivered core frontend UI modules ahead of deadline.',
                'manager_comments': 'Elena has demonstrated exceptional leadership and engineering rigor.',
                'is_submitted_by_employee': True,
                'is_completed': True
            }
        )

        # 14. Notifications
        Notification.objects.get_or_create(
            recipient=employee_user,
            title='Welcome to EmployeeHub',
            defaults={
                'message': 'Your account is active. Explore your dashboard, attendance, and leave management.',
                'notification_type': NotificationType.ANNOUNCEMENT,
                'target_url': '/dashboard',
                'is_read': False
            }
        )
        Notification.objects.get_or_create(
            recipient=employee_user,
            title='Payslip Available',
            defaults={
                'message': f"Your salary slip for {period.month:02d}/{period.year} is now ready for download.",
                'notification_type': NotificationType.PAYROLL_PROCESSED,
                'target_url': '/payroll',
                'is_read': False
            }
        )
        Notification.objects.get_or_create(
            recipient=hr_user,
            title='New Leave Request',
            defaults={
                'message': 'Elena Rostova submitted a new Annual Leave request.',
                'notification_type': NotificationType.ANNOUNCEMENT,
                'target_url': '/leave',
                'is_read': False
            }
        )

        self.stdout.write(self.style.SUCCESS("EmployeeHub data successfully seeded!"))
