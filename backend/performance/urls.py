from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    GoalViewSet,
    PerformancePeriodViewSet,
    PerformanceReviewViewSet,
)

router = DefaultRouter()
router.register(r'periods', PerformancePeriodViewSet, basename='performance-period')
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'reviews', PerformanceReviewViewSet, basename='performance-review')

urlpatterns = [
    path('', include(router.urls)),
]
