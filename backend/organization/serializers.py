from rest_framework import serializers
from .models import Department, Designation, JobRole, Shift
from authentication.serializers import UserSerializer


class DepartmentSerializer(serializers.ModelSerializer):
    manager_details = UserSerializer(source='manager', read_only=True)
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            'id', 'department_id', 'name', 'description',
            'manager', 'manager_details', 'status', 'employee_count',
            'created_at', 'updated_at'
        ]

    def get_employee_count(self, obj):
        if hasattr(obj, 'employees'):
            return obj.employees.filter(employment_status='ACTIVE').count()
        return 0


class DesignationSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Designation
        fields = [
            'id', 'designation_id', 'name', 'description',
            'status', 'employee_count', 'created_at', 'updated_at'
        ]

    def get_employee_count(self, obj):
        if hasattr(obj, 'employees'):
            return obj.employees.filter(employment_status='ACTIVE').count()
        return 0


class JobRoleSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = JobRole
        fields = [
            'id', 'role_id', 'name', 'description',
            'status', 'employee_count', 'created_at', 'updated_at'
        ]

    def get_employee_count(self, obj):
        if hasattr(obj, 'employees'):
            return obj.employees.filter(employment_status='ACTIVE').count()
        return 0


class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = [
            'id', 'shift_id', 'name', 'start_time', 'end_time',
            'working_hours', 'status', 'created_at', 'updated_at'
        ]
