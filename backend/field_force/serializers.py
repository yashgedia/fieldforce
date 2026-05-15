from rest_framework import serializers
from .models import User, Region, Task, Visit, ActivityLog, AIInsight, Attendance, Expense, Message

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'region', 'is_active')
        read_only_fields = ('id',)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role='FIELD_AGENT'  # Default role
        )
        return user

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = '__all__'

class AIInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInsight
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class VisitSerializer(serializers.ModelSerializer):
    ai_insight = AIInsightSerializer(read_only=True)
    agent_name = serializers.CharField(source='agent.username', read_only=True)

    class Meta:
        model = Visit
        fields = ('id', 'task', 'agent', 'agent_name', 'start_time', 'end_time', 'notes', 'outcome', 'attachment', 'signature', 'client_rating', 'completed', 'created_at', 'ai_insight')
        read_only_fields = ('id', 'created_at', 'agent')

class TaskSerializer(serializers.ModelSerializer):
    visits = VisitSerializer(many=True, read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.username', read_only=True)
    region_name = serializers.CharField(source='region.name', read_only=True)

    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'assigned_to', 'assigned_to_name', 'assigned_by', 'assigned_by_name', 'region', 'region_name', 'latitude', 'longitude', 'status', 'created_at', 'updated_at', 'visits')
        read_only_fields = ('id', 'created_at', 'updated_at', 'assigned_by')

class AttendanceSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ('id', 'check_in', 'user')

class ExpenseSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'user', 'status')

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('id', 'timestamp', 'sender', 'is_read')

class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ('id', 'user', 'user_name', 'action', 'description', 'created_at')
        read_only_fields = ('id', 'created_at')
