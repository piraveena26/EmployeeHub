from rest_framework import serializers
from .models import Timesheet, TimesheetEntry, WorkAllocation
from employees.serializers import EmployeeListSerializer
from authentication.serializers import UserSerializer


class TimesheetEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimesheetEntry
        fields = ['id', 'date', 'project_name', 'task_description', 'hours']


class TimesheetSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)
    reviewer_details = UserSerializer(source='reviewer', read_only=True)
    entries = TimesheetEntrySerializer(many=True, required=False)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Timesheet
        fields = [
            'id', 'employee', 'employee_details', 'week_start_date',
            'total_hours', 'status', 'status_display', 'reviewer',
            'reviewer_details', 'reviewer_comments', 'entries',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reviewer', 'reviewer_comments', 'created_at', 'updated_at']

    def create(self, validated_data):
        entries_data = validated_data.pop('entries', [])
        timesheet = Timesheet.objects.create(**validated_data)
        total = 0
        for entry in entries_data:
            te = TimesheetEntry.objects.create(timesheet=timesheet, **entry)
            total += te.hours
        timesheet.total_hours = total
        timesheet.save()
        return timesheet

    def update(self, instance, validated_data):
        entries_data = validated_data.pop('entries', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)

        if entries_data is not None:
            instance.entries.all().delete()
            total = 0
            for entry in entries_data:
                te = TimesheetEntry.objects.create(timesheet=instance, **entry)
                total += te.hours
            instance.total_hours = total

        instance.save()
        return instance


class WorkAllocationSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)
    assigned_by_details = UserSerializer(source='assigned_by', read_only=True)

    class Meta:
        model = WorkAllocation
        fields = '__all__'
