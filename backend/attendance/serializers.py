from rest_framework import serializers
from .models import AttendanceRecord
from employees.serializers import EmployeeListSerializer


class AttendanceRecordSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'employee', 'employee_details', 'date',
            'check_in_time', 'check_out_time', 'working_hours',
            'status', 'status_display', 'is_late', 'is_early_departure',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'working_hours', 'is_late', 'is_early_departure', 'created_at', 'updated_at']


class CheckInCheckOutSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, default='')
