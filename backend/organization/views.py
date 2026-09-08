from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from authentication.permissions import IsHRManager
from .models import Department, Designation, JobRole, Shift
from .serializers import (
    DepartmentSerializer,
    DesignationSerializer,
    JobRoleSerializer,
    ShiftSerializer,
)


class BaseOrgViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'toggle_status']:
            return [IsHRManager()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        obj = self.get_object()
        obj.status = 'INACTIVE' if obj.status == 'ACTIVE' else 'ACTIVE'
        obj.save()
        return Response({
            'status': 'success',
            'new_status': obj.status,
            'detail': f"Status updated to {obj.status}."
        })


class DepartmentViewSet(BaseOrgViewSet):
    queryset = Department.objects.all().select_related('manager')
    serializer_class = DepartmentSerializer
    filterset_fields = ['status']
    search_fields = ['department_id', 'name', 'description']
    ordering_fields = ['name', 'created_at']


class DesignationViewSet(BaseOrgViewSet):
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    filterset_fields = ['status']
    search_fields = ['designation_id', 'name', 'description']
    ordering_fields = ['name', 'created_at']


class JobRoleViewSet(BaseOrgViewSet):
    queryset = JobRole.objects.all()
    serializer_class = JobRoleSerializer
    filterset_fields = ['status']
    search_fields = ['role_id', 'name', 'description']
    ordering_fields = ['name', 'created_at']


class ShiftViewSet(BaseOrgViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    filterset_fields = ['status']
    search_fields = ['shift_id', 'name']
    ordering_fields = ['start_time', 'name']
