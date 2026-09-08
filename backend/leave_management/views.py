from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from authentication.permissions import IsHRManager, IsManager
from employees.models import Employee
from notifications.models import Notification, NotificationType
from .models import LeaveBalance, LeaveRequest, LeaveStatus, LeaveType
from .serializers import (
    LeaveBalanceSerializer,
    LeaveRequestSerializer,
    LeaveTypeSerializer,
)


class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsHRManager()]
        return [IsAuthenticated()]


class LeaveBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LeaveBalance.objects.all().select_related('employee', 'leave_type')
    serializer_class = LeaveBalanceSerializer
    filterset_fields = ['employee', 'year', 'leave_type']

    @action(detail=False, methods=['get'], url_path='my-balances')
    def my_balances(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            current_year = timezone.localdate().year
            balances = LeaveBalance.objects.filter(employee=employee, year=current_year).select_related('leave_type')
            return Response(LeaveBalanceSerializer(balances, many=True).data)
        except Employee.DoesNotExist:
            return Response([])


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all().select_related(
        'employee', 'employee__department', 'leave_type', 'reviewed_by'
    )
    serializer_class = LeaveRequestSerializer
    filterset_fields = ['employee', 'leave_type', 'status', 'employee__department']
    search_fields = ['employee__first_name', 'employee__last_name', 'reason']
    ordering_fields = ['created_at', 'start_date']

    def perform_create(self, serializer):
        # If employee not provided, link to current user's employee profile
        employee = None
        if 'employee' in serializer.validated_data:
            employee = serializer.validated_data['employee']
        else:
            employee = Employee.objects.get(user=self.request.user)

        serializer.save(employee=employee, status=LeaveStatus.PENDING)

    @action(detail=False, methods=['get'], url_path='my-leaves')
    def my_leaves(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            requests = LeaveRequest.objects.filter(employee=employee).order_by('-created_at')
            page = self.paginate_queryset(requests)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            return Response(LeaveRequestSerializer(requests, many=True).data)
        except Employee.DoesNotExist:
            return Response([])

    @action(detail=True, methods=['patch', 'post'], url_path='approve', permission_classes=[IsManager])
    def approve(self, request, pk=None):
        leave_request = self.get_object()
        if leave_request.status != LeaveStatus.PENDING:
            return Response({"detail": f"Leave is already {leave_request.status}."}, status=status.HTTP_400_BAD_REQUEST)

        notes = request.data.get('review_notes', '')
        leave_request.status = LeaveStatus.APPROVED
        leave_request.reviewed_by = request.user
        leave_request.review_notes = notes
        leave_request.save()

        # Deduct balance
        year = leave_request.start_date.year
        balance = LeaveBalance.objects.filter(
            employee=leave_request.employee,
            leave_type=leave_request.leave_type,
            year=year
        ).first()

        if balance:
            balance.used_days += leave_request.total_days
            balance.save()

        # Send notification to employee's user
        if leave_request.employee.user:
            Notification.objects.create(
                recipient=leave_request.employee.user,
                title="Leave Request Approved",
                message=f"Your {leave_request.leave_type.name} leave from {leave_request.start_date} to {leave_request.end_date} has been approved.",
                notification_type=NotificationType.LEAVE_APPROVED,
                target_url="/leave"
            )

        return Response(LeaveRequestSerializer(leave_request).data)

    @action(detail=True, methods=['patch', 'post'], url_path='reject', permission_classes=[IsManager])
    def reject(self, request, pk=None):
        leave_request = self.get_object()
        if leave_request.status != LeaveStatus.PENDING:
            return Response({"detail": f"Leave is already {leave_request.status}."}, status=status.HTTP_400_BAD_REQUEST)

        notes = request.data.get('review_notes', '')
        leave_request.status = LeaveStatus.REJECTED
        leave_request.reviewed_by = request.user
        leave_request.review_notes = notes
        leave_request.save()

        # Send notification
        if leave_request.employee.user:
            Notification.objects.create(
                recipient=leave_request.employee.user,
                title="Leave Request Rejected",
                message=f"Your {leave_request.leave_type.name} leave request was rejected. Reason: {notes or 'No reason provided.'}",
                notification_type=NotificationType.LEAVE_REJECTED,
                target_url="/leave"
            )

        return Response(LeaveRequestSerializer(leave_request).data)
