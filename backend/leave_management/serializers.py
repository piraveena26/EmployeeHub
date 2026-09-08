from rest_framework import serializers
from .models import LeaveBalance, LeaveRequest, LeaveType
from employees.serializers import EmployeeListSerializer
from authentication.serializers import UserSerializer


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'


class LeaveBalanceSerializer(serializers.ModelSerializer):
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    remaining_days = serializers.ReadOnlyField()

    class Meta:
        model = LeaveBalance
        fields = [
            'id', 'employee', 'leave_type', 'leave_type_name',
            'year', 'total_days', 'used_days', 'remaining_days'
        ]


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    reviewed_by_details = UserSerializer(source='reviewed_by', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_details', 'leave_type', 'leave_type_name',
            'start_date', 'end_date', 'total_days', 'reason', 'status',
            'status_display', 'reviewed_by', 'reviewed_by_details', 'review_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'reviewed_by', 'review_notes', 'created_at', 'updated_at']
