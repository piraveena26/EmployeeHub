from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from authentication.permissions import IsHRManager, IsManager
from employees.models import Employee
from notifications.models import Notification, NotificationType
from .models import Goal, PerformancePeriod, PerformanceReview
from .serializers import (
    GoalSerializer,
    PerformancePeriodSerializer,
    PerformanceReviewSerializer,
)


class PerformancePeriodViewSet(viewsets.ModelViewSet):
    queryset = PerformancePeriod.objects.all()
    serializer_class = PerformancePeriodSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsHRManager()]
        return [IsAuthenticated()]


class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all().select_related('employee', 'period')
    serializer_class = GoalSerializer
    filterset_fields = ['employee', 'period', 'status']
    search_fields = ['title', 'description']

    @action(detail=False, methods=['get'], url_path='my-goals')
    def my_goals(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            goals = Goal.objects.filter(employee=employee).order_by('target_date')
            return Response(GoalSerializer(goals, many=True).data)
        except Employee.DoesNotExist:
            return Response([])


class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all().select_related('employee', 'reviewer', 'period')
    serializer_class = PerformanceReviewSerializer
    filterset_fields = ['employee', 'period', 'is_completed']

    @action(detail=False, methods=['get'], url_path='my-reviews')
    def my_reviews(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
            reviews = PerformanceReview.objects.filter(employee=employee).order_by('-created_at')
            return Response(PerformanceReviewSerializer(reviews, many=True).data)
        except Employee.DoesNotExist:
            return Response([])

    @action(detail=True, methods=['post'], url_path='submit-self-review')
    def submit_self_review(self, request, pk=None):
        review = self.get_object()
        review.self_rating = request.data.get('self_rating', review.self_rating)
        review.employee_comments = request.data.get('employee_comments', review.employee_comments)
        review.is_submitted_by_employee = True
        review.save()
        return Response(PerformanceReviewSerializer(review).data)

    @action(detail=True, methods=['post'], url_path='complete-manager-review', permission_classes=[IsManager])
    def complete_manager_review(self, request, pk=None):
        review = self.get_object()
        review.manager_rating = request.data.get('manager_rating', review.manager_rating)
        review.manager_comments = request.data.get('manager_comments', review.manager_comments)
        review.final_score = request.data.get('final_score', review.manager_rating)
        review.rating_grade = request.data.get('rating_grade', review.rating_grade)
        review.reviewer = request.user
        review.is_completed = True
        review.save()

        if review.employee.user:
            Notification.objects.create(
                recipient=review.employee.user,
                title="Performance Review Completed",
                message=f"Your performance review for {review.period.name} has been evaluated by management. Final Score: {review.final_score}",
                notification_type=NotificationType.PERFORMANCE_PENDING,
                target_url="/performance"
            )

        return Response(PerformanceReviewSerializer(review).data)
