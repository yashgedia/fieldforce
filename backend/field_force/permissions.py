from rest_framework import permissions

class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.role == 'ADMIN'

class RoleBasedAccessControl(permissions.BasePermission):
    """
    Custom permission to enforce role-based access control.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        role = request.user.role
        
        # Admin can do everything
        if role == 'ADMIN':
            return True
            
        # Auditor can only read
        if role == 'AUDITOR':
            return request.method in permissions.SAFE_METHODS
            
        # Manager/Lead can create tasks and read, Field Agent can't create tasks generally
        # We will handle object-level permissions in has_object_permission and get_queryset
        return True

    def has_object_permission(self, request, view, obj):
        role = request.user.role
        
        if role == 'ADMIN':
            return True
            
        if role == 'AUDITOR':
            return request.method in permissions.SAFE_METHODS
            
        # Object-level permissions depend on the model type
        # For Task:
        if hasattr(obj, 'assigned_to'): # It's a Task
            if role == 'FIELD_AGENT':
                # Agent can view their tasks, and maybe update status
                if obj.assigned_to == request.user:
                    return request.method in ['GET', 'PATCH']
                return False
            if role in ['REGIONAL_MANAGER', 'TEAM_LEAD']:
                # Can manage tasks in their region
                if request.user.region and obj.region == request.user.region:
                    return True
                return False
                
        # For Visit:
        if hasattr(obj, 'agent'): # It's a Visit
            if role == 'FIELD_AGENT':
                # Agent can update their own visits
                if obj.agent == request.user:
                    return True
                return False
            if role in ['REGIONAL_MANAGER', 'TEAM_LEAD']:
                # Can manage visits in their region
                if request.user.region and obj.task.region == request.user.region:
                    return True
                return False
                
        return False
