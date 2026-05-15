import os
import django
import random
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from field_force.models import Task, Region, Attendance, Expense, Visit, User, AIInsight

def seed():
    print("Initializing Enterprise Personnel Directory...")
    
    # Get or create regions
    regions_names = ['Mumbai North', 'Delhi NCR', 'Bangalore Tech Park', 'Pune IT Hub']
    region_objs = []
    for r in regions_names:
        obj, _ = Region.objects.get_or_create(name=r)
        region_objs.append(obj)

    # Create Demo Users if needed
    demo_users = [
        {'username': 'rahul_lead', 'role': 'TEAM_LEAD', 'email': 'rahul@fieldforce.ai'},
        {'username': 'priya_agent', 'role': 'FIELD_AGENT', 'email': 'priya@fieldforce.ai'},
        {'username': 'amit_manager', 'role': 'REGIONAL_MANAGER', 'email': 'amit@fieldforce.ai'},
        {'username': 'neha_audit', 'role': 'AUDITOR', 'email': 'neha@fieldforce.ai'},
        {'username': 'vikram_agent', 'role': 'FIELD_AGENT', 'email': 'vikram@fieldforce.ai'}
    ]

    for u_data in demo_users:
        user, created = User.objects.get_or_create(
            username=u_data['username'],
            defaults={
                'email': u_data['email'],
                'role': u_data['role'],
                'region': random.choice(region_objs),
                'is_active': True
            }
        )
        if created:
            user.set_password('admin123')
            user.save()
            print(f"Created demo user: {user.username}")

    # Refresh user list
    users = User.objects.filter(is_active=True)
    if not users:
        print("Failed to initialize users.")
        return

    print("Seeding operational data...")
    
    # Seed Attendance (Last 7 days)
    for user in users:
        # Only seed if no attendance exists to avoid bloat
        if not Attendance.objects.filter(user=user).exists():
            for i in range(7):
                date = timezone.now() - timedelta(days=i)
                check_in = date.replace(hour=random.randint(8, 10), minute=random.randint(0, 59))
                check_out = date.replace(hour=random.randint(17, 19), minute=random.randint(0, 59))
                
                Attendance.objects.create(
                    user=user,
                    check_in=check_in,
                    check_out=check_out,
                    latitude=19.0760 + (random.random() * 0.1),
                    longitude=72.8777 + (random.random() * 0.1)
                )

    # Seed Tasks & Visits (Only 5 new tasks)
    task_titles = [
        'ATM Maintenance - Sector 12',
        'Retail Audit - Phoenix Mall',
        'Inventory Check - Warehouse A',
        'Client Site Survey - Tech Park',
        'Fiber Line Repair - MG Road'
    ]

    for i in range(5):
        user = random.choice(users)
        region = random.choice(region_objs)
        task = Task.objects.create(
            title=random.choice(task_titles) + f" (Ref: {random.randint(1000, 9999)})",
            description="Perform a comprehensive check-up of the equipment and verify the serial numbers. Document any anomalies found during the inspection.",
            assigned_to=user,
            region=region,
            status='COMPLETED'
        )

        start_time = timezone.now() - timedelta(hours=random.randint(5, 50))
        end_time = start_time + timedelta(hours=2)
        
        visit = Visit.objects.create(
            task=task,
            agent=user,
            start_time=start_time,
            end_time=end_time,
            notes="Completed the inspection. All parameters are within the acceptable range. Client was satisfied.",
            completed=True,
            client_rating=random.randint(4, 5)
        )
        
        AIInsight.objects.create(
            visit=visit,
            original_notes=visit.notes,
            summary="Visit executed efficiently. Productivity metrics within high-threshold.",
            risk_flag="LOW",
            suggested_action="Log as successful execution."
        )

    print("Success! Enterprise directory is now fully populated.")

if __name__ == "__main__":
    seed()
