from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from authentication.permissions import IsHRManager
from .models import Employee, EmploymentStatusChoices
from .serializers import (
    EmployeeDetailSerializer,
    EmployeeListSerializer,
    EmployeeWriteSerializer,
)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().select_related(
        'department', 'designation', 'job_role', 'shift', 'user'
    )
    filterset_fields = ['department', 'designation', 'job_role', 'employment_type', 'employment_status', 'gender']
    search_fields = ['employee_id', 'first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['employee_id', 'first_name', 'joining_date', 'basic_salary']

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return EmployeeWriteSerializer
        return EmployeeDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'toggle_status']:
            return [IsHRManager()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'], url_path='me')
    def my_profile(self, request):
        try:
            employee = Employee.objects.select_related(
                'department', 'designation', 'job_role', 'shift'
            ).get(user=request.user)
            serializer = EmployeeDetailSerializer(employee)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response(
                {"detail": "No employee profile linked to current user account."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        employee = self.get_object()
        if employee.employment_status == EmploymentStatusChoices.ACTIVE:
            employee.employment_status = EmploymentStatusChoices.INACTIVE
        else:
            employee.employment_status = EmploymentStatusChoices.ACTIVE
        employee.save()
        return Response({
            'status': 'success',
            'employment_status': employee.employment_status,
            'detail': f"Employee {employee.full_name} status updated to {employee.get_employment_status_display()}."
        })
