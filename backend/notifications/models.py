from django.conf import settings
from django.db import models


class NotificationType(models.TextChoices):
    LEAVE_APPROVED = 'LEAVE_APPROVED', 'Leave Approved'
    LEAVE_REJECTED = 'LEAVE_REJECTED', 'Leave Rejected'
    TIMESHEET_APPROVED = 'TIMESHEET_APPROVED', 'Timesheet Approved'
    TIMESHEET_REJECTED = 'TIMESHEET_REJECTED', 'Timesheet Rejected'
    PAYROLL_PROCESSED = 'PAYROLL_PROCESSED', 'Payroll Processed'
    PERFORMANCE_PENDING = 'PERFORMANCE_PENDING', 'Performance Review Pending'
    WORK_ALLOCATED = 'WORK_ALLOCATED', 'New Work Allocated'
    ANNOUNCEMENT = 'ANNOUNCEMENT', 'Announcement'


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.ANNOUNCEMENT
    )
    is_read = models.BooleanField(default=False)
    target_url = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"To {self.recipient.email}: {self.title} ({'Read' if self.is_read else 'Unread'})"
