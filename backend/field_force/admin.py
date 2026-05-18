from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Region, Task, Visit, Attendance, Expense, Message, AIInsight, ActivityLog

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'role', 'region', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'region')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'region')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Region)
admin.site.register(Task)
admin.site.register(Visit)
admin.site.register(Attendance)
admin.site.register(Expense)
admin.site.register(Message)
admin.site.register(AIInsight)
admin.site.register(ActivityLog)
