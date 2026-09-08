from rest_framework import serializers
from .models import Goal, PerformancePeriod, PerformanceReview
from employees.serializers import EmployeeListSerializer
from authentication.serializers import UserSerializer


class PerformancePeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformancePeriod
        fields = '__all__'


class GoalSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Goal
        fields = '__all__'


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)
    reviewer_details = UserSerializer(source='reviewer', read_only=True)
    period_details = PerformancePeriodSerializer(source='period', read_only=True)
    rating_grade_display = serializers.CharField(source='get_rating_grade_display', read_only=True)

    class Meta:
        model = PerformanceReview
        fields = '__all__'
