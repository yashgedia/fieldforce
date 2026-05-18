from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Region, Task, Visit, Attendance, Expense, Message, AIInsight, ActivityLog

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['id', 'username', 'email', 'role', 'region', 'is_staff', 'is_active']
    list_display_links = ['id', 'username']
    search_fields = ['username', 'email']
    list_filter = ['role', 'region', 'is_staff', 'is_active']
    ordering = ['id']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'region')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'region')}),
    )

class RegionAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'description']
    list_display_links = ['id', 'name']
    search_fields = ['name']
    ordering = ['id']

class TaskAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'assigned_to', 'assigned_by', 'region', 'status', 'created_at']
    list_display_links = ['id', 'title']
    search_fields = ['title', 'description', 'assigned_to__username', 'assigned_by__username']
    list_filter = ['status', 'region', 'created_at']
    ordering = ['id']

class VisitAdmin(admin.ModelAdmin):
    list_display = ['id', 'task', 'agent', 'completed', 'start_time', 'end_time', 'created_at']
    list_display_links = ['id', 'task']
    search_fields = ['task__title', 'agent__username', 'notes', 'outcome']
    list_filter = ['completed', 'created_at']
    ordering = ['id']

class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'check_in', 'check_out']
    list_display_links = ['id', 'user']
    search_fields = ['user__username']
    list_filter = ['check_in']
    ordering = ['id']

class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'category', 'status', 'created_at']
    list_display_links = ['id', 'user']
    search_fields = ['user__username', 'description']
    list_filter = ['category', 'status', 'created_at']
    ordering = ['id']

class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'receiver', 'content', 'is_read', 'timestamp']
    list_display_links = ['id', 'sender']
    search_fields = ['sender__username', 'receiver__username', 'content']
    list_filter = ['is_read', 'timestamp']
    ordering = ['id']

class AIInsightAdmin(admin.ModelAdmin):
    list_display = ['id', 'visit', 'risk_flag', 'created_at']
    list_display_links = ['id', 'visit']
    search_fields = ['visit__task__title', 'summary', 'risk_flag', 'suggested_action']
    list_filter = ['risk_flag', 'created_at']
    ordering = ['id']

class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'action', 'description', 'created_at']
    list_display_links = ['id', 'user']
    search_fields = ['user__username', 'description']
    list_filter = ['action', 'created_at']
    ordering = ['id']

admin.site.register(User, CustomUserAdmin)
admin.site.register(Region, RegionAdmin)
admin.site.register(Task, TaskAdmin)
admin.site.register(Visit, VisitAdmin)
admin.site.register(Attendance, AttendanceAdmin)
admin.site.register(Expense, ExpenseAdmin)
admin.site.register(Message, MessageAdmin)
admin.site.register(AIInsight, AIInsightAdmin)
admin.site.register(ActivityLog, ActivityLogAdmin)

