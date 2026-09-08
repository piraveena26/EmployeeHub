from django.urls import path
from .views import (
    DashboardMetricsView,
    ExportAttendanceView,
    ExportEmployeesView,
)

urlpatterns = [
    path('dashboard/', DashboardMetricsView.as_view(), name='dashboard_metrics'),
    path('export-employees/', ExportEmployeesView.as_view(), name='export_employees'),
    path('export-attendance/', ExportAttendanceView.as_view(), name='export_attendance'),
]
