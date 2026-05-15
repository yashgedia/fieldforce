from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Count, Avg, F, Q
from django.utils import timezone
import datetime

from .models import User, Region, Task, Visit, ActivityLog, AIInsight, Attendance, Expense, Message
from .serializers import (
    UserSerializer, RegisterSerializer, RegionSerializer, TaskSerializer, 
    VisitSerializer, ActivityLogSerializer, AIInsightSerializer,
    AttendanceSerializer, ExpenseSerializer, MessageSerializer
)
from .permissions import RoleBasedAccessControl
from .ai_service import MockAIService

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [RoleBasedAccessControl]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [RoleBasedAccessControl]

    def get_queryset(self):
        # Allow everyone to see the personnel directory for messaging
        # (Usually you'd filter by region/team but for this demo 'LIST ALL' was requested)
        return User.objects.filter(is_active=True)

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            data = request.data
            
            # Handle standard fields
            serializer = self.get_serializer(user, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            # Handle password change
            if 'password' in data and data['password']:
                user.set_password(data['password'])
                user.save()
                
            return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def set_password(self, request, pk=None):
        user = self.get_object()
        password = request.data.get('password')
        
        # Only admins can change passwords for other users
        if request.user.role != 'ADMIN':
            return Response({'error': 'Only admins can perform this action.'}, status=status.HTTP_403_FORBIDDEN)
            
        if not password:
            return Response({'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(password)
        user.save()
        return Response({'status': 'password set'})

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [RoleBasedAccessControl]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'AUDITOR']:
            return Task.objects.all()
        if user.role in ['REGIONAL_MANAGER', 'TEAM_LEAD']:
            if user.region:
                return Task.objects.filter(region=user.region)
            return Task.objects.none()
        if user.role == 'FIELD_AGENT':
            return Task.objects.filter(assigned_to=user)
        return Task.objects.none()

    def perform_create(self, serializer):
        task = serializer.save(assigned_by=self.request.user)
        ActivityLog.objects.create(
            user=self.request.user,
            action='TASK_CREATED',
            description=f"Task '{task.title}' created."
        )

    def perform_update(self, serializer):
        task = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user,
            action='TASK_STATUS_CHANGED',
            description=f"Task '{task.title}' updated to {task.status}."
        )

class VisitViewSet(viewsets.ModelViewSet):
    serializer_class = VisitSerializer
    permission_classes = [RoleBasedAccessControl]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'AUDITOR']:
            return Visit.objects.all()
        if user.role in ['REGIONAL_MANAGER', 'TEAM_LEAD']:
            if user.region:
                return Visit.objects.filter(task__region=user.region)
            return Visit.objects.none()
        if user.role == 'FIELD_AGENT':
            return Visit.objects.filter(agent=user)
        return Visit.objects.none()

    def perform_create(self, serializer):
        visit = serializer.save(agent=self.request.user)
        ActivityLog.objects.create(
            user=self.request.user,
            action='VISIT_STARTED',
            description=f"Visit started for task '{visit.task.title}'."
        )

    def perform_update(self, serializer):
        # Check if notes are being updated and visit is completed
        instance = self.get_object()
        was_completed = instance.completed
        
        visit = serializer.save()
        
        # If visit is marked as completed now, or notes were updated on a completed visit
        if visit.completed and visit.notes:
            # Create or update AI Insight
            ai_data = MockAIService.analyze_visit_notes(visit.notes)
            AIInsight.objects.update_or_create(
                visit=visit,
                defaults={
                    'original_notes': visit.notes,
                    'summary': ai_data['summary'],
                    'risk_flag': ai_data['risk_flag'],
                    'suggested_action': ai_data['suggested_action']
                }
            )

        if not was_completed and visit.completed:
            ActivityLog.objects.create(
                user=self.request.user,
                action='VISIT_COMPLETED',
                description=f"Visit completed for task '{visit.task.title}'."
            )

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Attendance.objects.all()
        return Attendance.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def clock_out(self, request):
        attendance = Attendance.objects.filter(user=request.user, check_out__isnull=True).last()
        if not attendance:
            return Response({'error': 'No active session found.'}, status=status.HTTP_400_BAD_REQUEST)
        attendance.check_out = timezone.now()
        attendance.save()
        return Response({'status': 'clocked out'})

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Expense.objects.all()
        return Expense.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        expense = self.get_object()
        expense.status = 'APPROVED'
        expense.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        expense = self.get_object()
        expense.status = 'REJECTED'
        expense.save()
        return Response({'status': 'rejected'})

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('-timestamp')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'AUDITOR']:
            return ActivityLog.objects.all().order_by('-created_at')
        if user.role in ['REGIONAL_MANAGER', 'TEAM_LEAD'] and user.region:
            # Users in their region
            region_users = User.objects.filter(region=user.region)
            return ActivityLog.objects.filter(user__in=region_users).order_by('-created_at')
        return ActivityLog.objects.filter(user=user).order_by('-created_at')

class ReportViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        user = request.user
        
        # Base querysets
        if user.role in ['ADMIN', 'AUDITOR']:
            tasks = Task.objects.all()
            visits = Visit.objects.all()
        elif user.role in ['REGIONAL_MANAGER', 'TEAM_LEAD'] and user.region:
            tasks = Task.objects.filter(region=user.region)
            visits = Visit.objects.filter(task__region=user.region)
        elif user.role == 'FIELD_AGENT':
            tasks = Task.objects.filter(assigned_to=user)
            visits = Visit.objects.filter(agent=user)
        else:
            tasks = Task.objects.none()
            visits = Visit.objects.none()

        # 1. Pending tasks by region or team
        pending_tasks_by_region = list(
            Task.objects.filter(status='PENDING')
            .values('region__name')
            .annotate(count=Count('id'))
        )

        # 2. Task status distribution
        task_status_distribution = list(
            tasks.values('status').annotate(count=Count('id'))
        )
        
        # 3. Visits completed in the last 7 days
        from django.utils import timezone
        import datetime
        seven_days_ago = timezone.now() - datetime.timedelta(days=7)
        recent_visits = visits.filter(completed=True, end_time__gte=seven_days_ago).count()

        # 4. Top Performing Agents (Based on completed visits)
        top_agents = []
        if user.role in ['ADMIN', 'REGIONAL_MANAGER', 'TEAM_LEAD']:
            top_agents = list(
                visits.filter(completed=True)
                .values('agent__username')
                .annotate(completed_count=Count('id'))
                .order_by('-completed_count')[:5]
            )

        # 5. Delayed/Stale Tasks (Pending for more than 3 days)
        three_days_ago = timezone.now() - datetime.timedelta(days=3)
        delayed_tasks_count = tasks.filter(status='PENDING', created_at__lt=three_days_ago).count()

        return Response({
            'pending_tasks_by_region': pending_tasks_by_region,
            'task_status_distribution': task_status_distribution,
            'recent_completed_visits': recent_visits,
            'total_tasks': tasks.count(),
            'total_visits': visits.count(),
            'top_agents': top_agents,
            'delayed_tasks_count': delayed_tasks_count
        })
