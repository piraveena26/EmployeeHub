from rest_framework import permissions
from .models import UserRole


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_super_admin)


class IsHRManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_hr)


class IsManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_team_manager)


class IsOwnerOrHR(permissions.BasePermission):
    """
    Allow access to owners of the object (or their linked user) or HR/Admin users.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_hr:
            return True
        # Check direct user object
        if hasattr(obj, 'id') and obj == request.user:
            return True
        # Check linked user attribute
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        # Check linked employee's user attribute
        if hasattr(obj, 'employee') and hasattr(obj.employee, 'user') and obj.employee.user == request.user:
            return True
        return False
