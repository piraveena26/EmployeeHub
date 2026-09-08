from django.conf import settings
from django.db import models
from employees.models import Employee


class PeriodStatus(models.TextChoices):
    UPCOMING = 'UPCOMING', 'Upcoming'
    ACTIVE = 'ACTIVE', 'Active'
    COMPLETED = 'COMPLETED', 'Completed'


class GoalStatus(models.TextChoices):
    NOT_STARTED = 'NOT_STARTED', 'Not Started'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'


class RatingGrade(models.TextChoices):
    EXCEEDS = 'EXCEEDS_EXPECTATIONS', 'Exceeds Expectations'
    MEETS = 'MEETS_EXPECTATIONS', 'Meets Expectations'
    NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT', 'Needs Improvement'
    UNSATISFACTORY = 'UNSATISFACTORY', 'Unsatisfactory'


class PerformancePeriod(models.Model):
    name = models.CharField(max_length=100, help_text="e.g. Q1 2026 Review, Annual Review 2026")
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=PeriodStatus.choices,
        default=PeriodStatus.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"


class Goal(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='goals'
    )
    period = models.ForeignKey(
        PerformancePeriod,
        on_delete=models.CASCADE,
        related_name='goals'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    target_date = models.DateField()
    progress_percentage = models.PositiveSmallIntegerField(default=0)
    weight = models.DecimalField(max_digits=4, decimal_places=1, default=1.0)
    status = models.CharField(
        max_length=20,
        choices=GoalStatus.choices,
        default=GoalStatus.NOT_STARTED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['target_date']

    def __str__(self):
        return f"{self.title} - {self.employee.full_name} ({self.progress_percentage}%)"


class PerformanceReview(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conducted_reviews'
    )
    period = models.ForeignKey(
        PerformancePeriod,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    self_rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True, help_text="1.0 to 5.0")
    manager_rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True, help_text="1.0 to 5.0")
    final_score = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    rating_grade = models.CharField(
        max_length=30,
        choices=RatingGrade.choices,
        default=RatingGrade.MEETS
    )
    employee_comments = models.TextField(blank=True, null=True)
    manager_comments = models.TextField(blank=True, null=True)
    is_submitted_by_employee = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-period__start_date']
        unique_together = ('employee', 'period')

    def __str__(self):
        return f"{self.employee.full_name} - {self.period.name} (Score: {self.final_score or 'Pending'})"
