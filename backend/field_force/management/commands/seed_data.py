from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from field_force.models import User, Region, Task, Visit

class Command(BaseCommand):
    help = 'Seed the database with initial users and data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Create Regions
        north_region, _ = Region.objects.get_or_create(name='North Zone', description='Northern operating area')
        south_region, _ = Region.objects.get_or_create(name='South Zone', description='Southern operating area')

        # 2. Create Users
        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@test.com',
                'password': make_password('password123'),
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True
            }
        )

        rm_north, _ = User.objects.get_or_create(
            username='rm_north',
            defaults={
                'email': 'rm_north@test.com',
                'password': make_password('password123'),
                'role': 'REGIONAL_MANAGER',
                'region': north_region
            }
        )

        tl_north, _ = User.objects.get_or_create(
            username='tl_north',
            defaults={
                'email': 'tl_north@test.com',
                'password': make_password('password123'),
                'role': 'TEAM_LEAD',
                'region': north_region
            }
        )

        agent_1, _ = User.objects.get_or_create(
            username='agent1',
            defaults={
                'email': 'agent1@test.com',
                'password': make_password('password123'),
                'role': 'FIELD_AGENT',
                'region': north_region
            }
        )

        auditor, _ = User.objects.get_or_create(
            username='auditor',
            defaults={
                'email': 'auditor@test.com',
                'password': make_password('password123'),
                'role': 'AUDITOR'
            }
        )

        # 3. Create Tasks
        task1, _ = Task.objects.get_or_create(
            title='Store Inspection - Branch A',
            defaults={
                'description': 'Inspect inventory and display at Branch A.',
                'assigned_to': agent_1,
                'assigned_by': tl_north,
                'region': north_region,
                'status': 'PENDING'
            }
        )

        task2, _ = Task.objects.get_or_create(
            title='Client Meeting - Alpha Corp',
            defaults={
                'description': 'Discuss renewal of the maintenance contract.',
                'assigned_to': agent_1,
                'assigned_by': rm_north,
                'region': north_region,
                'status': 'IN_PROGRESS'
            }
        )

        # 4. Create Visits
        Visit.objects.get_or_create(
            task=task2,
            agent=agent_1,
            defaults={
                'notes': 'Met with client. Discussed issues. They are unhappy with the delay in service.',
                'outcome': 'Pending renewal',
                'completed': False
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded data'))
