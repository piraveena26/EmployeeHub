from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import TimesheetViewSet, WorkAllocationViewSet

router = DefaultRouter()
router.register(r'allocations', WorkAllocationViewSet, basename='work-allocation')
router.register(r'', TimesheetViewSet, basename='timesheet')

urlpatterns = [
    path('', include(router.urls)),
]
