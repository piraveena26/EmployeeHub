from datetime import date, time
from decimal import Decimal
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from authentication.models import User, UserRole
from organization.models import Department, Designation, Shift
from employees.models import Employee, EmploymentStatusChoices
from attendance.models import AttendanceRecord


class EmployeeHubAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.hr_user = User.objects.create_user(
            username='hr_admin',
            email='hr_admin@employeehub.com',
            password='password123',
            first_name='HR',
            last_name='Admin',
            role=UserRole.HR_MANAGER
        )
        self.employee_user = User.objects.create_user(
            username='emp_user',
            email='emp_user@employeehub.com',
            password='password123',
            first_name='John',
            last_name='Doe',
            role=UserRole.EMPLOYEE
        )

        # Organization
        self.dept = Department.objects.create(
            department_id='DEP-TEST',
            name='Test Department',
            manager=self.hr_user
        )
        self.desig = Designation.objects.create(
            designation_id='DES-TEST',
            name='Test Engineer'
        )
        self.shift = Shift.objects.create(
            shift_id='SFT-TEST',
            name='Day Shift',
            start_time=time(9, 0),
            end_time=time(17, 0)
        )

        # Employee Profile
        self.emp = Employee.objects.create(
            user=self.employee_user,
            employee_id='EMP-9999',
            first_name='John',
            last_name='Doe',
            email='emp_user@employeehub.com',
            department=self.dept,
            designation=self.desig,
            shift=self.shift,
            joining_date=date(2024, 1, 1),
            basic_salary=Decimal('6000.00'),
            employment_status=EmploymentStatusChoices.ACTIVE
        )

    def test_employee_list_as_hr(self):
        self.client.force_authenticate(user=self.hr_user)
        response = self.client.get('/api/employees/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data['results']) >= 1)

    def test_employee_check_in_and_check_out(self):
        self.client.force_authenticate(user=self.employee_user)

        # Check-in
        check_in_resp = self.client.post('/api/attendance/check-in/', {'notes': 'Morning arrival'}, format='json')
        self.assertEqual(check_in_resp.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(check_in_resp.data['check_in_time'])

        # Today status
        status_resp = self.client.get('/api/attendance/today-status/')
        self.assertEqual(status_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(status_resp.data['is_checked_in'])
        self.assertFalse(status_resp.data['is_checked_out'])

        # Check-out
        check_out_resp = self.client.post('/api/attendance/check-out/', format='json')
        self.assertEqual(check_out_resp.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(check_out_resp.data['check_out_time'])

    def test_dashboard_metrics_endpoint(self):
        self.client.force_authenticate(user=self.hr_user)
        response = self.client.get('/api/reports/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('metrics', response.data)
        self.assertIn('total_employees', response.data['metrics'])
