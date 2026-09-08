from django.conf import settings
from django.db import models
from employees.models import Employee


class TimesheetStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    SUBMITTED = 'SUBMITTED', 'Submitted'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'


class WorkAllocation(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='work_allocations'
    )
    project_name = models.CharField(max_length=150)
    task_name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_work'
    )
    start_date = models.DateField()
    deadline = models.DateField()
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-deadline']

    def __str__(self):
        return f"{self.project_name} - {self.task_name} -> {self.employee.full_name}"


class Timesheet(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='timesheets'
    )
    week_start_date = models.DateField(help_text="Monday of the timesheet week")
    total_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    status = models.CharField(
        max_length=20,
        choices=TimesheetStatus.choices,
        default=TimesheetStatus.DRAFT
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_timesheets'
    )
    reviewer_comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-week_start_date']
        unique_together = ('employee', 'week_start_date')

    def __str__(self):
        return f"{self.employee.full_name} - Week of {self.week_start_date} ({self.status})"


class TimesheetEntry(models.Model):
    timesheet = models.ForeignKey(
        Timesheet,
        on_delete=models.CASCADE,
        related_name='entries'
    )
    date = models.DateField()
    project_name = models.CharField(max_length=150)
    task_description = models.CharField(max_length=250)
    hours = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return f"{self.date}: {self.project_name} - {self.hours} hrs"
