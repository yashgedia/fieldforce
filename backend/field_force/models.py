from django.db import models
from django.contrib.auth.models import AbstractUser

class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('REGIONAL_MANAGER', 'Regional Manager'),
        ('TEAM_LEAD', 'Team Lead'),
        ('FIELD_AGENT', 'Field Agent'),
        ('AUDITOR', 'Auditor'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='FIELD_AGENT')
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Task(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_tasks')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_tasks')
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name='tasks')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Visit(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='visits')
    agent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='visits')
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    outcome = models.CharField(max_length=255, blank=True)
    attachment = models.FileField(upload_to='visit_attachments/', null=True, blank=True)
    signature = models.ImageField(upload_to='signatures/', null=True, blank=True)
    client_rating = models.IntegerField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Visit for {self.task.title} by {self.agent.username}"

class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_logs')
    check_in = models.DateTimeField(auto_now_add=True)
    check_out = models.DateTimeField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.check_in}"

class Expense(models.Model):
    CATEGORY_CHOICES = (
        ('TRAVEL', 'Travel/Fuel'),
        ('FOOD', 'Food'),
        ('MAINTENANCE', 'Maintenance'),
        ('OTHER', 'Other'),
    )
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField()
    receipt = models.ImageField(upload_to='expenses/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)


class AIInsight(models.Model):
    visit = models.OneToOneField(Visit, on_delete=models.CASCADE, related_name='ai_insight')
    original_notes = models.TextField()
    summary = models.TextField()
    risk_flag = models.CharField(max_length=50)
    suggested_action = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Insight for Visit {self.visit.id}"

class ActivityLog(models.Model):
    ACTION_CHOICES = (
        ('TASK_CREATED', 'Task Created'),
        ('TASK_ASSIGNED', 'Task Assigned'),
        ('TASK_STATUS_CHANGED', 'Task Status Changed'),
        ('VISIT_STARTED', 'Visit Started'),
        ('VISIT_COMPLETED', 'Visit Completed'),
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='activity_logs')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.get_action_display()} at {self.created_at}"
