from rest_framework import serializers
from .models import Employee
from organization.serializers import (
    DepartmentSerializer,
    DesignationSerializer,
    JobRoleSerializer,
    ShiftSerializer,
)


class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_name = serializers.CharField(source='designation.name', read_only=True)
    job_role_name = serializers.CharField(source='job_role.name', read_only=True)
    shift_name = serializers.CharField(source='shift.name', read_only=True)
    full_name = serializers.ReadOnlyField()
    photo_display = serializers.ReadOnlyField()

    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'gender', 'avatar_url', 'photo_display',
            'department', 'department_name', 'designation', 'designation_name',
            'job_role', 'job_role_name', 'shift', 'shift_name',
            'employment_type', 'employment_status', 'joining_date',
            'basic_salary', 'created_at'
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    department_details = DepartmentSerializer(source='department', read_only=True)
    designation_details = DesignationSerializer(source='designation', read_only=True)
    job_role_details = JobRoleSerializer(source='job_role', read_only=True)
    shift_details = ShiftSerializer(source='shift', read_only=True)
    full_name = serializers.ReadOnlyField()
    photo_display = serializers.ReadOnlyField()

    class Meta:
        model = Employee
        fields = '__all__'


class EmployeeWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
