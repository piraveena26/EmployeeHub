from rest_framework import serializers
from .models import Expense, PayrollPeriod, Payslip, SalaryStructure
from employees.serializers import EmployeeListSerializer


class SalaryStructureSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)
    total_allowances = serializers.ReadOnlyField()
    total_deductions = serializers.ReadOnlyField()
    gross_salary = serializers.ReadOnlyField()
    net_salary = serializers.ReadOnlyField()

    class Meta:
        model = SalaryStructure
        fields = [
            'id', 'employee', 'employee_details', 'basic_salary',
            'housing_allowance', 'transport_allowance', 'medical_allowance', 'other_allowance',
            'tax_deduction', 'provident_fund', 'other_deductions',
            'total_allowances', 'total_deductions', 'gross_salary', 'net_salary',
            'created_at', 'updated_at'
        ]


class PayrollPeriodSerializer(serializers.ModelSerializer):
    total_payslips = serializers.SerializerMethodField()
    total_payroll_amount = serializers.SerializerMethodField()

    class Meta:
        model = PayrollPeriod
        fields = [
            'id', 'month', 'year', 'start_date', 'end_date',
            'is_processed', 'processed_at', 'total_payslips',
            'total_payroll_amount', 'created_at'
        ]

    def get_total_payslips(self, obj):
        return obj.payslips.count()

    def get_total_payroll_amount(self, obj):
        return sum([p.net_salary for p in obj.payslips.all()])


class PayslipSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)
    period_details = PayrollPeriodSerializer(source='period', read_only=True)

    class Meta:
        model = Payslip
        fields = [
            'id', 'payslip_number', 'employee', 'employee_details',
            'period', 'period_details', 'basic_salary', 'allowances',
            'overtime_amount', 'gross_salary', 'deductions', 'net_salary',
            'payment_date', 'payment_method', 'is_paid', 'created_at'
        ]


class ExpenseSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'
