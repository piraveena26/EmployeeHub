from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    ExpenseViewSet,
    PayrollPeriodViewSet,
    PayslipViewSet,
    SalaryStructureViewSet,
)

router = DefaultRouter()
router.register(r'structures', SalaryStructureViewSet, basename='salary-structure')
router.register(r'periods', PayrollPeriodViewSet, basename='payroll-period')
router.register(r'payslips', PayslipViewSet, basename='payslip')
router.register(r'expenses', ExpenseViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
]
