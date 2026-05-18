from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, RegionViewSet, TaskViewSet, VisitViewSet, 
    ActivityLogViewSet, ReportViewSet, RegisterView,
    AttendanceViewSet, ExpenseViewSet, MessageViewSet,
    AdminStatusView, AdminRegisterView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'regions', RegionViewSet)
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'visits', VisitViewSet, basename='visit')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/admin-status/', AdminStatusView.as_view(), name='admin_status'),
    path('auth/register-admin/', AdminRegisterView.as_view(), name='auth_register_admin'),
]
