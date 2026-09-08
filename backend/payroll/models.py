from django.db import models
from employees.models import Employee


class PayrollPeriod(models.Model):
    month = models.PositiveSmallIntegerField(help_text="1-12")
    year = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('month', 'year')
        ordering = ['-year', '-month']

    def __str__(self):
        return f"Payroll Period {self.month:02d}/{self.year}"


class SalaryStructure(models.Model):
    employee = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='salary_structure'
    )
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    housing_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    transport_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    medical_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    other_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    provident_fund = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    other_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_allowances(self):
        from decimal import Decimal
        return (
            Decimal(str(self.housing_allowance or 0)) +
            Decimal(str(self.transport_allowance or 0)) +
            Decimal(str(self.medical_allowance or 0)) +
            Decimal(str(self.other_allowance or 0))
        )

    @property
    def total_deductions(self):
        from decimal import Decimal
        return (
            Decimal(str(self.tax_deduction or 0)) +
            Decimal(str(self.provident_fund or 0)) +
            Decimal(str(self.other_deductions or 0))
        )

    @property
    def gross_salary(self):
        from decimal import Decimal
        return Decimal(str(self.basic_salary or 0)) + self.total_allowances

    @property
    def net_salary(self):
        from decimal import Decimal
        return max(Decimal('0.00'), self.gross_salary - self.total_deductions)

    def __str__(self):
        return f"{self.employee.full_name} Salary Structure (Net: ${self.net_salary:,.2f})"


class Payslip(models.Model):
    payslip_number = models.CharField(max_length=50, unique=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='payslips'
    )
    period = models.ForeignKey(
        PayrollPeriod,
        on_delete=models.CASCADE,
        related_name='payslips'
    )
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    overtime_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, default='Bank Transfer')
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('employee', 'period')

    def __str__(self):
        return f"Payslip {self.payslip_number} - {self.employee.full_name} (${self.net_salary:,.2f})"


class Expense(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='expenses'
    )
    title = models.CharField(max_length=150)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    receipt_image = models.ImageField(upload_to='receipts/', blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    is_reimbursed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.title}: ${self.amount:,.2f} ({self.employee.full_name})"
