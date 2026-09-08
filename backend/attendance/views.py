from datetime import datetime, time
from decimal import Decimal
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from authentication.permissions import IsHRManager
from employees.models import Employee
from .models import AttendanceRecord, AttendanceStatus
from .serializers import AttendanceRecordSerializer, CheckInCheckOutSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all().select_related(
        'employee', 'employee__department', 'employee__shift'
    )
    serializer_class = AttendanceRecordSerializer
    filterset_fields = ['employee', 'date', 'status', 'is_late', 'employee__department']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']
    ordering_fields = ['date', 'check_in_time', 'working_hours']

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsHRManager()]
        return [IsAuthenticated()]

    def _get_current_employee(self, request):
        try:
            return Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return None

    @action(detail=False, methods=['get'], url_path='today-status')
    def today_status(self, request):
        employee = self._get_current_employee(request)
        if not employee:
            return Response({"detail": "User has no linked employee profile."}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.localdate()
        record = AttendanceRecord.objects.filter(employee=employee, date=today).first()
        if not record:
            return Response({
                'is_checked_in': False,
                'is_checked_out': False,
                'record': None
            })

        return Response({
            'is_checked_in': bool(record.check_in_time),
            'is_checked_out': bool(record.check_out_time),
            'record': AttendanceRecordSerializer(record).data
        })

    @action(detail=False, methods=['post'], url_path='check-in')
    def check_in(self, request):
        employee = self._get_current_employee(request)
        if not employee:
            return Response({"detail": "User has no linked employee profile."}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.localdate()
        now_time = timezone.localtime().time()

        record, created = AttendanceRecord.objects.get_or_create(
            employee=employee,
            date=today,
            defaults={'check_in_time': now_time, 'status': AttendanceStatus.PRESENT}
        )

        if not created and record.check_in_time:
            return Response({"detail": "Already checked in for today."}, status=status.HTTP_400_BAD_REQUEST)

        record.check_in_time = now_time
        record.status = AttendanceStatus.PRESENT

        # Late detection check against shift
        if employee.shift and employee.shift.start_time:
            shift_start = employee.shift.start_time
            # 15 minute grace period
            grace_seconds = 15 * 60
            check_in_sec = record.check_in_time.hour * 3600 + record.check_in_time.minute * 60 + record.check_in_time.second
            shift_sec = shift_start.hour * 3600 + shift_start.minute * 60 + shift_start.second
            if check_in_sec > (shift_sec + grace_seconds):
                record.is_late = True
                record.status = AttendanceStatus.LATE

        notes = request.data.get('notes')
        if notes:
            record.notes = notes

        record.save()
        return Response(AttendanceRecordSerializer(record).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='check-out')
    def check_out(self, request):
        employee = self._get_current_employee(request)
        if not employee:
            return Response({"detail": "User has no linked employee profile."}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.localdate()
        record = AttendanceRecord.objects.filter(employee=employee, date=today).first()
        if not record or not record.check_in_time:
            return Response({"detail": "Cannot check out without checking in first."}, status=status.HTTP_400_BAD_REQUEST)

        if record.check_out_time:
            return Response({"detail": "Already checked out for today."}, status=status.HTTP_400_BAD_REQUEST)

        now_time = timezone.localtime().time()
        record.check_out_time = now_time

        # Calculate working hours
        dt_start = datetime.combine(today, record.check_in_time)
        dt_end = datetime.combine(today, now_time)
        duration_seconds = (dt_end - dt_start).total_seconds()
        hours = max(0, duration_seconds / 3600.0)
        record.working_hours = Decimal(f"{hours:.2f}")

        # Half day or early departure
        if hours < 4.0:
            record.status = AttendanceStatus.HALF_DAY
            record.is_early_departure = True
        elif employee.shift and employee.shift.end_time:
            shift_end_sec = employee.shift.end_time.hour * 3600 + employee.shift.end_time.minute * 60
            now_sec = now_time.hour * 3600 + now_time.minute * 60
            if now_sec < shift_end_sec - 1800:  # left 30 mins before shift end
                record.is_early_departure = True

        record.save()
        return Response(AttendanceRecordSerializer(record).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-records')
    def my_records(self, request):
        employee = self._get_current_employee(request)
        if not employee:
            return Response([])
        records = AttendanceRecord.objects.filter(employee=employee).order_by('-date')
        page = self.paginate_queryset(records)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)
