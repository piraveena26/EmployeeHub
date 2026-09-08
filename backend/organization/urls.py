from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet,
    DesignationViewSet,
    JobRoleViewSet,
    ShiftViewSet,
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'designations', DesignationViewSet, basename='designation')
router.register(r'job-roles', JobRoleViewSet, basename='job-role')
router.register(r'shifts', ShiftViewSet, basename='shift')

urlpatterns = [
    path('', include(router.urls)),
]
