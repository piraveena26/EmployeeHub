from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from authentication.permissions import IsManager
from employees.models import Employee
from notifications.models import Notification, NotificationType
from .models import Timesheet, TimesheetStatus, WorkAllocation
from .serializers import TimesheetSerializer, WorkAllocationSerializer


class TimesheetViewSet(viewsets.ModelViewSet):
    queryset = Timesheet.objects.all().select_related(
        'employee', 'reviewer'
    ).prefetch_related('entries')
    serializer_class = TimesheetSerializer
    filterset_fields = ['employee', 'week_start_date', 'status']
    ordering_fields = ['week_start_date', 'created_at']

    def perform_create(self, serializer):
        employee = None
        if 'employee' in serializer.validated_data:
            employee = serializer.validated_data['employee']
        else:
            employee = Employee.objects.get(user=self.request.user)
        serializer.save(employee=employee)

    @action(detail=False, methods=['get'], url_path='my-timesheets')
    def my_timesheets(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            ts = Timesheet.objects.filter(employee=employee).order_by('-week_start_date')
            page = self.paginate_queryset(ts)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            return Response(TimesheetSerializer(ts, many=True).data)
        except Employee.DoesNotExist:
            return Response([])

    @action(detail=True, methods=['post'], url_path='submit')
    def submit_timesheet(self, request, pk=None):
        timesheet = self.get_object()
        if timesheet.status not in [TimesheetStatus.DRAFT, TimesheetStatus.REJECTED]:
            return Response({"detail": f"Timesheet is already {timesheet.status}."}, status=status.HTTP_400_BAD_REQUEST)

        timesheet.status = TimesheetStatus.SUBMITTED
        timesheet.save()
        return Response(TimesheetSerializer(timesheet).data)

    @action(detail=True, methods=['post'], url_path='approve', permission_classes=[IsManager])
    def approve(self, request, pk=None):
        timesheet = self.get_object()
        timesheet.status = TimesheetStatus.APPROVED
        timesheet.reviewer = request.user
        timesheet.reviewer_comments = request.data.get('reviewer_comments', '')
        timesheet.save()

        if timesheet.employee.user:
            Notification.objects.create(
                recipient=timesheet.employee.user,
                title="Timesheet Approved",
                message=f"Your timesheet for week starting {timesheet.week_start_date} has been approved.",
                notification_type=NotificationType.TIMESHEET_APPROVED,
                target_url="/timesheets"
            )

        return Response(TimesheetSerializer(timesheet).data)

    @action(detail=True, methods=['post'], url_path='reject', permission_classes=[IsManager])
    def reject(self, request, pk=None):
        timesheet = self.get_object()
        timesheet.status = TimesheetStatus.REJECTED
        timesheet.reviewer = request.user
        timesheet.reviewer_comments = request.data.get('reviewer_comments', '')
        timesheet.save()

        if timesheet.employee.user:
            Notification.objects.create(
                recipient=timesheet.employee.user,
                title="Timesheet Rejected",
                message=f"Your timesheet for week starting {timesheet.week_start_date} was rejected. Note: {timesheet.reviewer_comments}",
                notification_type=NotificationType.TIMESHEET_REJECTED,
                target_url="/timesheets"
            )

        return Response(TimesheetSerializer(timesheet).data)


class WorkAllocationViewSet(viewsets.ModelViewSet):
    queryset = WorkAllocation.objects.all().select_related('employee', 'assigned_by')
    serializer_class = WorkAllocationSerializer
    filterset_fields = ['employee', 'is_completed']
    search_fields = ['project_name', 'task_name']

    @action(detail=False, methods=['get'], url_path='my-tasks')
    def my_tasks(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            tasks = WorkAllocation.objects.filter(employee=employee, is_completed=False).order_by('deadline')
            return Response(WorkAllocationSerializer(tasks, many=True).data)
        except Employee.DoesNotExist:
            return Response([])
